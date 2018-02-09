angular.module('adminApp').controller('AnalyticsDetailController', function (
    $scope, $window, $state, analyticsId, title, url, Restangular, moment, statObjects, datepickerRanges, datePickerBoundries) {

    var vm = this;

    const viewId = analyticsId;

    vm.title = title;
    vm.url = url;

    vm.sessions = statObjects.plain()[0];
    vm.sessionsValue = statObjects.plain()[1];
    vm.usersValue = statObjects.plain()[2];
    vm.pageViewsValue = statObjects.plain()[4];

    vm.sessionsLabels = statObjects.plain()[3];
    vm.sessionsDatasetOverride = {
        label: 'Sessions'
    };
    vm.sessionsOptions = {
        legend: {
            display: true,
            position: 'top',
            labels: {
                boxWidth: 20
            }
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    };

    vm.drawCharts = (startDate, endDate) => {
        return Restangular.all('web-stats/detail/')
            .customGET('', {view_id: viewId, date: startDate, end_date: endDate})
            .then(function (objs) {
                vm.sessions = objs.plain()[0];
                vm.sessionsValue = objs.plain()[1];
                vm.usersValue = objs.plain()[2];
                vm.sessionsLabels = objs.plain()[3];
                vm.pageViewsValue = objs.plain()[4];
            });
    };

    vm.datePicker = datepickerRanges;
    vm.datePickerBoundries = datePickerBoundries;
    vm.datePicker.options = {
        ranges: {
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()]
        },
        eventHandlers: {
            'apply.daterangepicker': function (ev, picker) {
                if (typeof ev.model.endDate != 'string' && typeof ev.model.startDate != 'string') {
                    let endDate = ev.model.endDate.format('YYYY-MM-DD');
                    let startDate = ev.model.startDate.format('YYYY-MM-DD');
                    vm.drawCharts(startDate, endDate);
                }
            }
        },
        opens: 'center',
        parentEl: '.content-header'
    };

    vm.printPage = () => {
        $window.print();
    };
});