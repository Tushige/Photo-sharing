"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project7'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 * /admin/login   -  logs in a user.
 *                -  sends back 400 if login fails.
 * /admin/logout
 *
 */

var mongoose = require('mongoose');
var async = require('async');
var fs = require('fs');
const cs142password = require('./cs142password.js');
/*
 * NOTE: session data is stored server-side.
 *       session id is stored in cookie
 */
var session = require('express-session');
var bodyParser = require('body-parser');
/*
 * we use multer to process a POST request with form containing a file.
 * bodyParser cannot handle it.
 */
var multer = require('multer');

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');

var express = require('express');
var app = express();

mongoose.connect('mongodb://localhost/cs142project7');

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));

app.use(session({secret: 'secretKey', resave:false, saveUninitialized: false}));

/**
 * middleware that only parses JSON, and only looks at requests where the
 * <Contet-Type> header matches the <type> option.
 * i.e. Content-Type : 'Apllication/json'
 *
 * A new <body> object containing the parsed data is populated on the <request>
 * object after the middleware)
 */
app.use(bodyParser.json());

/**
 * @param processFormBody (function)
 *
 */
var processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedPhoto');

app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }
            // We got the object - return it in JSON format.
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.count({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    if (!request.session.user) {
        response.status(401).end('unauthorized');
        return;
    }
    User.find({}, function(err, users) {
        if (err) {
            response.status(500).send(JSON.stringify(err));
        }
        /**
         * In anticipation of large number of users, select fields that are
         * needed by the app's navigation bar only.
         */
        const usersList = users.map((user) =>{
            return {
                _id: user._id,
                first_name: user.first_name,
                last_name: user.last_name
            };
        });
        response.status(200).send(JSON.stringify(usersList));
    });
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    if (!request.session.user) {
        response.status(401).send('unauthorized');
        return;
    }
    var id = request.params.id;
    const numParam = Object.keys(request.params).length;
    if (!id || numParam > 1) {
        response.status(400).end('invalid query parameters');
        return;
    }
    User.findOne({_id: id}, function(err, userObj) {
        if (err) {
            response.status(400).end(JSON.stringify(err));
            return;
        }
        if (!userObj) {
            response.status(400).end("user not found!");
            return;
        }
        // we select fields we want
        const user = {
            _id: userObj._id,
            first_name : userObj.first_name,
            last_name : userObj.last_name,
            location : userObj.location,
            description : userObj.description,
            occupation : userObj.occupation
        }
        response.status(200).send(JSON.stringify(user));
    });
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    if (!request.session.user) {
        response.status(401).send('unauthorized');
        return;
    }
    var id = request.params.id;;
    const numParam = Object.keys(request.params).length;
    if (!id || numParam > 1) {
        response.status(400).end('invalid query parameters');
        return;
    }
    // photosList : array of photos submitted by user with given id
    Photo.find({user_id : id}, function(err, photosList) {
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
        else if (!photosList) {
            response.status(400).send(JSON.stringify("no photos"));
            return;
        }

        /*
         * for each photo object, we add user object to each of the comment
         * in the photo's comments array
         * photo -> comments -> comment <- user
         */
        async.map(photosList, updateCommentsOfPhotoAsync,
            /* invoked when updateCommentsOfPhotoAsync is done processing
             * every object in photosList
             * Every result of updateCommentsOfPhotoAsync is collected in newPhotos
             */
            function doneAllPhotos(err, newPhotos) {
                if (err) {
                    response.status(500).send(JSON.stringify(err));
                    return;
                }
                response.status(200).send(JSON.stringify(newPhotos));
            });
    });
});
/**
 * Async function that creates a new photo object
 */
function updateCommentsOfPhotoAsync(photo, donePhotoUpdate) {
    // add user to each comment in the list of comments for each photo
    async.map(photo.comments, addUserToComment,
        /* invoked when addUserToComment is done processing every comment in photo.comments
         * Every result of addUserToComment is collected in newComments
         */
        function doneCommentsUpdate(err, newComments) {
            /*
             * we can't directly make changes to the Model object, so we make a copy
             * and make our changes there.
             */
            const newPhoto = JSON.parse(JSON.stringify(photo));
            // front-end doesn't care about mongoDB assigned version number
            delete newPhoto.__v;
            newPhoto.comments = newComments;
            // indicate that our photo is done updating
            donePhotoUpdate(null, newPhoto);
    });
}
/*
 * async function that adds a comment's user to the comment Model object.
 * callback(err, comment) is called upon completion, where comment is the new
 * comment object.
 * NOTE: we have to copy the comment object to a new object in order to make changes
 * because it turns out mongoose doesn't allow changes to the Model
 */
