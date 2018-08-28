/**
 * Created by reyrodrigues on 1/3/17.
 */

const HIDE_NOT_YET_IMPLEMENTED = true;
angular.module("adminApp").controller("MenuController", function ($rootScope, $state, $filter, siteName) {
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
						title: $filter('translate')('SERVICE_SEARCH'),
						sref: "service.search",
					},
					{
						title: $filter('translate')('SERVICE_MANAGEMENT'),
						sref: "service.list",
						hide: !((($rootScope.user.groups.filter(g => g.name === 'Providers').length > 0) || $rootScope.user.isSuperuser) && $rootScope.selectedProvider.id),
					},
					{
						title: $filter('translate')('SERVICE_LINK_TO_WEB_APP'),
						sref: "service.map",
						href: "https://www.cuentanos.org",
						target: "_blank",
						hide: ($rootScope.user.site.domain && $rootScope.user.site.domain.indexOf('refugee.info') > -1)
					},
				],
			},
			{
				title: $filter('translate')('PROFILE'),
				items: [{
						title: $filter('translate')('ACCOUNT_SETTINGS'),
						sref: "settings",
						active: $state.includes("settings"),
					},
					{
						title: $filter('translate')('PROVIDER_SETTINGS'),
						sref: "provider.openMe",
						hide: !((($rootScope.user.groups.filter(g => g.name === 'Providers').length > 0) || $rootScope.user.isSuperuser) && $rootScope.selectedProvider.id),
					},
				],
			},
			{
				title: $filter('translate')('REFUGEE_ADMIN'),
				items: [{
						title: $filter('translate')('BLOG_ENTRY_TRANSLATIONS'),
						sref: "blog.list",
						active: $state.includes("blog"),
					},

					{
						title: $filter('translate')('SERVICE_NEWSLETTER'),
						active: $state.includes("newsletter"),
						items: [{
							title: $filter('translate')('NEWSLETTER_LOGS'),
							sref: "newsletter.logs"
						}, {
							title: $filter('translate')('NEWSLETTER_SETTINGS'),
							sref: "newsletter.settings"
						}],
						hide: !$rootScope.user.isSuperuser,
					},
				],
				hide: !$rootScope.user.isSuperuser || !($rootScope.user.site && $rootScope.user.site.domain && $rootScope.user.site.domain.indexOf('refugee.info') > -1),
			},
			{
				title: $filter('translate')('SYSTEM_ADMIN'),
				items: [{
						title: $filter('translate')('USER_MANAGEMENT'),
						sref: "user.list",
						active: $state.includes("user")
					},
					{
						title: $filter('translate')('SERVICE_PROVIDER_MANAGEMENT'),
						sref: "provider.list",
						active: $state.includes("provider"),
					},
					{
						title: $filter('translate')('GEOGRAPHIC_REGIONS'),
						sref: "region.list",
						active: $state.includes("region")
					},
					{
						title: $filter('translate')('CONTROLLED_LISTS_MANAGEMENT'),
						active: $state.includes("lists"),
						items: [{
								title: $filter('translate')('SERVICES_TYPES'),
								sref: "lists.serviceType.list",
								active: $state.includes("lists.serviceType"),
							},
							{
								title: $filter('translate')('PROVIDER_TYPES'),
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