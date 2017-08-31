'use strict';

cs142App.controller('LoginController',
    ['$rootScope',
     '$scope',
     '$resource',
     '$location',
     '$window',
    function($rootScope, $scope, $resource, $location, $window) {
        $scope.credentials = {
            username: '',
            password: ''
        };
        $scope.loginHandler = function() {
            const loginUrl = '/admin/login';
            const params = {};
            const actions = {'login' : {method:'POST', isArray:false}};
            const loginResource = $resource(loginUrl, params, actions);
            loginResource.login({
                login_name:$scope.credentials.username,
                password: $scope.credentials.password
            }, function(user) {
                if (!user) {
                    console.error("login failed because no user");
                    return;
                }
                $window.localStorage.setItem('user', user);
                $rootScope.user = user;
                $location.path('/user/list');
            }, function(err) {
                alert(err.data);
            });
        }
    }]);
