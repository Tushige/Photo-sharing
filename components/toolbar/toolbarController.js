'use strict';

cs142App.controller("ToolbarController",
    ['$rootScope',
     '$scope',
     '$routeParams',
     '$resource',
     '$location',
     '$http',
    function($rootScope, $scope, $routeParams, $resource, $location, $http) {
        /* $routeParams is filled asynchronously,
         * we read it once it is populated
         */
        $scope.status = {
            isUserPresent: false
        };
        $scope.selectedPhotoFile = null;
        /*
         * display user detail page's username on the toolbar
         */
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
        };
        /**
         * invoked when user selects a file
         */
        $scope.inputFileNameChanged = function(ev) {
            $scope.selectedPhotoFile = ev.target.files[0];
        };
        /**
         * uploads the user selected file
         */
        $scope.uploadPhoto = function() {
            if (!$scope.selectedPhotoFile) {
                alert("no attachment found!");
                return;
            }
            const domForm = new FormData();
            domForm.append('uploadedPhoto', $scope.selectedPhotoFile);
            // need to send AJAX request
            $http.post('/photos/new', domForm, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).then(function success(res) {
                alert('successfully uploaded photo!');
            }).catch(function failure(err) {
                console.error(err);
            });
        }
}]);
/**
 * custom directive that attaches an onchange listener to the file input element
 * angular doesn't handle file listener
 */
cs142App.directive('myFileChange', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            const onChangeHandler = scope[attrs.myFileChange];
            element.on('change', onChangeHandler);
        }
    };
});
