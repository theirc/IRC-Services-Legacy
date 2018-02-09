angular.module('adminApp').controller('AnalyticsContentController', function (analytics, $scope, $state, $anchorScroll, $location, tableUtils, $filter, datepickerRanges, datePickerBoundries) {
    let vm = this;


    function renderOpenInCMS(data, type, row) {
        return data.map((region) => {
            let countrySlug = region.parent_slug || region.slug;
            let label = region.parent_name ? `${region.name}, ${region.parent_name}` : region.name;
            return `<a class="btn btn-primary btn-xs" style="margin-right: 5px"
                ui-sref="pageDetails({environment: 'staging', countrySlug: '${countrySlug}', regionSlug: '${region.slug}', pageSlug: '${row.slug}'})">
                ${label}
            </a>`;
        }).join('') || 'Content is not assigned to any region.';
    }

    function renderUpdatedAt(data) {
        return $filter('date')(data, 'medium');
    }

    vm.$onInit = () => {
        vm.datePicker = datepickerRanges;
        vm.datePickerBoundries = datePickerBoundries;
        vm.datePicker.options = {
            ranges: {
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()]
            },
            eventHandlers: {
                'apply.daterangepicker': (ev, picker) => {
                    if (typeof ev.model.endDate != 'string') {
                        vm.datePicker.endDate = ev.model.endDate.format('YYYY-MM-DD');
                    }
                    if (typeof ev.model.startDate != 'string') {
                        vm.datePicker.startDate = ev.model.startDate.format('YYYY-MM-DD');
                    }
                    vm.dtInstance.rerender();
                }
            },
            opens: 'center'
        };

        vm.filterFunction = () => {
            return {updated_at: vm.datePicker.startDate, end_date: vm.datePicker.endDate};
        };

        vm.analytics = analytics;
        vm.chartData = analytics.regions.map((region) => region.content_count);
        vm.chartLabels = analytics.regions.map((region) => region.name);
        vm.chartOptions = {
            legend: {
                display: true,
                position: 'right'
            }
        };

        vm.dtColumns = [
            tableUtils.newColumn('translations.en.title').withTitle('Title'),
            tableUtils.newDateColumn('updated_at', 'Updated at'),
            tableUtils.newColumn('updated_by').withTitle('Updated by'),
            tableUtils.newColumn('regions').withTitle('Open in CMS as').notSortable().renderWith(renderOpenInCMS),
        ];
        vm.dtOptions = tableUtils.defaultsWithServiceNameAndFilterFunction('LatestPageService', vm.filterFunction);
        vm.dtInstance = {};
    };

    vm.isOutdatedContentShown = () => $state.includes('analytics.content.outdated');

    vm.scrollTo = (id) => {
        $anchorScroll($location.hash(id));
    };

});
