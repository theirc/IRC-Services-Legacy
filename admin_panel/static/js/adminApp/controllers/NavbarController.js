/**
 * Created by reyrodrigues on 1/3/17.
 */

angular.module('adminApp')
    .controller('NavbarController', function (AuthService, $cookies, $rootScope, $state, ProviderService) {
        var vm = this;

        vm.userUpdate = $rootScope.user;

        vm.logout = function(){
            AuthService.logout().then(function(){
                document.location = '/logout/';
            });
        };

        $rootScope.showProvider = $rootScope.selectedProvider.id ? true : false;

        vm.impersonate = function (provider) {
            if ($rootScope.selectedProvider) {
                $rootScope.selectedProvider = provider;               
                $state.reload();
            } else {
                $rootScope.selectedProvider = provider;
                $state.go('service.dashboard');
            }
        };
        vm.stopImpersonate = function(){
            ProviderService.stopImpersonateProvider().then(() => {
                $rootScope.selectedProvider = {};
                $rootScope.showProvider = false;                
                $state.reload();
            });
        }
    })
;