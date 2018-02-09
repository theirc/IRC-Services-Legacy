(function (angular) {
    angular.module('adminApp')
        .factory('CommonDataService', function (Restangular, $q, $window) {

            return {
                getProviderTypes: function () {
                    var client = Restangular.service('provider-types');

                    if ($window.sessionStorage.providerTypes) {
                        var def = $q.defer();

                        def.resolve(JSON.parse($window.sessionStorage.providerTypes));

                        return def.promise;
                    }

                    return client.getList().then(function (t) {
                        var objects = t.plain();
                        $window.sessionStorage.providerTypes = JSON.stringify(objects);

                        return objects;
                    });
                },
                getServiceTypes: function () {
                    var client = Restangular.service('service-types');

                    return client.getList().then(function (t) {
                        var objects = t.plain();
                        $window.sessionStorage.serviceTypes = JSON.stringify(objects);

                        return objects;
                    });
                },
                getServiceAreas: function () {
                    var client = Restangular.service('service-areas');

                    if ($window.sessionStorage.serviceAreas) {
                        var def = $q.defer();

                        def.resolve(JSON.parse($window.sessionStorage.serviceAreas));

                        return def.promise;
                    }

                    return client.getList().then(function (t) {
                        var objects = t.plain();
                        $window.sessionStorage.serviceAreas = JSON.stringify(objects);

                        return objects;
                    });
                },
                getUsersForLookup: function () {
                    var client = Restangular.service('users');

                    if ($window.sessionStorage.usersForLookup) {
                        var def = $q.defer();

                        def.resolve(JSON.parse($window.sessionStorage.usersForLookup));

                        return def.promise;
                    }

                    return client.getList().then(function (t) {
                        var objects = t.plain();
                        $window.sessionStorage.usersForLookup = JSON.stringify(objects);

                        return objects;
                    });
                }
            };
        })
    ;
})(angular);