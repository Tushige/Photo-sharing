cs142App.controller('CommentDialogController', [
    '$rootScope',
    '$scope',
    '$mdDialog',
    '$resource',
    '$routeParams',
    'photoState',
    function ($rootScope, $scope, $mdDialog, $resource, $routeParams, photoState) {
        $scope.state = {
            comment : ''
        };
        $scope.submitComment = function() {
            const photo_id = photoState.photo_id;
            const now = Date.now();
            const user_id = $rootScope.user._id;
            const commentObj = {
                user_id: user_id,
                date_time: now,
                comment: $scope.state.comment
            };
            const commentUrl = `commentsOfPhoto/${photo_id}`;
            const params = {};
            const actions = {'postComment': {method: 'POST', isArray: false}};
            const commentResource = $resource(commentUrl, params, actions);
            commentResource.postComment({comment: commentObj}, function(res) {
                // comment submission is successful
                $scope.cancelDialog();
            }, function(err) {
                console.error(err);
            });
        }
        /**
         * when close button is pressed, comment dialog is closed
         */
        $scope.cancelDialog = function() {
            $mdDialog.cancel();
        }
    }]);
