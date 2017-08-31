cs142App.controller('RegisterController',
    ['$scope',
    function($scope) {
        $scope.submission = {
            username:'',
            password:'',
            verify_password: '',
            first_name:'',
            last_name:'',
            location:'',
            description:'',
            occupation:''
        };
        $scope.checkPassword = function() {
            if ($scope.registrationForm.password.$modelValue !== $scope.registrationForm.verify_password.$modelValue) {
                $scope.registrationForm.verify_password.$setValidity('verificationError', false);
            } else {
                $scope.registrationForm.verify_password.$setValidity('verificationError', true);
            }
        }
        /**
         * registers user
         */
        $scope.submitHandler = function(ev) {
            console.log('submitting registration');
        }
    }]);
