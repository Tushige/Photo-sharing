'use strict';

cs142App.controller('UserPhotosController', ['$rootScope', '$scope', '$routeParams', '$resource', '$mdDialog',
  function($rootScope, $scope, $routeParams, $resource, $mdDialog) {
    /*
     * Since the route is specified as '/photos/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    var userId = $routeParams.userId;
    const userUrl = `user/${userId}`;
    const photosUrl = `photosOfUser/${userId}`;
    $scope.user = null;
    $scope.photos = null;

    const userResource = $resource(userUrl);
    userResource.get({}, function(user) {
        $scope.user = user;
    });

    const photosResource = $resource(photosUrl);
    photosResource.query(function(photos) {
        $scope.photos = photos;
        console.log(photos);
    });
    /**
     * spawns a dialog box to add comment
     */
    $scope.addComment = function(ev, photo_id) {
        console.log('addComment says photo_id is ', photo_id);
        $mdDialog.show({
            controller: 'CommentDialogController',
            bindToController: true,
            templateUrl: 'components/comment-dialog/comment-dialogTemplate.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: $scope.customFullscreen,
            locals: { // injects into the controller
                photoState : {photo_id: photo_id}
            }
        });
    };
  }]);
