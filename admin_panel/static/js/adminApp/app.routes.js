/**
 * Created by reyrodrigues on 1/3/17.
 */

angular.module("adminApp").config(function ($stateProvider, moment) {
	const analyticsContentMinBoundary = moment("2016-09-01");
	const analyticsVisitorsMinBoundary = moment("2016-09-01");
	const analyticsHotspotMinBoundary = moment("2017-03-03");
	const analyticsBalanceMinBoundary = moment("2017-03-08");
	const analyticsGasMinBoundary = moment("2016-09-15");
	const analyticsSocialMinBoundary = moment("2015-10-21");
	const analyticsMaxBoundary = moment();

	const analyticsLastWeekStartDate = moment()
		.day(-5)
		.format("YYYY-MM-DD");
	const analyticsLastWeekEndDate = moment().format("YYYY-MM-DD");

	$stateProvider
		.state("login", {
			url: "/login",
			data: {
				allowAnonymous: true,
			},
			views: {
				"login@": {
					templateUrl: "views/user/login.html",
					controller: "LoginController as ctrl",
				},
			},
		})
		.state("login.next", {
			url: "?next",
			data: {
				allowAnonymous: true,
			},
			views: {
				"login@": {
					templateUrl: "views/user/login.html",
					controller: "LoginController as ctrl",
				},
			},
		})
		.state("logout", {
			url: "/logout",
			data: {
				allowAnonymous: true,
			},
			onEnter: function (AuthService) {
				return AuthService.logout().then(function () {
					document.location = "/logout/";
				});
			},
		})
		.state("resetPassword", {
			url: "/reset_password",
			abstract: true,
		})
		.state("resetPassword.email", {
			url: "/",
			data: {
				allowAnonymous: true,
			},
			onEnter: function ($stateParams, $state, $uibModal) {
				$uibModal
					.open({
						templateUrl: "views/user/reset_password.html",
						windowTemplateUrl: "partials/directives/window.html",
						backdrop: "static",
						size: "md",
						resolve: {},
						controller: "ResetPasswordController as ctrl",
					})
					.catch(function () {});
			},
		})
		.state("resetPassword.check", {
			url: "/{uidb64:[0-9A-Za-z_-]+}/{token:[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20}}",
			data: {
				allowAnonymous: true,
			},
			onEnter: function ($stateParams, $state, $uibModal) {
				$uibModal
					.open({
						templateUrl: "views/user/reset_password.html",
						windowTemplateUrl: "partials/directives/window.html",
						backdrop: "static",
						size: "lg",
						resolve: {},
						controller: "ResetPasswordController as ctrl",
					})
					.catch(function () {});
			},
		})
		.state("home", {
			url: "/",
			data: {
				allowAnonymous: true,
			},
			views: {

				"main@": {
					template: "<div></div>",
					controller: ($state, $rootScope) => {
						/*
						 * TODO: figure out a default dashboard per user
						 * */

						if ($rootScope.selectedProvider) {
							$state.go("service.list");
						} else if($rootScope.isSuperuser) {
							$state.go("provider.list");
						}
					},
				},
			},
		})

		// Team Management
		.state("team", {
			url: "/team",
			data: {
				title: "Team Management",
			},
			views: {
				"main@": {
					templateUrl: "views/team/view.html",
					controller: "TeamController as ctrl",
				},
			},
			resolve: {},
		})


		/*
		 * Your Apps
		 * */

		// Services Management
		.state("service", {
			url: "/service",
			abstract: true,
		})
		.state("service.dashboard", {
			url: "/dashboard",
			data: {
				title: "Service overview",
			},
			views: {
				"main@": {
					templateUrl: "views/service/overview.html",
					controller: "ServiceOverviewController as ctrl",
				},
			},
			resolve: {
				provider: function (ProviderService, $rootScope, $q) {
					var dfd = $q.defer();
					$rootScope.$watch("selectedProvider", function (value) {
						if (value) {
							ProviderService.get($rootScope.selectedProvider.id).then(function (p) {
								dfd.resolve(p);
							});
						}
					});
					return dfd.promise;
				},
				services: function (ServiceService, $rootScope, $q) {
					var dfd = $q.defer();
					$rootScope.$watch("selectedProvider", function (value) {
						if (value) {
							ServiceService.get("", {
								provider: $rootScope.selectedProvider.id
							}).then(function (p) {
								dfd.resolve(p);
							});
						}
					});
					return dfd.promise;
				},
				serviceTypes: function (CommonDataService) {
					return CommonDataService.getServiceTypes();
				},
				regions: function allRegions(GeoRegionService, $q, $window) {
					var dfd = $q.defer();
					if ($window.sessionStorage.allRegions) {
						dfd.resolve(JSON.parse($window.sessionStorage.allRegions));
					} else {
						GeoRegionService.getList({
							exclude_geometry: true
						}).then(function (r) {
							var regions = r.plain().map(function (r1) {
								return {
									name: r1.name,
									centroid: r1.centroid,
									id: r1.id,
									slug: r1.slug,
								};
							});

							$window.sessionStorage.allRegions = JSON.stringify(regions);
							dfd.resolve(regions);
						});
					}
					return dfd.promise;
				},
			},
		})
		.state("service.list", {
			url: "/list",
			data: {
				title: "Service list",
			},
			views: {
				"main@": {
					templateUrl: "views/service/list-view.html",
					controller: "ServiceListController as ctrl",
				},
			},
			resolve: {
				provider: function (ProviderService, $rootScope, $q) {
					var dfd = $q.defer();
					$rootScope.$watch("selectedProvider", function (value) {
						if (value) {
							ProviderService.get($rootScope.selectedProvider.id).then(function (p) {
								dfd.resolve(p);
							});
						}
					});
					return dfd.promise;
				},
				serviceTypes: function (CommonDataService) {
					return CommonDataService.getServiceTypes();
				},
				regions: function allRegions(GeoRegionService, $q, $window) {
					var dfd = $q.defer();
					if ($window.sessionStorage.allRegions) {
						dfd.resolve(JSON.parse($window.sessionStorage.allRegions));
					} else {
						GeoRegionService.getList({
							exclude_geometry: true
						}).then(function (r) {
							var regions = r.plain().map(function (r1) {
								return {
									name: r1.name,
									centroid: r1.centroid,
									id: r1.id,
									slug: r1.slug,
								};
							});

							$window.sessionStorage.allRegions = JSON.stringify(regions);
							dfd.resolve(regions);
						});
					}
					return dfd.promise;
				},
			},
		})
		.state("service.create", {
			url: "/create",
			data: {
				title: "Service Create",
			},
			views: {
				"main@": {
					templateUrl: "views/service/service-view.html",
					controller: "ServiceOpenController as ctrl",
				},
			},
			resolve: {
				provider: function (Restangular, $rootScope) {
					if ($rootScope.selectedProvider) {
						return Restangular.one("providers", $rootScope.selectedProvider.id).get();
					} else {
						var dfd = $q.defer();
						$rootScope.$watch("selectedProvider", function () {
							conosle.log("changed??", $rootScope.selectedProvider);
							Restangular.one("providers", $rootScope.selectedProvider.id)
								.get()
								.then(function (p) {
									dfd.resolve(p);
								});
						});

						return dfd;
					}
				},
				providers: function (ProviderService, Restangular, $q) {
					var dfd = $q.defer();
					ProviderService.getList().then(function (p) {
						var providers = p.plain().map(function (ps) {
							return {
								name: ps.name,
								id: ps.id,
							};
						});
						dfd.resolve(providers);
					});
					return dfd.promise;
				},
				serviceTypes: function (CommonDataService) {
					return CommonDataService.getServiceTypes();
				},
				regions: function allRegions(GeoRegionService, $q, $window) {
					var dfd = $q.defer();
					if ($window.sessionStorage.allRegions) {
						dfd.resolve(JSON.parse($window.sessionStorage.allRegions));
					} else {
						GeoRegionService.getList({
							exclude_geometry: true
						}).then(function (r) {
							var regions = r.plain().map(function (r1) {
								return {
									name: r1.name,
									centroid: r1.centroid,
									id: r1.id,
									slug: r1.slug,
								};
							});

							$window.sessionStorage.allRegions = JSON.stringify(regions);
							dfd.resolve(regions);
						});
					}
					return dfd.promise;
				},
				service: function () {
					return {};
				},
				tags: Restangular => Restangular.all("service-tag").getList(),
				confirmationLogs: () => {
					return {};
				},
			},
		})
		.state("service.open", {
			url: "/:serviceId",
			data: {
				title: "Service Details",
			},
			views: {
				"main@": {
					templateUrl: "views/service/service-view.html",
					controller: "ServiceOpenController as ctrl",
				},
			},
			resolve: {
				provider: function (Restangular, $rootScope) {
					if ($rootScope.selectedProvider) {
						return Restangular.one("providers", $rootScope.selectedProvider.id).get();
					} else {
						var dfd = $q.defer();
						$rootScope.$watch("selectedProvider", function () {
							Restangular.one("providers", $rootScope.selectedProvider.id)
								.get()
								.then(function (p) {
									dfd.resolve(p);
								});
						});

						return dfd;
					}
				},
				providers: function (ProviderService, Restangular, $q) {
					var dfd = $q.defer();
					ProviderService.getList().then(function (p) {
						var providers = p.plain().map(function (ps) {
							return {
								name: ps.name,
								id: ps.id,
							};
						});
						dfd.resolve(providers);
					});
					return dfd.promise;
				},
				serviceTypes: function (CommonDataService) {
					return CommonDataService.getServiceTypes();
				},
				regions: function allRegions(GeoRegionService, $q, $window) {
					var dfd = $q.defer();
					if ($window.sessionStorage.allRegions) {
						dfd.resolve(JSON.parse($window.sessionStorage.allRegions));
					} else {
						GeoRegionService.getList({
							exclude_geometry: true
						}).then(function (r) {
							var regions = r.plain().map(function (r1) {
								return {
									name: r1.name,
									centroid: r1.centroid,
									id: r1.id,
									slug: r1.slug,
								};
							});

							$window.sessionStorage.allRegions = JSON.stringify(regions);
							dfd.resolve(regions);
						});
					}
					return dfd.promise;
				},
				service: function (Restangular, $stateParams) {
					return Restangular.one("services", $stateParams.serviceId).get();
				},
				tags: Restangular => Restangular.all("service-tag").getList(),
				confirmationLogs: (Restangular, $stateParams) => Restangular.one("confirmation-logs", $stateParams.serviceId).get(),
			},
		})
		.state("service.confirmation", {
			url: "/confirm/:serviceId/:confirmationKey",
			data: {
				allowAnonymous: true,
				title: "Service Confirmation",
			},
			views: {
				"main@": {
					templateUrl: "views/service/service-confirm.html",
					controller: "ServiceConfirmationController as ctrl",
				},
				"login@": {
					templateUrl: "views/service/service-confirm.html",
					controller: "ServiceConfirmationController as ctrl",
				},
			},
			resolve: {
				serviceTypes: function (CommonDataService) {
					return CommonDataService.getServiceTypes();
				},
				service: function (Restangular, $stateParams) {
					return Restangular.one("services").customGET("preview", {
						id: $stateParams.serviceId
					});
				},
			},
		})
		.state("service.duplicate", {
			url: "/duplicate/:serviceId",
			onEnter: function ($stateParams, $state, $uibModal, ServiceService, toasty) {
				$uibModal
					.open({
						templateUrl: "views/service/service-duplicate.html",
						windowTemplateUrl: "partials/directives/window.html",
						backdrop: "static",
						resolve: {
							serviceId: () => {
								return $stateParams.serviceId;
							},
						},
						controller: "ServiceDuplicateController as ctrl",
					})
					.result.then(data => {
						return ServiceService.duplicate(data.serviceId, data.newName).then(() => {
							toasty.success({
								msg: "Service successfully duplicated.",
								clickToClose: true,
								showClose: false,
								sound: false,
							});
							$state.go('service.list');
						});
					})
					.catch(() => {
						$state.go('service.list');
					});
			},
		})
		.state("service.archive", {
			url: "/archive/:serviceId",
			onEnter: function ($stateParams, $state, $uibModal, ServiceService, toasty) {
				$uibModal
					.open({
						templateUrl: "views/service/service-archive.html",
						windowTemplateUrl: "partials/directives/window.html",
						backdrop: "static",
						resolve: {
							serviceId: () => {
								return $stateParams.serviceId;
							},
						},
						controller: "ServiceArchiveController as ctrl",
					})
					.result.then(serviceId => {
						return ServiceService.archive(serviceId).then(() => {
							toasty.success({
								msg: "Service successfully archived.",
								clickToClose: true,
								showClose: false,
								sound: false,
							});
							$state.go('service.list');
						});
					})
					.catch(() => {
						$state.go('service.list');
					});
			},
		})

		.state("newsletter", {
			url: "/newsletter",
			abstract: true,
		})

		.state("newsletter.logs", {
			url: "/logs",
			data: {
				title: "Newsletter Logs",
			},
			views: {
				"main@": {
					templateUrl: "views/newsletter/confirmation-log-list.html",
					controller: "ConfirmationLogListController as ctrl",
				},
			},
			resolve: {
				confirmationLogs: Restangular => Restangular.all("confirmation-log-list").getList(),
			},
		})

		.state("newsletter.settings", {
			url: "/settings",
			data: {
				title: "Newsletter Settings",
			},
			views: {
				"main@": {
					templateUrl: "views/newsletter/newsletter-settings.html",
					controller: "NewsletterSettingsController as ctrl",
				},
			},
			resolve: {
				settings: Restangular => Restangular.all("settings").getList(),
			},
		})

		/*
		 * Instance Admin
		 * */

		.state("settings", {
			url: "/settings",
			data: {
				title: "Account Settings",
			},
			views: {
				"main@": {
					templateUrl: "views/user/view.html",
					controller: "UserViewController as ctrl",
				},
			},
			resolve: {
				user: function (Restangular, $rootScope) {
					return Restangular.one("users", $rootScope.user.id).get();
				},
				groups: function (Restangular) {
					return Restangular.all("groups").getList();
				},
			},
		})

		// Users Management
		.state("user", {
			url: "/user",
			abstract: true,
		})
		.state("user.list", {
			url: "/",
			data: {
				title: "System Users",
			},
			views: {
				"main@": {
					templateUrl: "views/generic/table-view.html",
					controller: "UserListController as ctrl",
				},
			},
			resolve: {
				tableData: UserService => UserService.forDataTables,
			},
		})
		.state("user.create", {
			url: "/create",
			data: {
				title: "Create System User",
			},
			views: {
				"main@": {
					templateUrl: "views/user/view.html",
					controller: "UserViewController as ctrl",
				},
			},
			resolve: {
				user: () => {
					return {};
				},
				groups: Restangular => Restangular.all("groups").getList(),
			},
		})
		.state("user.open", {
			url: "/:id",
			data: {
				title: "System User",
			},
			views: {
				"main@": {
					templateUrl: "views/user/view.html",
					controller: "UserViewController as ctrl",
				},
			},
			resolve: {
				user: function (Restangular, $stateParams) {
					return Restangular.one("users", $stateParams.id).get();
				},
				groups: function (Restangular) {
					return Restangular.all("groups").getList();
				},
			},
		})

		// Service Provider Management
		.state("provider", {
			url: "/provider",
			abstract: true,
		})
		.state("provider.list", {
			url: "/",
			data: {
				title: "Service Providers",
			},
			views: {
				"main@": {
					templateUrl: "views/generic/table-view.html",
					controller: "ProviderListController as ctrl",
				},
			},
			resolve: {
				providerTypes: function (CommonDataService) {
					return CommonDataService.getProviderTypes();
				},
			},
		})
		.state("provider.openMe", {
			url: "/me",
			data: {
				title: "Service Provider",
			},
			views: {
				"main@": {
					templateUrl: "views/provider/view.html",
					controller: "ProviderOpenController as ctrl",
				},
			},
			resolve: {
				providerTypes: function (CommonDataService) {
					return CommonDataService.getProviderTypes();
				},
				serviceAreas: function (CommonDataService) {
					return CommonDataService.getServiceAreas();
				},
				systemUsers: function (CommonDataService) {
					return CommonDataService.getUsersForLookup();
				},
				provider: function (ProviderService, $rootScope, $q) {
					var dfd = $q.defer();
					$rootScope.$watch("selectedProvider", function (value) {
						if (value) {
							ProviderService.get($rootScope.selectedProvider.id).then(function (p) {
								dfd.resolve(p);
							});
						}
					});
					return dfd.promise;
				},
			},
		})
		.state("provider.dashboard", {
			url: "/dashboard",
			data: {
				title: "Service Provider Dashboard",
			},
			views: {
				"main@": {
					templateUrl: "views/provider/view.html",
					controller: "ProviderOpenController as ctrl",
				},
			},
			resolve: {
				providerTypes: function (CommonDataService) {
					return CommonDataService.getProviderTypes();
				},
				serviceAreas: function (CommonDataService) {
					return CommonDataService.getServiceAreas();
				},
				systemUsers: function (CommonDataService) {
					return CommonDataService.getUsersForLookup();
				},
				provider: function (ProviderService, $rootScope, $q) {
					var dfd = $q.defer();
					$rootScope.$watch("selectedProvider", function (value) {
						if (value) {
							ProviderService.get($rootScope.selectedProvider.id).then(function (p) {
								dfd.resolve(p);
							});
						}
					});
					return dfd.promise;
				},
			},
		})
		.state("provider.create", {
			url: "/create",
			data: {
				title: "Service Provider Create",
			},
			views: {
				"main@": {
					templateUrl: "views/provider/view.html",
					controller: "ProviderOpenController as ctrl",
				},
			},
			resolve: {
				providerTypes: function (CommonDataService) {
					return CommonDataService.getProviderTypes();
				},
				serviceAreas: function (CommonDataService) {
					return CommonDataService.getServiceAreas();
				},
				systemUsers: function (CommonDataService) {
					return CommonDataService.getUsersForLookup();
				},
				provider: function () {
					return {};
				},
				regions: function allRegions(GeoRegionService, $q, $window) {
					var dfd = $q.defer();
					if ($window.sessionStorage.allRegions) {
						dfd.resolve(JSON.parse($window.sessionStorage.allRegions));
					} else {
						GeoRegionService.getList({
							exclude_geometry: true
						}).then(function (r) {
							var regions = r.plain().map(function (r1) {
								return {
									name: r1.name,
									centroid: r1.centroid,
									id: r1.id,
									slug: r1.slug,
								};
							});

							$window.sessionStorage.allRegions = JSON.stringify(regions);
							dfd.resolve(regions);
						});
					}
					return dfd.promise;
				},
			},
		})
		.state("provider.open", {
			url: "/:id",
			data: {
				title: "Service Provider",
			},
			views: {
				"main@": {
					templateUrl: "views/provider/view.html",
					controller: "ProviderOpenController as ctrl",
				},
			},
			resolve: {
				providerTypes: function (CommonDataService) {
					return CommonDataService.getProviderTypes();
				},
				serviceAreas: function (CommonDataService) {
					return CommonDataService.getServiceAreas();
				},
				systemUsers: function (CommonDataService) {
					return CommonDataService.getUsersForLookup();
				},
				provider: function (ProviderService, $stateParams) {
					return ProviderService.get($stateParams.id);
				},
				regions: function allRegions(GeoRegionService, $q, $window) {
					var dfd = $q.defer();
					if ($window.sessionStorage.allRegions) {
						dfd.resolve(JSON.parse($window.sessionStorage.allRegions));
					} else {
						GeoRegionService.getList({
							exclude_geometry: true
						}).then(function (r) {
							var regions = r.plain().map(function (r1) {
								return {
									name: r1.name,
									centroid: r1.centroid,
									id: r1.id,
									slug: r1.slug,
								};
							});

							$window.sessionStorage.allRegions = JSON.stringify(regions);
							dfd.resolve(regions);
						});
					}
					return dfd.promise;
				},
			},
		})
		.state("provider.impersonate", {
			url: "/:id/impersonate",
			resolve: {
				provider: function (ProviderService, $stateParams) {
					return ProviderService.get($stateParams.id);
				},
			},
			onEnter: ($rootScope, $state, provider, ProviderService) => {
				if ($rootScope.user.isSuperuser) {
					ProviderService.impersonateProvider(provider.id).then(() => {
						$rootScope.selectedProvider = provider;
						$state.go('service.list');
					});
				} else {
					$state.go('home');
				}
			},
		})

		//Geographic Regions
		.state("region", {
			url: "/region",
			abstract: true,
		})
		.state("region.list", {
			url: "/",
			data: {
				title: "Geographic Regions",
			},
			views: {
				"main@": {
					templateUrl: "views/generic/table-view.html",
					controller: "RegionListController as ctrl",
				},
			},
			resolve: {},
		})
		.state("region.create", {
			url: "/create",
			data: {
				title: "Create Geographic Region",
			},
			views: {
				"main@": {
					templateUrl: "views/region/view.html",
					controller: "RegionViewController as ctrl",
				},
			},
			resolve: {
				region: function ($q) {
					var dfd = $q.defer();
					dfd.resolve({});
					return dfd.promise;
				},
				allRegions: function (GeoRegionService, $q, $window) {
					var dfd = $q.defer();
					if ($window.sessionStorage.allRegions) {
						dfd.resolve(JSON.parse($window.sessionStorage.allRegions));
					} else {
						GeoRegionService.getList({
							exclude_geometry: true
						}).then(function (r) {
							var regions = r.plain().map(function (r1) {
								return {
									name: r1.name,
									centroid: r1.centroid,
									id: r1.id,
									slug: r1.slug,
								};
							});

							$window.sessionStorage.allRegions = JSON.stringify(regions);
							dfd.resolve(regions);
						});
					}
					return dfd.promise;
				},
			},
		})
		.state("region.open", {
			url: "/:id",
			data: {
				title: "Geographic Region",
			},
			views: {
				"main@": {
					templateUrl: "views/region/view.html",
					controller: "RegionViewController as ctrl",
				},
			},
			resolve: {
				region: function (GeoRegionService, $stateParams) {
					return GeoRegionService.get($stateParams.id);
				},
				allRegions: function (GeoRegionService, $q, $window) {
					var dfd = $q.defer();
					if ($window.sessionStorage.allRegions) {
						dfd.resolve(JSON.parse($window.sessionStorage.allRegions));
					} else {
						GeoRegionService.getList({
							exclude_geometry: true
						}).then(function (r) {
							var regions = r.plain().map(function (r1) {
								return {
									name: r1.name,
									centroid: r1.centroid,
									id: r1.id,
									slug: r1.slug,
								};
							});

							$window.sessionStorage.allRegions = JSON.stringify(regions);
							dfd.resolve(regions);
						});
					}
					return dfd.promise;
				},
			},
		})

		// Blog
		.state("blog", {
			url: "/blog",
			abstract: true,
		})
		.state("blog.list", {
			url: "/",
			data: {
				title: "Blog Entry Translations",
			},
			views: {
				"main@": {
					templateUrl: "views/generic/table-view.html",
					controller: "BlogListController as ctrl",
				},
			},
			resolve: {},
		})

		.state("blog.list.push", {
			url: ":id/push",
			onEnter: ($stateParams, $state, toasty, $timeout, BlogService) => {
				$timeout(() => {
					BlogService.pushToTransifex($stateParams.id).then(() => {
						toasty.success({
							msg: "Blog post uploaded to transifex.",
							clickToClose: true,
							showClose: false,
							sound: false,
						});
						$state.go("^").then(() => $state.reload());
					});
				});
			},
		})

		.state("blog.list.pull", {
			url: ":id/pull",
			onEnter: ($stateParams, $state, toasty, $timeout, BlogService) => {
				$timeout(() => {
					BlogService.pullFromTransifex($stateParams.id).then(() => {
						toasty.success({
							msg: "Completed translations uploaded to blog.",
							clickToClose: true,
							showClose: false,
							sound: false,
						});
						$state.go("^").then(() => $state.reload());
					});
				});
			},
		})

		// Controlled Lists

		.state("lists", {
			url: "/lists",
			abstract: true,
		})
		.state("lists.serviceType", {
			url: "/serviceType",
			abstract: true,
		})
		.state("lists.serviceType.list", {
			url: "/",
			data: {
				title: "Service Types",
			},
			views: {
				"main@": {
					templateUrl: "views/generic/table-view.html",
					controller: "ServiceTypeListController as ctrl",
				},
			},
			resolve: {},
		})
		.state("lists.serviceType.create", {
			url: "/create",
			data: {
				title: "New Service Type",
			},
			views: {
				"main@": {
					templateUrl: "views/lists/serviceType/view.html",
					controller: "ServiceTypeViewController as ctrl",
				},
			},
			resolve: {
				object: function ($q) {
					var dfd = $q.defer();
					dfd.resolve({});
					return dfd.promise;
				},
				serviceTypes: function (CommonDataService) {
					return CommonDataService.getServiceTypes();
				},
			},
		})
		.state("lists.serviceType.open", {
			url: "/:id",
			data: {
				title: "Service Type",
			},
			views: {
				"main@": {
					templateUrl: "views/lists/serviceType/view.html",
					controller: "ServiceTypeViewController as ctrl",
				},
			},
			resolve: {
				object: function (ServiceTypeService, $stateParams) {
					return ServiceTypeService.get($stateParams.id);
				},
				serviceTypes: function (CommonDataService) {
					return CommonDataService.getServiceTypes();
				},
			},
		})

		.state("lists.providerType", {
			url: "/providerType",
			abstract: true,
		})
		.state("lists.providerType.list", {
			url: "/",
			data: {
				title: "Provider Types",
			},
			views: {
				"main@": {
					templateUrl: "views/generic/table-view.html",
					controller: "ProviderTypeListController as ctrl",
				},
			},
			resolve: {},
		})
		.state("lists.providerType.create", {
			url: "/create",
			data: {
				title: "New Provider Type",
			},
			views: {
				"main@": {
					templateUrl: "views/lists/providerType/view.html",
					controller: "ProviderTypeOpenController as ctrl",
				},
			},
			resolve: {
				object: function ($q) {
					var dfd = $q.defer();
					dfd.resolve({});
					return dfd.promise;
				},
			},
		})
		.state("lists.providerType.open", {
			url: "/:id",
			data: {
				title: "Provider Type",
			},
			views: {
				"main@": {
					templateUrl: "views/lists/providerType/view.html",
					controller: "ProviderTypeOpenController as ctrl",
				},
			},
			resolve: {
				object: function (ProviderTypeService, $stateParams) {
					return ProviderTypeService.get($stateParams.id);
				},
			},
		})
});