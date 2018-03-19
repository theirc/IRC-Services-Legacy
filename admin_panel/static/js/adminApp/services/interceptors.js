angular.module("adminApp").factory("HttpRequestAuthInterceptor", function ($rootScope) {
	return {
		request: function (config) {
			if ($rootScope.user) config.headers["ServiceInfoAuthorization"] = "token " + $rootScope.user.token;
			config.headers["Accept"] = "application/json";

			return config;
		},
	};
});
angular.module("adminApp").factory("HttpRequestLoadingInterceptor", function ($rootScope, $q) {
	var debounced = _.debounce(() => {
		$rootScope.isLoading = true;
	}, 100);
	$rootScope.activeRequests = $rootScope.activeRequests || 0;
	return {
		request: function (config) {
			debounced();
			$rootScope.activeRequests += 1;
			return config;
		},
		response: function (response) {
			debounced.cancel();

			$rootScope.isLoading = false;
			$rootScope.activeRequests -= 1;

			return response;
		},
		requestError: function (rejection) {
			debounced.cancel();

			$rootScope.isLoading = false;
			$rootScope.activeRequests -= 1;

			return $q.reject(rejection);
		},
		responseError: function (rejection) {
			debounced.cancel();

			$rootScope.isLoading = false;
			$rootScope.activeRequests -= 1;

			return $q.reject(rejection);
		},
	};
});