'use strict';

cs142App.controller('LoginController',
    ['$rootScope',
     '$scope',
     '$resource',
     '$location',
    function($rootScope, $scope, $resource, $location) {
        $scope.credentials = {
            username: ''
        };
        $scope.loginHandler = function() {
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
                alert('failed to login');
            });
        }
    }]);
