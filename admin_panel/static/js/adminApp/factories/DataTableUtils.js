angular.module('adminApp').factory('tableUtils', (DTOptionsBuilder, DTColumnBuilder, $compile, $injector, $rootScope, $filter, selectedLanguage) => {
    let scope = $rootScope.$new();
    const translations = {
        en: {
            "sEmptyTable": "No data available in table",
            "sInfo": "Showing _START_ to _END_ of _TOTAL_ entries",
            "sInfoEmpty": "Showing 0 to 0 of 0 entries",
            "sInfoFiltered": "(filtered from _MAX_ total entries)",
            "sInfoPostFix": "",
            "sInfoThousands": ",",
            "sLengthMenu": "Show _MENU_ entries",
            "sLoadingRecords": "Loading...",
            "sProcessing": "Processing...",
            "sSearch": "Search:",
            "sZeroRecords": "No matching records found",
            "oPaginate": {
                "sFirst": "First",
                "sLast": "Last",
                "sNext": "Next",
                "sPrevious": "Previous"
            },
            "oAria": {
                "sSortAscending": ": activate to sort column ascending",
                "sSortDescending": ": activate to sort column descending"
            }
        },
        es: {
            "sProcessing": "Procesando...",
            "sLengthMenu": "Mostrar _MENU_ registros",
            "sZeroRecords": "No se encontraron resultados",
            "sEmptyTable": "Ningún dato disponible en esta tabla",
            "sInfo": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
            "sInfoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
            "sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
            "sInfoPostFix": "",
            "sSearch": "Buscar:",
            "sUrl": "",
            "sInfoThousands": ",",
            "sLoadingRecords": "Cargando...",
            "oPaginate": {
                "sFirst": "Primero",
                "sLast": "Último",
                "sNext": "Siguiente",
                "sPrevious": "Anterior"
            },
            "oAria": {
                "sSortAscending": ": Activar para ordenar la columna de manera ascendente",
                "sSortDescending": ": Activar para ordenar la columna de manera descendente"
            }
        }
    };
    let language = selectedLanguage in translations ? translations[selectedLanguage] : translations.en;

    var generator = (scope = {}) => {
        return {
            defaults() {
                return DTOptionsBuilder
                    .fromSource('noop.json')
                    .withLanguage(language)
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
                    .withOption('ajax', service.forDataTables);
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
            newColumn(...args) {
                return DTColumnBuilder.newColumn(...args);
            },
            newDateColumn(...args) {
                return DTColumnBuilder.newColumn(...args).renderWith((d, t, f, m) => {
                    return d ? moment(d).format('LLL') : '';
                });
            },

            newLinkColumn(name = 'name', title = 'Name', sref = '^.open') {
                return DTColumnBuilder.newColumn(name).withTitle(title).renderWith((data, type, full, ...args) => {
                    return `<a ui-sref="${sref}({id: ${full.id}})">${data}</a>`;
                });

            },
            newActionColumn(sref = "^.open") {
                return DTColumnBuilder.newColumn(null).withTitle($filter('translate')('TABLE_ACTIONS')).notSortable().renderWith(renderActions);

                function renderActions(data, type, full, meta) {
                    return `
                    <a class="btn btn-primary btn-xs btn-block" ui-sref="${sref}({id: ${full.id}})">
                        <i class="fa fa-eye"></i>
                        Open
                    </a>
                `;
                }
            },
            newServiceReadOnlyActionColumn(sref = "^.open") {
                return DTColumnBuilder.newColumn(null).withTitle($filter('translate')('TABLE_ACTIONS')).notSortable().renderWith(renderActions);

                function renderActions(data, type, full, meta) {
                    return `
                    <a class="btn btn-primary btn-xs btn-block" ui-sref="${sref}({serviceId: ${full.id}})">
                        <i class="fa fa-eye"></i>
                        Open
                    </a>
                `;
                }
            },
            newServiceActionColumn(sref = "^.open", duplicateSref = "^.duplicate", archiveSref = "^.archive") {
                return DTColumnBuilder.newColumn(null).withTitle($filter('translate')('TABLE_ACTIONS')).notSortable().renderWith(renderActions);

                function renderActions(data, type, full, meta) {
                    return `
                        <a class="btn btn-danger btn-xs btn-block" ui-sref="${archiveSref}({serviceId: ${full.id}})">
                            <span><i class="fa fa-archive" style="padding-right: 5px"></i>${$filter('translate')('TABLE_ARCHIVE')}</span>
                        </a>
                        <a class="btn btn-primary btn-xs btn-block" ui-sref="${sref}({serviceId: ${full.id}})">
                            <span><i class="fa fa-eye" style="padding-right: 5px"></i>${$filter('translate')('TABLE_EDIT')}</span>
                        </a>
                        
                `;
                }
            }
        };
    };

    return generator(scope);
});