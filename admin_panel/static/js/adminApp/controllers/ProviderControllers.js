/**
 * Created by reyrodrigues on 1/2/17.
 */
angular.module('adminApp')
    .controller('ProviderListController', function (tableUtils, $scope, ProviderService, providerTypes) {
        var vm = this;
        vm.dtOptions = tableUtils.defaultsWithServiceNameAndFilterAndSearch('ProviderService');
        vm.dtColumns = [
            tableUtils.newColumn('id').withTitle('ID'),
            tableUtils.newLinkColumn('name_en', 'Name (English)'),
            tableUtils.newLinkColumn('name_ar', 'Name (Arabic)'),
            tableUtils.newColumn('type').withTitle('Type').renderWith(function (data) {
                var type = providerTypes.filter(function (t) {
                    return t.id == data;
                });

                if (!type.length) return '';
                return type[0].name;
            }),
            tableUtils.newActionColumn()
        ];

        vm.dtInstance = {};
        vm.createLink = '^.create';

        angular.extend($scope, vm);
    })
    .controller('ProviderOpenController', function ($scope, systemUsers, ProviderService, tableUtils, $rootScope, regions, provider, providerTypes, $state) {
        var vm = this;

        vm.provider = provider;
        vm.object = provider;
        vm.providerTypes = providerTypes;
        vm.selectedLanguageTab = 'en';
        vm.isEditing = false;
        vm.allUsers = systemUsers;
        vm.isNew = !vm.object.hasOwnProperty('id');
        vm.regions = regions;

        if (vm.isNew) {
            vm.isEditing = true;
        }

        vm.goBack = function () {
            $state.go('provider.list');
        };

        vm.impersonate = function () {
            $rootScope.selectedProvider = vm.provider;
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

        vm.stOptions = tableUtils.defaultsWithServiceNameAndFilter('ServiceService', {provider: provider.id});
        vm.stColumns = [
            tableUtils.newColumn('id').withTitle('ID'),
            tableUtils.newColumn('name_en').withTitle('Name (en)')
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

        function save() {
            if (vm.isNew) {
                ProviderService.post(vm.object).then(function (o) {
                    $state.go('^.open', {id: o.id});
                });
            } else {
                vm.object.save();
            }
            vm.stopEditing();
        }
    });
