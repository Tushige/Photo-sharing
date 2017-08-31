'use strict';

var cs142App = angular.module('cs142App', ['ngRoute', 'ngMaterial', 'ngResource']);

cs142App.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            when('/users/:userId', {
                templateUrl: 'components/user-detail/user-detailTemplate.html',
                controller: 'UserDetailController'
            }).
            when('/photos/:userId', {
                templateUrl: 'components/user-photos/user-photosTemplate.html',
                controller: 'UserPhotosController'
            }).
            when('/register', {
                templateUrl: 'components/register/registerTemplate.html',
                controller: 'registerController'
            }).
            when('/login', {
                templateUrl: 'components/login/loginTemplate.html',
                controller:'LoginController'
            }).
            otherwise({
                redirectTo: '/users'
            });
    }]);

cs142App.config(['$resourceProvider', function($resourceProvider) {
  // Don't strip trailing slashes from calculated URLs
  $resourceProvider.defaults.stripTrailingSlashes = false;
}]);
cs142App.controller('MainController', ['$scope', '$rootScope', '$location', '$resource',
    function ($scope, $rootScope, $location, $resource) {
        $scope.main = {};
        //$rootScope.user = null;
        $scope.main.title = 'Users';
        /**
         * We force redirect to login-register view when user is not logged in
         * @param $routeChangeStart (Event) : broadcasted before a route change
         */
        $rootScope.$on('$routeChangeStart', function(angularEvent, next, current) {
            if (!$rootScope.isLoggedIn()) {
                if (next.templateUrl !== 'components/register/registerTemplate.html' &&
                    next.templateUrl !== 'components/login/loginTemplate.html') {
                    $location.path('/register');
                }
            }
        });

        /**
         * executes on transitions:
         * 1. logged out -> logged in
         * 2. logged in  -> logged out
         * On transition 1, broadcasts event 'logged-in' to children scopes
         * On transition 2, broadcasts event 'logged-out' to children scopes.
         * children scopes adjust their views in response to the presence of a user.
         */
        $rootScope.$watch('user', function(newVal, oldVal) {
            if (!oldVal && newVal) {
                $rootScope.$broadcast('logged-in');
            } else if (oldVal && !newVal) {
                $rootScope.$broadcast('logged-out');
            }
        });

        /**
         * @return (boolean) : true if user is logged in
         *                     false otherwise
         */
        $rootScope.isLoggedIn = function() {
            return $rootScope.user ? true : false;
        }
}]);
