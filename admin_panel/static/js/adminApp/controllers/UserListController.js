angular.module('adminApp').controller('UserListController', function ($scope, tableUtils, $filter) {
    let vm = this;

    vm.dtOptions = tableUtils.defaultsWithServiceName('UserService');

    vm.dtColumns = [
        tableUtils.newColumn('id').withTitle('ID'),
        tableUtils.newLinkColumn('email', $filter('translate')('USER_EMAIL')),
        tableUtils.newColumn('groups').withTitle($filter('translate')('USER_GROUPS')).notSortable().renderWith(renderGroups),
        tableUtils.newColumn('name').withTitle($filter('translate')('USER_FIRST_NAME')),
        tableUtils.newColumn('surname').withTitle($filter('translate')('USER_LAST_NAME')),
        tableUtils.newActionColumn()
    ];
    vm.dtInstance = {};

    vm.createLink = '^.create';

    function renderGroups(data) {
        return data.map((row) => row.name).join(', ');
    }
});
