angular.module('adminApp').directive('defaultDatatable', function ($compile) {
    return {
        restrict: 'E',
        scope: {
            id: '=',
            ctrl: '='
        },
        template: '<div></div>',
        link: function ($scope, element, attrs) {
            let temp = `<table id="` + $scope.id + `" datatable="" dt-options="ctrl.dtOptions" dt-columns="ctrl.dtColumns"
                       dt-instance="ctrl.dtInstance"
                       class="table table-bordered table-striped"></table>`;

            $(element).html($compile(temp)($scope))
        }
    };
});
