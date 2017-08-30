'use strict';

cs142App.controller('Login-registerController',
    ['$rootScope',
     '$scope',
     '$resource',
     '$location',
    function($rootScope, $scope, $resource, $location) {
        $scope.credentials = {
            username: ''
        };
        $scope.loginHandler = function() {
            console.log('submitting login request');
            const loginUrl = '/admin/login';
            const params = {};
            const actions = {'login' : {method:'POST', isArray:false}};
            const loginResource = $resource(loginUrl, params, actions);
            loginResource.login({login_name:$scope.credentials.username}, function(user) {
                if (!user) {
                    console.error("login failed because no user");
                    return;
                }
                $rootScope.user = user;
                $location.path('/user/list');
            }, function(err) {
                console.error(err);
            });
        }
    }]);
