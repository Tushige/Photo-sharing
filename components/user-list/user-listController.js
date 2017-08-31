'use strict';

cs142App.controller('UserListController',
    ['$rootScope',
     '$scope',
     '$resource',
    function ($rootScope, $scope, $resource) {
        $scope.populateFriends = function() {
            $scope.title = {
                text: ''
            };
            // grab users from the model
            $scope.users = null;
            $scope.title.text = 'Friends';
            const url = "/user/list";
            const usersResource = $resource(url);
            usersResource.query(function(users) {
                $scope.users = users;
            }, function(err) {
                console.error(err);
            });
        };
        if ($rootScope.isLoggedIn()) {
            $scope.populateFriends();
        }
        /**
         * retrieve list of users from backend server when user is logged in
         */
        $scope.$on('logged-in', function() {
            $scope.populateFriends();
        });
        $scope.$on('logged-out', function() {
            $scope.users = null;
            $scope.title.text = '';
        })
    }]);
