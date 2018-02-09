/**
 * Created by reyrodrigues on 1/2/17.
 */
angular.module('adminApp').controller('MicroAppListController', function ($scope, tableUtils) {
    var vm = this;
    vm.dtOptions = tableUtils.defaultsWithServiceName('MicroAppService');
    vm.dtColumns = [
        tableUtils.newColumn('id').withTitle('ID'),
        tableUtils.newLinkColumn('name_en', 'Name (English)'),
        tableUtils.newLinkColumn('name_ar', 'Name (Arabic)'),
        tableUtils.newActionColumn()
    ];

    vm.dtInstance = {};
    vm.createLink = '^.create';

    angular.extend($scope, vm);
})
.controller('MicroAppOpenController', function (MicroAppService, $state, $scope, object) {
    var vm = this;
    vm.object = object;
    vm.selectedLanguageTab = 'en';
    vm.isNew = !vm.object.hasOwnProperty('id');

    vm.save = save;
    vm.startEditing = startEditing;
    vm.stopEditing = stopEditing;
    vm.remove = remove;
    vm.canDelete = true;
    angular.extend($scope, vm);

    function save() {
        if (vm.isNew) {
            MicroAppService.post(vm.object).then((o) => {
                $state.go('^.open', {id: o.id});
            }, () => {});
        } else {
            vm.object.save();
        }
        vm.stopEditing();
    }

    function remove() {
        if (confirm('Are you sure?')) {

            if (vm.isNew) {
                $state.go('^.list');
            } else {
                vm.object.remove().then(function () {
                    $state.go('^.list');
                });
            }
            vm.stopEditing();
        }
    }

    function startEditing() {
        vm.isEditing = true;
    }

    function stopEditing() {
        vm.isEditing = false;
    }
});
