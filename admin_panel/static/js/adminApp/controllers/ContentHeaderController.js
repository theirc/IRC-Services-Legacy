/**
 * Created by reyrodrigues on 1/3/17.
 */

angular.module('adminApp')
    .controller('ContentHeaderController', function ($state) {
        var vm = this;

        vm.state = $state.current;
    });