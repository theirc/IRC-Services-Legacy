angular.module('adminApp').factory('AuthService', function ($http, $rootScope, $q, $location, $cookies, apiUrl) {
    return {
        me: function () {
            return $http({
                method: 'GET',
                url: apiUrl + '/v2/users/me/'
            });
        },
        login: function (data) {
            return $http({
                method: 'POST',
                url: apiUrl + '/v2/users/login/',
                data: data
            });
        },
        logout: function () {
            delete $rootScope.user;
            $cookies.remove('user');
            $cookies.remove('permissions');
            sessionStorage.clear();
            localStorage.clear();

            var deferred = $q.defer();
            var promise = deferred.promise;
            deferred.resolve();

            return promise;
        },
        update: function (data) {
            return $http({
                method: 'PUT',
                url: apiUrl + '/v2/users/',
                data: data
            });
        },
        getPermissions: function () {
            return $http({
                method: 'get',
                url: apiUrl + '/v2/permission'
            });
        }
    };
});