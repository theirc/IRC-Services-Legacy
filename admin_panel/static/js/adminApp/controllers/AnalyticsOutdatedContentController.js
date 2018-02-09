angular.module('adminApp').controller('AnalyticsOutdatedContentController', function (outdated) {
    let vm = this;

    this.$onInit = () => {
        vm.outdated = outdated;
    };
});
