angular.module('adminApp').controller('UserListController', function ($scope, tableUtils) {
    let vm = this;

    vm.dtOptions = tableUtils.defaultsWithServiceName('UserService');

    vm.dtColumns = [
        tableUtils.newColumn('id').withTitle('ID'),
        tableUtils.newLinkColumn('email', 'Email'),
        tableUtils.newColumn('groups').withTitle('Groups').notSortable().renderWith(renderGroups),
        tableUtils.newColumn('name').withTitle('First Name'),
        tableUtils.newColumn('surname').withTitle('Last Name'),
        tableUtils.newActionColumn()
    ];
    vm.dtInstance = {};

    vm.createLink = '^.create';

    function renderGroups(data) {
        return data.map((row) => row.name).join(', ');
    }
});
