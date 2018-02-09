angular.module('adminApp').controller('LoginController', function (AuthService, $state, $rootScope, $stateParams, $cookies, $window) {
    var vm = this;

    vm.hasPermission = function (model, action) {
        if (vm.user && vm.user.permissions && vm.user.permissions.length) {
            return !!vm.user.permissions.filter(function (permission) {
                if (model == 'analytics') {
                    return permission.split('_analytics')[0].split('.')[1] == action;
                }
                var perm = permission.split('.')[1].split('_');
                if (action == perm[0] && model == perm[1]) {
                    return permission;
                }
            }).length;
        }
    };

    vm.isStaff = function () {
        return vm.user && vm.user.isStaff;
    };

    vm.getPermissions = function () {
        AuthService.getPermissions().then((response) => {
            vm.user.permissions = response.data.permissions;
            $rootScope.permissions = {
                contentPageAdd: vm.hasPermission('contentpage', 'add') || vm.isStaff(),
                contentPageChange: vm.hasPermission('contentpage', 'change') || vm.isStaff(),
                contentPageDelete: vm.hasPermission('contentpage', 'delete') || vm.isStaff(),
                servicesAdd: vm.hasPermission('services', 'add') || vm.isStaff(),
                servicesChange: vm.hasPermission('services', 'change') || vm.isStaff(),
                servicesDelete: vm.hasPermission('services', 'delete') || vm.isStaff(),
                analyticsServices: vm.hasPermission('analytics', 'services') || vm.isStaff(),
                analyticsContent: vm.hasPermission('analytics', 'content') || vm.isStaff(),
                analyticsVisitors: vm.hasPermission('analytics', 'visitors') || vm.isStaff(),
                analyticsMobile: vm.hasPermission('analytics', 'mobile_app') || vm.isStaff(),
                analyticsSocial: vm.hasPermission('analytics', 'social_media') || vm.isStaff(),
                analyticsHotspots: vm.hasPermission('analytics', 'hotspots') || vm.isStaff(),
                analyticsBalance: vm.hasPermission('analytics', 'balance_checker') || vm.isStaff(),
                analyticsSearch: vm.hasPermission('analytics', 'gas_search_tool') || vm.isStaff()
            };
        }).catch((error) => {
            console.log(error);
        });
    };

    vm.login = function () {
        return AuthService.login(vm.user).then((response) => {
            delete vm.user.password;

            vm.user.permissions = null;
            vm.user.token = response.data.token;
            vm.user.email = response.data.email;
            vm.user.isStaff = response.data.isStaff;
            vm.user.isSuperuser = response.data.isSuperuser;
            vm.user.isAuthenticated = true;
            vm.user.name = response.data.name;
            vm.user.surname = response.data.surname;
            vm.user.id = response.data.id;
            vm.user.avatar = response.data.avatar;
            vm.getPermissions();
            $cookies.putObject('user', vm.user);
            $cookies.putObject('permissions', $rootScope.permissions);
            $rootScope.user = vm.user;
            $state.go('home');
        }).catch(() => {
            vm.loginForm.$setPristine();
            $cookies.remove('user');
            $cookies.remove('permissions');
            vm.user.password = '';
            vm.loginErrorMessage = 'Incorrect email or password.';
        });
    };
});
