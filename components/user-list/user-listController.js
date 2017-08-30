'use strict';

cs142App.controller('UserListController',
    ['$rootScope',
     '$scope',
     '$resource',
    function ($rootScope, $scope, $resource) {
        $scope.title = {
            text: ''
        };

        /**
         * retrieve list of users from backend server when user is logged in
         */
        $scope.$on('logged-in', function() {
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
        });
        $scope.$on('logged-out', function() {
            $scope.users = null;
            $scope.title.text = '';
        })
    }]);
