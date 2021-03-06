angular.module('adminApp').controller('UserViewController', function ($rootScope, $scope, $state, $cookies, user, groups, providers, languages, sites, Restangular, Upload) {
    let vm = this;

    vm.languages = languages.map(l => ({
        id: l[0],
        name: l[1],
    }));
    this.$onInit = function () {
        vm.object = user;
        vm.providers = providers;
        vm.editOptions = {};
        vm.isNew = !vm.object.hasOwnProperty('id');
        vm.sites = _.sortBy(sites, r => r.name);

        if (vm.isNew) {
            vm.startEditing();
        } else {
            vm.object.providers = vm.object.providers.map(p => _.isObject(p) ? p.id : p);
        }
        vm.groups = groups.plain();
        vm.errors = null;
    };

    vm.uploadAvatar = function (file) {
        if (file) {
            Upload.upload({
                url: 'v2/users/' + vm.object.id + '/',
                data: {
                    avatar: file
                },
                method: 'PATCH',
            }).then(function (resp) {
                vm.errors = null;
                let cookieUser = $cookies.getObject('user');
                vm.object = user;
                cookieUser.avatar = resp.data.avatar;
                cookieUser.name = vm.object.plain().name;
                cookieUser.surname = vm.object.plain().surname;
                $cookies.putObject('user', cookieUser);
            }, function (resp) {
                vm.errors = resp.data.non_field_errors[0];
            });
        }
    };

    vm.removeAvatar = function () {
        let avatar = {
            'avatar': null
        };
        return vm.object.customPATCH(avatar).then(function (resp) {
            vm.errors = null;
            let cookieUser = $cookies.getObject('user');
            delete cookieUser.avatar;
            vm.object = user;
            cookieUser.name = vm.object.plain().name;
            cookieUser.surname = vm.object.plain().surname;
            $cookies.putObject('user', cookieUser);
        });
    };

    vm.updateUser = function () {
        vm.errors = null;
        let userPlain = vm.object.plain();
        userPlain.groups = userPlain.groups.map((group) => group.id);
        userPlain.is_staff = userPlain.isStaff;
        delete userPlain.isStaff;
        return vm.object.customPUT(userPlain).then((response) => {
            vm.stopEditing();
        });
    };


    vm.save = function () {
        vm.errors = null;
        if (vm.isNew) {
            Restangular.service('users/register').post(vm.object).then(newUser => {
                $state.go('user.open', {
                    id: newUser.id
                });
            });
        } else {
            vm.updateUser();
        }
    };

    vm.resendActivationEmail = function () {
        vm.errors = null;
        Restangular.one('users', vm.object.id).getList('resend_activation_email').then(() => {});
    };

    vm.startEditing = function () {
        vm.isEditing = true;
    };

    vm.stopEditing = function () {
        vm.isEditing = false;
    };

    vm.cancelEditing = function () {
        vm.stopEditing();
        $state.reload();
    };

    vm.remove = function () {
        if (confirm('Are you sure?')) {

            if (vm.isNew) {
                $state.go('user.list');
            } else {
                vm.object.remove().then(function () {
                    $state.go('user.list');
                });
            }
            vm.stopEditing();
        }
    };
});