function addUserToComment(comment, doneCommentUpdate) {
    const id = comment.user_id;
    User.findOne({_id: id}, function(err, user) {
        if (err) {
            callback("failed to fetch commentor", null);
            return;
        }
        /**
         * pick only the required fields
         */
        const minifiedUser = {
            _id : user._id,
            first_name: user.first_name,
            last_name: user.last_name
        };
        const commentWithUser = JSON.parse(JSON.stringify(comment));
        commentWithUser.user = minifiedUser;
        // don't need user_id since we have user field
        delete commentWithUser.user_id;
        doneCommentUpdate(null, commentWithUser);
    });
}
/**
 * logs in a user
 * expectations: following properties must be found in the body
 *  1. login_name
 *  2. password
 * @return: on successful login, sends user object in the response body
 */
app.post('/admin/login', function(req, res) {
    // 1. retrieve user credentials from the body
    const username = req.body.login_name;
    const password = req.body.password;
    // 2. check if user with given credentials exists
    User.findOne({
        login_name: username,
    }, function(err, user) {
        if (err) {
            res.status(500).end('Something went wrong. Please try again');
            return;
        }
        // check if passwords match
        const passwordMatch = cs142password.doesPasswordMatch(user.password_digest, user.salt, password);
        if (!user || !passwordMatch) { // user not found
            res.status(400).end('one or more fields are incorrect!');
            return;
        }
        // 3. good - save user in express session
        req.session.user = user;
        res.status(200).end(JSON.stringify(user));
    });
});

/**
 * logs user out by destroying current session object
 */
app.post('/admin/logout', function(req, res) {
    if (req.session.user) {
        req.session.destroy(function(err) {
            if (err) {
                res.status(500).end(JSON.stringify(err));
                return;
            }
            res.status(200).end();
        });
    } else { // return 400 if no logged in user
        res.status(400).end();
    }
});

/**
 * posts a photo comment
 * expects a 'comment' property in body field
 * comment (object) - must have the following fields
 *  1. user_id (string)
 *  2. date_time (string)
 *  3. comment text (string)
 * If the comment text is empty, rejects with a status of 400 (Bad request)
 */
app.post('/commentsOfPhoto/:photo_id', function(req, res) {
    const photo_id = req.params.photo_id;
    const commentObj = req.body.comment;
    if (!commentObj.comment) {
        res.status(400).end();
        return;
    }
    Photo.findOne({_id: photo_id}, function(err, photo) {
        if (err) {
            res.status(500).end(JSON.stringify(err));
            return;
        }
        const newComment = {
            user_id : commentObj.user_id,
            date_time: commentObj.date_time,
            comment: commentObj.comment
        };
        photo.comments.push(newComment);
        photo.save();
        res.status(200).end();
    });
});

/**
 * uploads a photo for the current user
 * responds with status 400 if photo file is absent
 */
app.post('/photos/new', function(req, res) {
    processFormBody(req, res, function(err) {
        if (err) {
            res.status(400).end(JSON.string(err));
            return;
        } else if (!req.file) {
            res.status(400).end('file not found');
            return;
        }
        // request.file has the following properties of interest
        //      fieldname      - Should be 'uploadedphoto' since that is what we sent
        //      originalname:  - The name of the file the user uploaded
        //      mimetype:      - The mimetype of the image (e.g. 'image/jpeg',  'image/png')
        //      buffer:        - A node Buffer containing the contents of the file
        //      size:          - The size of the file in bytes
        const timestamp = new Date().valueOf();
        const filename = 'U' + String(timestamp) + req.file.originalname;
        // write the file to images directory
        fs.writeFile('./images/'+filename, req.file.buffer, function(err) {
            if (err) {
                res.status(500).end('problem saving file');
                return;
            }
            // create the photo object in the database
            Photo.create({
                file_name: filename,
                date_time: timestamp,
                user_id: req.session.user._id,
                comments: []
            }, function(err, photoObj) { // invoked when photo object is created
                photoObj.save();
                res.status(200).end();
            });
        });
    });
});
/**
 * registers a new user.
 *
 * expects the following in the body:
 * 1. login_name (required)
 * 2. password (required)
 * 3. first_name (required)
 * 4. last_name (required)
 * 5. location (optional)
 * 6. description (optional)
 * 7. occupation (optional)
 * @return:
 * If any of the above expectations are not met, responds with status of 400
 * if username is taken, responds with status of 409
 */
app.post('/user', function(req, res) {
    if (!req.body.login_name || !req.body.password || !req.body.first_name || !req.body.last_name) {
        res.status(400).end('required fields are missing');
        return;
    }
    /**
     * don't register if login_name is unavailable
     */
    User.findOne({login_name: newUser.login_name}, function(err, userObj) {
        if (userObj) {
            res.status(409).end('username is taken');
            return;
        }
    });
    const password = cs142password.makePasswordEntry(req.body.password);
    const newUser = {
            login_name: req.body.login_name,
            password_digest: password.hash,
            salt: password.salt,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            location: req.body.location? req.body.location : '',
            description: req.body.description? req.body.description : '',
            occupation: req.body.occupation ? req.body.occupation : ''
    };

    /**
     * save new user in the DB
     */
    User.create(newUser, function(err, userObj) {
        if (err) {
            res.status(500).end('user registration failed');
            return;
        }
        userObj.save();
        res.status(200).end(JSON.stringify(userObj));
    })
});

var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});
