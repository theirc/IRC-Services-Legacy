angular.module("adminApp").factory("HttpRequestAuthInterceptor", function($rootScope) {
	return {
		request: function(config) {
			if ($rootScope.user) config.headers["ServiceInfoAuthorization"] = "token " + $rootScope.user.token;
			config.headers["Accept"] = "application/json";

			return config;
		},
	};
});
angular.module("adminApp").factory("HttpRequestLoadingInterceptor", function($rootScope, $q) {
	return {
		request: function(config) {
			$rootScope.isLoading = true;
			return config;
		},
		response: function(response) {
			$rootScope.isLoading = false;
			return response;
		},
		requestError: function(rejection) {
			$rootScope.isLoading = false;
			return $q.reject(rejection);
		},
		responseError: function(rejection) {
			$rootScope.isLoading = false;
			return $q.reject(rejection);
		},
	};
});
