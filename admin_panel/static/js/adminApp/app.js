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
	.config(function ($stateProvider, $urlRouterProvider, $interpolateProvider, $httpProvider, $locationProvider, RestangularProvider, $authProvider) {

		$httpProvider.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
		$httpProvider.defaults.xsrfCookieName = "csrftoken";
		$httpProvider.defaults.xsrfHeaderName = "X-CSRFToken";
		$httpProvider.interceptors.push("HttpRequestAuthInterceptor");
		$httpProvider.interceptors.push("HttpRequestLoadingInterceptor");
		$locationProvider.hashPrefix("");

		$urlRouterProvider.otherwise("/");

		RestangularProvider.addResponseInterceptor(function (data, operation) {
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
	.run(function ($window, Restangular, $rootScope, $state, $stateParams, $cookies, logoName, staticUrl, userRegion, languages, service_languages, user, selectedProvider, permissions, AuthService, GeoRegionService, ProviderService) {
		Restangular.setBaseUrl($window.API_URL + "/v2/");
		Restangular.setRequestSuffix("/");

		$rootScope.idHelper = function (name, lang) {
			let l = _.clone(lang);
			if (_.isArray(l)) {
				l = lang[0];
			}
			return name + "_" + l;
		};

		$rootScope.isRtl = function (lang) {
			let l = _.clone(lang);

			if (_.isArray(l)) {
				l = lang[0];
			}
			return ["ar", "fa", "ur"].indexOf(l) > -1;
		};

		$rootScope.fieldHelper = function (obj, name, lang) {
			return obj[$rootScope.idHelper(name, lang)];
		};
		$rootScope.logoName = logoName;
		$rootScope.user = user;
		$rootScope.staticUrl = staticUrl;
		$rootScope.userRegion = userRegion;
		$rootScope.languages = languages;

		if ($rootScope.userRegion && !user.isSuperuser) {
			let langs = userRegion.languages_available.split(', ').filter(a => a);
			$rootScope.languages = languages.filter(a => langs.indexOf(a[0]) > -1);
		}

		$rootScope.serviceLanguages = $rootScope.languages;
		$rootScope.$state = $state;


		GeoRegionService.getList({
			level: 1,
			exclude_geometry: true
		}).then(function (c) {
			$rootScope.countries = c.plain();
		});

		var hasPermission = function (p, model, action) {
			return !!p.filter(function (permission) {
				if (model == "analytics") {
					return permission.split("_analytics")[0].split(".")[1] == action;
				}
				var perm = permission.split(".")[1].split("_");
				if (action == perm[0] && model == perm[1]) {
					return permission;
				}
			}).length;
		}.bind(this, permissions.permissions);

		var isStaff = function (u) {
			return u && u.isStaff;
		}.bind(this, user);

		$rootScope.permissions = Object.assign({
			servicesAdd: hasPermission("services", "add") || isStaff(),
			servicesChange: hasPermission("services", "change") || isStaff(),
			servicesDelete: hasPermission("services", "delete") || isStaff(),
		}, permissions);

		if (selectedProvider) {
			$rootScope.selectedProvider = selectedProvider;
		} else if ($rootScope.user.providers.length == 1) {
			$rootScope.selectedProvider = $rootScope.user.providers[0];
		}

	});