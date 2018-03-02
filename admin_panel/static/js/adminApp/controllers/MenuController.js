/**
 * Created by reyrodrigues on 1/3/17.
 */

const HIDE_NOT_YET_IMPLEMENTED = true;
angular.module("adminApp").controller("MenuController", function ($rootScope, $state) {
	var vm = this;
	var updateMenu = function () {
		vm.menuItems = getMenuItems();
	};

	$rootScope.$watch("selectedProvider", updateMenu);
	$rootScope.$watch("countries", updateMenu);
	$rootScope.$on("$stateChangeSuccess", updateMenu);

	let user = $rootScope.user;

	vm.$state = $state;
	vm.menuItems = getMenuItems();

	function getMenuItems() {
		return [{
				title: "MENU",
				items: [{
						title: "Service Map",
						sref: "service.private"
					},
					{
						title: "Service Management",
						active: $state.includes("service"),
						items: [{
							title: "Services Overview",
							sref: "service.dashboard"
						}, {
							title: "Services Management",
							sref: "service.list"
						}],
						hide: !($rootScope.permissions && $rootScope.permissions.servicesAdd && $rootScope.selectedProvider),
					},
				],
			},
			{
				title: "PROFILE",
				items: [{
					title: "Account Settings",
					sref: "settings",
					active: $state.includes("settings"),
				}, ],
			},
			{
				title: "REFUGEE.INFO ADMIN",
				items: [{
						title: "Blog Entry Translations",
						sref: "blog.list",
						active: $state.includes("blog"),
					},

					{
						title: "Service Newsletter",
						active: $state.includes("newsletter"),
						items: [{
							title: "Newsletter Logs",
							sref: "newsletter.logs"
						}, {
							title: "Newsletter Settings",
							sref: "newsletter.settings"
						}],
						hide: !$rootScope.user.isSuperuser,
					},
				],
				hide: !$rootScope.user.isSuperuser,
			},
			{
				title: "SYSTEM ADMIN",
				items: [{
						title: "User Management",
						sref: "user.list",
						active: $state.includes("user")
					},
					{
						title: "Service Provider Management",
						sref: "provider.list",
						active: $state.includes("provider"),
					},
					{
						title: "Geographic Regions",
						sref: "region.list",
						active: $state.includes("region")
					},
					{
						title: "Controlled Lists Management",
						active: $state.includes("lists"),
						items: [{
								title: "Service Types",
								sref: "lists.serviceType.list",
								active: $state.includes("lists.serviceType"),
							},
							{
								title: "Provider Types",
								sref: "lists.providerType.list",
								active: $state.includes("lists.providerType"),
							},
						],
					},
				],
				hide: !$rootScope.user.isSuperuser,
			},
		];
	}

	function stateIncludes() {
		if (!$state.current && !$state.current.name) {
			return false;
		}

		var states = Array.prototype.slice.call(arguments);
		return states
			.map(function (s) {
				return $state.includes(s);
			})
			.reduce(function (a, b) {
				return a || b;
			}, false);
	}
});