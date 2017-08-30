'use strict';

cs142App.controller('UserDetailController', ['$rootScope', '$scope', '$routeParams','$resource',
  function ($rootScope, $scope, $routeParams, $resource) {
    /*
     * Since the route is specified as '/users/:userId' in $routeProvider config the
     * $routeParams should have the userId property set with the path from the URL.
     */

    $scope.userId = $routeParams.userId;
    $scope.user = null;
    const url = `user/${$scope.userId}`;
    const userResource = $resource(url);
    userResource.get({}, function(user) {
        $scope.user = user;
    }, function(err) {
        console.error(err);
    });
  }]);
