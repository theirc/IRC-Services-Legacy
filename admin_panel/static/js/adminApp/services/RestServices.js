/**
 * Created by reyrodrigues on 1/2/17.
 */
(function (angular) {
    angular
        .module('adminApp')
        .factory('UserService', function (Restangular) {
            var service = Restangular.service('users');

            return wrap(service);
        })
        .factory('WebStatsService', function (Restangular) {
            var service = Restangular.service('web-stats');

            return wrap(service);
        })
        .factory('EventStatsService', function (Restangular) {
            var service = Restangular.service('event-stats');

            return wrap(service);
        })
        .factory('PostService', function (Restangular) {
            var service = Restangular.service('posts');

            return wrap(service);
        })
        .factory('ProviderService', function (Restangular) {
            var service = Restangular.service('providers');

            service.myProviders = function () {
                return Restangular
                    .all('providers')
                    .customGET('my_providers');
            };

            service.exportServices = function (id) {
                return Restangular
                    .one('providers', id)
                    .customGET('export_services')
                    .then((r) => saveAs(b64toBlob(r.data, r.content_type), "export.xlsx"));
            };
            service.importServices = function (id, file) {
                var fd = new FormData();
                fd.append('file', file);
                return Restangular
                    .one('providers', id)
                    .withHttpConfig({transformRequest: angular.identity})
                    .customPOST(fd, 'import_services', undefined, {'Content-Type': undefined})
                    .then(() => {}, () => {});
            };
            service.impersonateProvider = function (id) {
                return Restangular
                    .one('providers', id)
                    .customGET('impersonate_provider');
            };

            return wrap(service);
        })
        .factory('PrivateServiceService', function (Restangular) {
            var service = Restangular.service('private-services');

            return wrap(service);

        })
        .factory('PrivateProviderService', function (Restangular) {
            var service = Restangular.service('private-providers');

            return wrap(service);

        })
        .factory('ServiceService', function (Restangular) {
            var service = Restangular.service('services');

            service.pushServiceToTransifex = function (id) {
                return Restangular
                    .one('services', id)
                    .customPOST(id, 'push_service_to_transifex');
            };

            service.pullServiceFromTransifex = function (id) {
                return Restangular
                    .one('services', id)
                    .customGET('pull_service_from_transifex');
            };

            service.getServiceTransifexData = function (id) {
                return Restangular
                    .one('services', id)
                    .customGET('get_service_transifex_data');
            };

            service.archive = function (id) {
                return Restangular
                    .one('services', id)
                    .customPOST(id, 'archive');
            };

            service.duplicate = function (id, name) {
                return Restangular
                    .one('services', id)
                    .customPOST(id, 'duplicate', {'new_name': name});
            };

            return wrap(service);
        })
        .factory('ServiceManagementService', function (Restangular) {
            var service = Restangular.service('service-management');

            return wrap(service);
        })
        .factory('GeoRegionService', function (Restangular) {
            var service = Restangular.service('regions');

            return wrap(service);
        })
        .factory('ConversationService', function (Restangular) {
            var service = Restangular.service('conversations');

            service.sendMessage = function (id, text) {
                return Restangular
                    .one('conversations', id)
                    .customPOST({
                        message: text
                    }, 'send_message');
            };

            service.updateConversation = function (id, text) {
                return Restangular
                    .one('conversations', id)
                    .customPOST({}, 'update_conversation');
            };

            service.runAnalysis = function (id) {
                return Restangular
                    .one('conversations', id)
                    .customGET('run_analysis');
            };

            service.inspectObject = function (id) {
                return Restangular
                    .all('conversations')
                    .customGET('inspect_object', {object_id: id});
            };

            return wrap(service);
        })
        .factory('MessageService', function (Restangular) {
            var service = Restangular.service('messages');

            return wrap(service);
        })
        .factory('MicroAppService', function (Restangular) {
            var service = Restangular.service('apps');

            return wrap(service);
        })
        .factory('LatestPageService', function (Restangular) {
            var service = Restangular.service('page-latest');

            return wrap(service);
        })
        .factory('PostStatsService', function (Restangular) {
            var service = Restangular.service('page-posts');

            return wrap(service);
        })
        .factory('ConversationsStatsService', function (Restangular) {
            var service = Restangular.service('page-conversations');

            return wrap(service);
        })
        .factory('PageFansService', function (Restangular) {
            var service = Restangular.service('page-fans');

            return wrap(service);
        })
        .factory('PageViewsService', function (Restangular) {
            var service = Restangular.service('page-views');

            return wrap(service);
        })
        .factory('PageEngagementService', function (Restangular) {
            var service = Restangular.service('page-engagement');

            return wrap(service);
        })
        .factory('AdsStatsService', function (Restangular) {
            var service = Restangular.service('ads-stats');

            return wrap(service);
        })
        .factory('BlogService', function (Restangular) {

            var service = Restangular.service('blog');

            service.pushToTransifex = function (id) {
                return Restangular
                    .one('blog', id)
                    .customPOST({}, 'push');
            };

            service.pullFromTransifex = function (id) {
                return Restangular
                    .one('blog', id)
                    .customPOST({}, 'pull');
            };

            return wrap(service);
        })

        /* Controlled Lists */
        .factory('ServiceTypeService', function (Restangular) {

            var service = Restangular.service('service-types');

            return wrap(service);
        })
        .factory('ProviderTypeService', function (Restangular) {

            var service = Restangular.service('provider-types');

            return wrap(service);
        });

    function wrap(service) {
        service.forDataTablesWithFilterFunction = function (filter) {
            return function (opt, cb, settings) {
                return serverData.apply(service, [opt, cb, settings].concat([filter()]));
            };
        };
        service.forDataTablesWithFilter = function (filter) {
            return function (opt, cb, settings) {
                return serverData.apply(service, [opt, cb, settings].concat([filter]));
            };
        };
        service.forDataTablesWithFilterAndSearch = function (filter = {}) {
            return function (opt, cb, settings) {
                filter['search'] = angular
                    .element('input[type=search]')
                    .val();
                return serverData.apply(service, [opt, cb, settings].concat([filter]));
            };
        };
        service.forDataTables = function (opt, cb, settings) {
            return serverData.apply(service, [opt, cb, settings]);
        };

        return service;
    }

    function serverData(options, cb, oSettings, filter) {
        var start = options.start;
        var length = options.length;
        var page = (start / length) + 1;

        var order = options
            .order
            .map(function (or) {
                var sortBy = oSettings.aoColumns[or.column].sortBy || false;
                return (or.dir !== 'asc'
                    ? '-'
                    : '') + (sortBy || options.columns[or.column].data);
            })
            .join(',');

        var params = {
            page: page,
            page_size: length,
            ordering: order
        };
        if (filter) {
            for (var k in filter) {
                params[k] = filter[k];
            }
        }

        this
            .getList(params)
            .then(function (d) {
                var result = {
                    data: d,
                    recordsFiltered: d._meta.recordsFiltered,
                    recordsTotal: d._meta.recordsTotal
                };

                cb(result);
            });
    }

    function b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, {type: contentType});
        return blob;
    }
})(angular);