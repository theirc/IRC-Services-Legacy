/**
 * Created by reyrodrigues on 1/3/17.
 */

const HIDE_NOT_YET_IMPLEMENTED = true;
angular.module("adminApp").controller("MenuController", function($rootScope, $state) {
	var vm = this;
	var updateMenu = function() {
		vm.menuItems = getMenuItems();
	};

	$rootScope.$watch("selectedProvider", updateMenu);
	$rootScope.$watch("countries", updateMenu);
	$rootScope.$on("$stateChangeSuccess", updateMenu);

	let user = $rootScope.user;

	vm.$state = $state;
	vm.menuItems = getMenuItems();

	function getMenuItems() {
		return [
			{
				title: "MENU",
				items: [
					{
						title: "Dashboards",
						active: $state.includes("analytics"),
						items: [
							{
								title: "Content",
								sref: "analytics.content",
								active: $state.includes("analytics.content"),
							},
							{
								title: "Visitors",
								sref: "analytics.visitors",
								active: $state.includes("analytics.visitors"),
							},
							{
								title: "Hotspots",
								sref: "analytics.hotspots",
								active: $state.includes("analytics.hotspots"),
							},
							{
								title: "Social Media",
								sref: "analytics.social",
								active: $state.includes("analytics.social"),
							},
						],
					},
					{
						title: "Team Management",
						sref: "team",
						active: $state.includes("team"),
						hide: HIDE_NOT_YET_IMPLEMENTED,
					},
					{
						title: "Calendar & Events",
						sref: "calendar",
						active: $state.includes("calendar"),
						hide: HIDE_NOT_YET_IMPLEMENTED,
					},
					{
						title: "What's new",
						sref: "whatsNew",
						active: $state.includes("whatsNew"),
						hide: HIDE_NOT_YET_IMPLEMENTED,
					},
				],
				hide: HIDE_NOT_YET_IMPLEMENTED,
			},
			{
				title: "MENU",
				items: [
					{
						title: "Service Newsletter",
						active: $state.includes("newsletter"),
						items: [{ title: "Newsletter Logs", sref: "newsletter.logs" }, { title: "Newsletter Settings", sref: "newsletter.settings" }],
						hide: !$rootScope.user.isSuperuser,
					},
					{
						title: "Service Management",
						active: $state.includes("service"),
						items: [{ title: "Services Overview", sref: "service.dashboard" }, { title: "Services Management", sref: "service.list" }],
						hide: !($rootScope.permissions && $rootScope.permissions.servicesAdd && $rootScope.selectedProvider),
					},
					{
						title: "Content Management",
						sref: 'countryChoice({environment: "staging"})',
						active: $state.includes("countryChoice"),
						hide: HIDE_NOT_YET_IMPLEMENTED,
					},
					{
						title: "Social Media",
						active: $state.includes("social"),
						items: [
							{
								title: "Conversations",
								sref: "social.conversation.list",
								active: $state.includes("conversation"),
							},
						],
						hide: HIDE_NOT_YET_IMPLEMENTED,
					},
					{
						title: "Balance Checker",
						sref: "balance",
						active: $state.includes("balance"),
						hide: HIDE_NOT_YET_IMPLEMENTED,
					},
					{
						title: "GAS Search Tool",
						sref: "gas",
						active: $state.includes("gas"),
						hide: HIDE_NOT_YET_IMPLEMENTED,
					},
				],
			},
			{
				title: "PROFILE",
				items: [
					{
						title: "Notifications",
						sref: "notifications",
						active: $state.includes("notifications"),
						hide: HIDE_NOT_YET_IMPLEMENTED,
					},
					{
						title: "Account Settings",
						sref: "settings",
						active: $state.includes("settings"),
					},
					{
						title: "Tutorials and Support",
						sref: "tutorials",
						active: $state.includes("tutorials"),
						hide: HIDE_NOT_YET_IMPLEMENTED,
					},
					{
						title: "Contact Us",
						sref: "contactUs",
						active: $state.includes("contactUs"),
						hide: HIDE_NOT_YET_IMPLEMENTED,
					},
				],
			},
			{
				title: "REFUGEE.INFO ADMIN",
				items: [
                    {
                        title: "Blog Entry Translations",
                        sref: "blog.list",
                        active: $state.includes("blog"),
                    }
                    ,
					{ title: "User Management", sref: "user.list", active: $state.includes("user") },
					{
						title: "Service Provider Management",
						sref: "provider.list",
						active: $state.includes("provider"),
					},
					{ title: "Geographic Regions", sref: "region.list", active: $state.includes("region") },
					{
                        title: "App Management",
						sref: "apps.manage.list",
						active: $state.includes("apps"),
						hide: HIDE_NOT_YET_IMPLEMENTED,
                    }
                    ,
					{
						title: "Controlled Lists Management",
						active: $state.includes("lists"),
						items: [
							{
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
			.map(function(s) {
				return $state.includes(s);
			})
			.reduce(function(a, b) {
				return a || b;
			}, false);
	}
});
