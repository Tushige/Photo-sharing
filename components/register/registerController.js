cs142App.controller('RegisterController',
    ['$rootScope',
     '$scope',
     '$resource',
     '$location',
    function($rootScope, $scope, $resource, $location) {
        $scope.submission = {
            username:'',
            password:'',
            verify_password: '',
            first_name:'',
            last_name:'',
            location:'',
            description:'',
            occupation:''
        };
        /**
         * sets error message when passwords do not match
         */
        $scope.checkPassword = function() {
            if ($scope.registrationForm.password.$modelValue !== $scope.registrationForm.verify_password.$modelValue) {
                $scope.registrationForm.verify_password.$setValidity('verificationError', false);
            } else {
                $scope.registrationForm.verify_password.$setValidity('verificationError', true);
            }
        }
        /**
         * removes custom error messages when user modifies his/her input
         * if there are error messages
         */
         $scope.usernameChangeHandler = function() {
             if ($scope.registrationForm.username.$error.conflictError) {
                 $scope.registrationForm.username.$setValidity('conflictError', true);
             }
         }
        /**
         * registers user
         */
        $scope.submitHandler = function(ev) {
            // creates the User object
            const newUser = {
                login_name: $scope.submission.username,
                password: $scope.submission.password,
                first_name: $scope.submission.first_name,
                last_name: $scope.submission.last_name,
                location: $scope.submission.location,
                description: $scope.submission.description,
                occupation: $scope.submission.occupation
            };
            const params = {};
            const actions = {'registerUser': {method: 'POST', isArray: false}};
            const userResource = $resource('/user', params, actions);
            /**
             * registers the new user with the backend
             * if username is unavailable, displays error message for the user
             */
            userResource.registerUser(newUser, function success(newUser) {
                // registration successful
                $scope.login(newUser);
            }, function failure(err) {
                if (err.status === 409) {
                    $scope.registrationForm.username.$setValidity('conflictError', false);
                } else {
                    alert(err.data);
                }
            });
        }
        /**
         * logs user in
         * @param user (object) : the user object corresponding to the user logging in.
         */
        $scope.login = function(user) {
            const loginUrl = '/admin/login';
            const params = {};
            const actions = {'login' : {method:'POST', isArray:false}};
            const loginResource = $resource(loginUrl, params, actions);
            loginResource.login({
                login_name:user.login_name,
                password: user.password
            }, function success(user) {
                $rootScope.user = user;
                $location.path('/user/list');
            }, function failure(err) {
                alert(err.data);
            });
        }
    }]);
