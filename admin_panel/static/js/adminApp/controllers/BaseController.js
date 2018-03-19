angular.module("adminApp").controller("BaseController", function ($scope, $rootScope, $state, $stateParams, $window, $cookies, AuthService, userEmail) {
	var vm = this;

	/**
	 *
	 * @param model: database table name, like 'contentpage'
	 * @param action: one of ['change', 'add', 'delete']
	 * @returns filtered permission, use with ng-if
	 */
	vm.hasPermission = function (model, action) {
		if (vm.user && vm.user.permissions && vm.user.permissions.length) {
			return !!vm.user.permissions.filter(function (permission) {
				if (model == "analytics") {
					return permission.split("_analytics")[0].split(".")[1] == action;
				}
				var perm = permission.split(".")[1].split("_");
				if (action == perm[0] && model == perm[1]) {
					return permission;
				}
			}).length;
		}
	};

	vm.isStaff = function () {
		return vm.user && vm.user.isStaff;
	};

	vm.getPermissions = function () {
		vm.user.permissions = $rootScope.permissions;

		$rootScope.permissions = Object.assign({
			contentPageAdd: vm.hasPermission("contentpage", "add") || vm.isStaff(),
			servicesChange: vm.hasPermission("services", "change") || vm.isStaff(),
			servicesDelete: vm.hasPermission("services", "delete") || vm.isStaff(),
		}, $rootScope.permissions);
	};

	vm.isAuthenticated = function () {
		if (vm.user && vm.user.isAuthenticated) {
			return vm.user.isAuthenticated;
		}
	};

	vm.login = function () {
		return AuthService.login(vm.user)
			.then(function (response) {
				delete vm.user.password;

				vm.user.permissions = null;
				vm.user.token = response.data.token;
				vm.user.email = response.data.email;
				vm.user.isStaff = response.data.is_staff;
				vm.user.isAuthenticated = true;
				vm.user.name = response.data.name;
				vm.user.surname = response.data.surname;

				$cookies.putObject("user", vm.user);
				//$window.location.href = '/cms';
			})
			.catch(function () {
				vm.loginForm.$setPristine();
				$cookies.remove("user");
				$cookies.remove("permissions");
				vm.user.password = "";
				vm.errorMessage = "Incorrect email or password.";
			});
	};

	vm.logout = function () {
		return AuthService.logout().then(function () {
			vm.user = undefined;

			$cookies.remove("user");
			$cookies.remove("permissions");

			$window.location.href = '/logout/';
		});
	};

	vm.language = "en";

	if (!vm.user) {
		vm.user =  $rootScope.user;
	}

	vm.isStaging = function () {
		return $stateParams.environment == "staging";
	};

	$rootScope.isLoading = false;
});