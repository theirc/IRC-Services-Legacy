angular.module('adminApp')
    .controller('ResetPasswordController', function ($state, $rootScope, $stateParams, $timeout, Restangular, $uibModalStack) {
        var vm = this;
        vm.isResetPasswordEmailSent = false;
        vm.isResetForm = false;
        vm.isChecking = $stateParams.token && $stateParams.uidb64;
        vm.userId = null;
        vm.errors = null;
        vm.messages = null;

        vm.checkUser = function () {
            let post_params = { 'token': $stateParams.token, 'uidb64': $stateParams.uidb64 };
            Restangular.all('users/reset_password_confirm/').post(post_params).then((response) => {
                vm.userId = response.userId;
                vm.isResetForm = true;
            }).catch((response) => {
                vm.errors = response.data.non_field_errors[0];
                vm.loginView();
            });
        };

        if (vm.isChecking) {
            vm.checkUser();
        }

        vm.loginViewBack = function () {
            $uibModalStack.dismissAll();
            $state.go('login');
        };

        vm.loginView = function () {
            $timeout(function() {
                $uibModalStack.dismissAll();
                $state.go('login');
            }, 5000);
        };

        vm.resetPasswordEmailSent = function () {
            vm.isResetPasswordEmailSent = true;
        };

        vm.resetPasswordEmail = function () {
            let post_params = {
                'email': vm.resetUser.email,
                'base_url': $state.href($state.current.name, $state.params, {absolute: true})
            };
            Restangular.all('users/reset_password/').post(post_params).then((response) => {
                vm.resetPasswordEmailSent();
                vm.loginView();
            }).catch((response) => {
                let errors;
                if (response.data.non_field_errors) errors = response.data.non_field_errors[0];
                else errors = response.data.email[0];
                vm.resetUser.errors = errors;
            });
        };

        vm.resetPassword = function () {

            let post_params = {
                'new_password1': vm.resetUser.new_password1,
                'new_password2': vm.resetUser.new_password2,
                'id': vm.userId
            };
            Restangular.all('users/reset_password_done/').post(post_params).then((response) => {
                vm.messages = 'Your password is now changed.';
                vm.loginView();
            }).catch((response) => {
                vm.resetUser.errors = response.data.non_field_errors[0];
            });
        };
    });
