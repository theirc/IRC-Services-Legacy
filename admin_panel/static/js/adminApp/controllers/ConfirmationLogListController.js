angular.module('adminApp').controller('ConfirmationLogListController', function (confirmationLogs, $filter, DTOptionsBuilder, DTColumnDefBuilder) {
    var vm = this;
    vm.confirmationLogs = confirmationLogs.plain();
    vm.dtOptions = DTOptionsBuilder.newOptions().withOption('order', [[2, 'desc'], [0, 'desc']]);
    vm.dtColumnDefs = [
        DTColumnDefBuilder.newColumnDef(2).withOption('type', 'date').renderWith(data => {
            return $filter('date')(data, 'medium');
        }),
    ];
});