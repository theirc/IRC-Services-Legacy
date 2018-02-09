/**
 * Created by reyrodrigues on 1/3/17.
 */

angular.module('adminApp')
    .controller('NavbarController', function (AuthService, $cookies, $rootScope, $state) {
        var vm = this;

        $rootScope.user = $cookies.getObject('user');

        vm.userUpdate = $rootScope.user;

        vm.logout = function(){
            AuthService.logout().then(function(){
                document.location = '/';
            });
        };

        vm.impersonate = function (provider) {
            if ($rootScope.selectedProvider) {
                $rootScope.selectedProvider = provider;
                $state.reload();
            } else {
                $rootScope.selectedProvider = provider;
                $state.go('service.dashboard');
            }
        };
    })
;