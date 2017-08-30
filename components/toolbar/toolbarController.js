'use strict';

cs142App.controller("ToolbarController",
    ['$rootScope',
     '$scope',
     '$routeParams',
     '$resource',
     '$location',
    function($rootScope, $scope, $routeParams, $resource, $location) {
        /* $routeParams is filled asynchronously,
         * we read it once it is populated
         */
        $scope.status = {
            isUserPresent: false
        };
        $scope.$on('$routeChangeSuccess', function() {
            if (!$rootScope.isLoggedIn()) {
                $scope.status.isUserPresent = false;
                return;
            }
            $scope.status.isUserPresent = true;
            const userId = $routeParams.userId;
            if (!userId) return;
            const url = `/user/${userId}`;
            $scope.user = null;
            const userResource = $resource(url);
            userResource.get(function(user) {
                $scope.user = user;
            });
        });
        /**
         * logs user out when user clicks on 'log out' button
         */
        $scope.logOut = function() {
            /*
             * removes the global user object
             */
            const logOutUrl = '/admin/logout';
            const params = {};
            const actions = {'logout' : {method:'POST', isArray:false}};
            const authResource = $resource(logOutUrl, params, actions);
            authResource.logout({}, function() {
                $rootScope.user = null;
                $location.path('/login-register');
            }, function(err) {
                if (err) {
                    console.log(err);
                    return;
                }
            });
        }
}]);
