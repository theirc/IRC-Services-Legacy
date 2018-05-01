/**
 * Created by reyrodrigues on 1/2/17.
 */
angular.module('adminApp')
    .controller('ProviderListController', function (tableUtils, $scope, ProviderService, providerTypes,selectedLanguage) {
        var vm = this;
        vm.dtOptions = tableUtils.defaultsWithServiceNameAndFilterAndSearch('ProviderService');
        vm.dtColumns = [
            tableUtils.newColumn('id').withTitle('ID'),
            tableUtils.newColumn(`name_${selectedLanguage}`).withTitle(`Name (${selectedLanguage})`),
            tableUtils.newColumn('type').withTitle('Type').renderWith(function (data) {
                var type = providerTypes.filter(function (t) {
                    return t.id == data;
                });

                if (!type.length) return '';
                return type[0].name;
            }),
            tableUtils.newColumn('actions').withTitle('Actions').renderWith(function (data, type, full, meta) {
                var viewButton = `
                    <a class="btn btn-primary btn-xs btn-block" ui-sref="^.open({id: ${full.id}})">
                        <i class="fa fa-eye"></i>
                        {{ OPEN | translate }}
                    </a>`;
                var impersonateButton = `
                    <a class="btn btn-success btn-xs btn-block" ui-sref="^.impersonate({id: ${full.id}})">
                        <i class="fa fa-user"></i>
                        Impersonate
                    </a>
                `;

                return `
                    ${viewButton}
                    ${$scope.user.isSuperuser ? impersonateButton : ''}`;
            }),
        ];


        vm.dtInstance = {};
        vm.createLink = '^.create';        

        angular.extend($scope, vm);
    })
    .controller('ProviderOpenController', function ($scope, systemUsers, ProviderService, tableUtils, $rootScope, regions, provider, serviceTypes, providerTypes, $state, selectedLanguage) {
        var vm = this;

        vm.provider = provider;
        vm.object = provider;
        vm.providerTypes = providerTypes;
        vm.selectedLanguageTab = $rootScope.languages ? $rootScope.languages[0][0] : 'en';
        vm.isEditing = false;
        vm.allUsers = systemUsers;
        vm.isNew = !vm.object.hasOwnProperty('id');
        vm.regions = regions.filter(r => r.level === 1);
        vm.serviceTypes = serviceTypes;

        if (vm.isNew) {
            vm.isEditing = true;
        }

        vm.goBack = function () {
            $state.go('provider.list');
        };

        vm.impersonate = function () {
            $state.go('provider.impersonate', provider);
        };

        vm.exportServices = function () {
            ProviderService.exportServices(vm.object.id);
        };

        vm.importServices = function () {
            $('#file').click();

        };

        vm.uploadFile = function () {
            let file = $('#file')[0].files[0];

            ProviderService.importServices(vm.object.id, file);
        };

        vm.save = save;

        vm.stOptions = tableUtils.defaultsWithServiceNameAndFilter('ServiceService', {
            provider: provider.id
        });
        vm.stColumns = [
            tableUtils.newColumn('id').withTitle('ID'),
            tableUtils.newColumn(`name_${selectedLanguage}`).withTitle(`Name (${selectedLanguage})`)
        ];

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

        vm.canEdit = (
            $rootScope.user.isSuperuser ||
            ($rootScope.user.groups.filter(g => g.name === 'Providers').length > 0 && ($rootScope.selectedProvider.id === vm.provider.id ))
        )

        function save() {
            if (vm.isNew) {
                ProviderService.post(vm.object).then(function (o) {
                    $state.go('^.open', {
                        id: o.id
                    });
                });
            } else {
                vm.object.save();
            }
            vm.stopEditing();
        }
    });