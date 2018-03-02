/**
 * Created by reyrodrigues on 1/1/17.
 */
angular
	.module("adminApp", [
		"ui.router",
		"ngCookies",
		"ngAnimate",
		"ckeditor",
		"angular-toasty",
		"ngSanitize",
		"ui.select",
		"ui.bootstrap",
		"dndLists",
		"ncy-angular-breadcrumb",
		"restangular",
		"datatables",
		"nemLogging",
		"satellizer",
		"ngFileUpload",
		"chart.js",
		"leaflet-directive",
		"angularMoment",
		"daterangepicker",
		"color.picker",
		"ngMaterial",
		"angularSpinner",
	])
	.config(function($stateProvider, $urlRouterProvider, $interpolateProvider, $httpProvider, $locationProvider, RestangularProvider, $authProvider) {

		$httpProvider.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
		$httpProvider.defaults.xsrfCookieName = "csrftoken";
		$httpProvider.defaults.xsrfHeaderName = "X-CSRFToken";
		$httpProvider.interceptors.push("HttpRequestAuthInterceptor");
		$httpProvider.interceptors.push("HttpRequestLoadingInterceptor");
		$locationProvider.hashPrefix("");

        $urlRouterProvider.otherwise("/");
        
		RestangularProvider.addResponseInterceptor(function(data, operation) {
			if (operation === "getList" && data.hasOwnProperty("results")) {
				data.results._meta = {
					recordsTotal: data.count,
					recordsFiltered: data.count,
					next: data.next,
					previous: data.previous,
				};
				return data.results;
			}

			return data;
		});
	})
	.run(function($window, Restangular, $rootScope, $state, $stateParams, $cookies, staticUrl, languages, service_languages, AuthService, GeoRegionService, ProviderService) {
		Restangular.setBaseUrl($window.API_URL + "/v2/");
		Restangular.setRequestSuffix("/");

		$rootScope.idHelper = function(name, lang) {
			let l = _.clone(lang);
			if (_.isArray(l)) {
				l = lang[0];
			}
			return name + "_" + l;
		};

		$rootScope.isRtl = function(lang) {
			let l = _.clone(lang);

			if (_.isArray(l)) {
				l = lang[0];
			}
			return ["ar", "fa", "ur"].indexOf(l) > -1;
		};

		$rootScope.fieldHelper = function(obj, name, lang) {
			return obj[$rootScope.idHelper(name, lang)];
		};
		$rootScope.staticUrl = staticUrl;
		$rootScope.languages = languages;
		$rootScope.serviceLanguages = service_languages;
		$rootScope.$state = $state;

		$rootScope.$watch("user", function() {
			if ($rootScope.user) {
				AuthService.me()
					.then(function() {
						ProviderService.myProviders()
							.then(function(p) {
								$rootScope.user.providers = p.plain();
								if ($rootScope.user.providers.length == 1) {
									$rootScope.selectedProvider = $rootScope.user.providers[0];
								}
							})
							.then(
								GeoRegionService.getList({ level: 1, exclude_geometry: true }).then(function(c) {
									$rootScope.countries = c.plain();
								})
							);
					})
					.catch(function(error) {
						if (error.status == 401) {
							return AuthService.logout().then(function() {
								$cookies.remove("user");
								$cookies.remove("permissions");
								$window.location.reload();
							});
						}
					});
			}
		});

		// Change title based on the `data` object in routes
		$rootScope.$on("$stateChangeStart", function(event, toState) {
			var allowAnonymous = toState.data && toState.data.allowAnonymous;
			if (!allowAnonymous && !$rootScope.user) {
				event.preventDefault();
				let demandLocation = window.location.hash;

				if (demandLocation !== "#/") {
					$state.go("login.next", { next: demandLocation });
				} else {
					$state.go("login");
				}
			}
		});
	});
