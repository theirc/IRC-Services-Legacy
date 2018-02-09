angular.module('adminApp').factory('tableUtils', (DTOptionsBuilder, DTColumnBuilder, $compile, $injector, $rootScope) => {
    let scope = $rootScope.$new();
    var generator = (scope = {}) => {
        return {
            defaults() {
                return DTOptionsBuilder
                    .fromSource('noop.json')
                    .withOption('sAjaxDataProp', 'data')
                    .withOption('serverSide', true)
                    .withOption('stateSave', true)
                    .withOption('filter', false)
                    .withPaginationType('full_numbers')
                    .withOption('createdRow', createdRow)

                    ;


                function createdRow(row, data, dataIndex) {
                    $compile(angular.element(row).contents())(scope);
                }
            },
            defaultsWithService(service) {
                return this.defaults()
                    .withOption('ajax', service.forDataTables)
                    ;
            },
            defaultsWithServiceName(serviceName) {
                let service = $injector.get(serviceName);
                return this.defaultsWithService(service);
            },
            defaultsWithServiceAndFilter(service, filter) {
                return this.defaults()
                    .withOption('ajax', service.forDataTablesWithFilter(filter));
            },
            defaultsWithServiceNameAndFilter(serviceName, filter) {
                let service = $injector.get(serviceName);
                return this.defaultsWithServiceAndFilter(service, filter);
            },
            defaultsWithServiceAndFilterFunction(service, filter) {
                return this.defaults()
                    .withOption('ajax', service.forDataTablesWithFilterFunction(filter));
            },
            defaultsWithServiceNameAndFilterFunction(serviceName, filter) {
                let service = $injector.get(serviceName);
                return this.defaultsWithServiceAndFilterFunction(service, filter);
            },
            defaultsWithServiceAndFilterAndSearch(service, filter) {
                return this.defaults()
                    .withOption('bFilter', true)
                    .withOption('searchDelay', 600)
                    .withOption('ajax', service.forDataTablesWithFilterAndSearch(filter));
            },
            defaultsWithServiceNameAndFilterAndSearch(serviceName, filter) {
                let service = $injector.get(serviceName);
                return this.defaultsWithServiceAndFilterAndSearch(service, filter);
            },
            newColumn(...args){
                return DTColumnBuilder.newColumn(...args);
            },
            newDateColumn(...args){
                return DTColumnBuilder.newColumn(...args).renderWith((d, t, f, m)=> {
                    return d ? moment(d).format('LLL') : '';
                });
            },

            newLinkColumn(name = 'name', title = 'Name', sref = '^.open') {
                return DTColumnBuilder.newColumn(name).withTitle(title).renderWith((data, type, full, ...args) => {
                    return `<a ui-sref="${sref}({id: ${full.id}})">${data}</a>`;
                });

            },
            newActionColumn(sref = "^.open") {
                return DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable().renderWith(renderActions);

                function renderActions(data, type, full, meta) {
                    return `
                    <button class="btn btn-primary btn-xs" ui-sref="${sref}({id: ${full.id}})">
                        <i class="fa fa-eye"></i>
                    </button>
                `;
                }
            },
            newServiceActionColumn(sref = "^.open", duplicateSref ="^.duplicate", archiveSref="^.archive") {
                return DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable().renderWith(renderActions);

                function renderActions(data, type, full, meta) {
                    return `
                    <button class="btn btn-danger btn-xs" ui-sref="${archiveSref}({serviceId: ${full.id}})">
                        <span><i class="fa fa-archive" style="padding-right: 5px"></i>Archive</span>
                    </button>
                    <button class="btn btn-primary btn-xs" ui-sref="${sref}({serviceId: ${full.id}})">
                        <span><i class="fa fa-eye" style="padding-right: 5px"></i>Edit</span>
                    </button>
                    <button class="btn btn-warning btn-xs" ui-sref="${duplicateSref}({serviceId: ${full.id}})">
                        <span><i class="fa fa-files-o" style="padding-right: 5px"></i>Duplicate</span>
                    </button>
                `;
                }
            }
        };
    };

    return generator(scope);
})
;
