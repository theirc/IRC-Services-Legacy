angular.module('adminApp').directive('timePicker', function () {
    return {
        restrict: 'E',
        templateUrl: 'partials/time-picker.html',
        scope: {
            timeModel: '=',
            day: '='
        },
        controller: function ($scope) {
            var i;
            var vm = this;
            vm.timeHoursRange = [{
                name: ' ',
                value: null
            }];

            vm.startingTimeHoursRange = [];
            vm.endingTimeHoursRange = [];
            vm.startingTimeMinutesRange = [];
            vm.endingTimeMinutesRange = [];

            // For hours dropdown (12 hour format)
            for (i = 1; i <= 12; i++) {
                vm.timeHoursRange.push({
                    name: (i < 10) ? ('0' + i) : i + '',
                    value: (i < 10) ? ('0' + i) : i + ''
                });
            }

            // For minutes dropdown
            vm.timeMinutesRange = [
                {name: ' ', value: null},
                {name: '00', value: '00'},
                {name: '15', value: '15'},
                {name: '30', value: '30'},
                {name: '45', value: '45'}
            ]

            // For format dropdown
            vm.formatRange = [
                {name: ' ', value: null},
                {name: 'am', value: 'am' },
                {name: 'pm', value: 'pm' }
            ];

            vm.startingTimeHoursRange = angular.copy(vm.timeHoursRange);
            vm.endingTimeHoursRange = angular.copy(vm.timeHoursRange);
            vm.startingFormatRange = angular.copy(vm.formatRange);
            vm.startingTimeMinutesRange = angular.copy(vm.timeMinutesRange);
            vm.endingTimeMinutesRange = angular.copy(vm.timeMinutesRange);
            vm.endingFormatRange = angular.copy(vm.formatRange);

            vm.setInitialTime = function () {
                var openTime = $scope.timeModel['open'];
                var closeTime = $scope.timeModel['close'];
                vm.startingHour = openTime ? moment(openTime, 'HH:mm:ss').format('hh') : null;
                vm.startingMinute = openTime ? moment(openTime, 'HH:mm:ss').format('mm') : null;
                vm.startingFormat = openTime ? moment(openTime, 'HH:mm:ss').format('a') : null;
                vm.endingHour = closeTime ? moment(closeTime, 'HH:mm:ss').format('hh') : null;
                vm.endingMinute = closeTime ? moment(closeTime, 'HH:mm:ss').format('mm') : null;
                vm.endingFormat = closeTime ? moment(closeTime, 'HH:mm:ss').format('a') : null;
            };

            vm.setTime = function (oHour, oMinute, oFormat, cHour, cMinute, cFormat) {
                if (oHour && oMinute && oFormat && cHour && cMinute && cFormat) {
                    $scope.timeModel['open'] = moment(`${oHour}:${oMinute} ${oFormat}`, 'hh:mm a').format('HH:mm:ss');
                    $scope.timeModel['close'] = moment(`${cHour}:${cMinute} ${cFormat}`, 'hh:mm a').format('HH:mm:ss');
                } else {
                    $scope.timeModel['open'] = null;
                    $scope.timeModel['close'] = null;
                }
            };

            vm.enableAll = function (arr) {
                for (i = 1; i < arr; i++) {
                    arr[i].disabled = false;
                }
                return arr;
            };

            /**
             * Whenever hours changed, need to validate the time (start time < end time)
             * Also, make the items in dropdown disabled if not applicable
             */
            vm.updateHour = function () {
                if (vm.startingHour !== vm.endingHour) {
                    for (i = 1; i < vm.timeMinutesRange.length; i++) {
                        vm.startingTimeMinutesRange[i].disabled = false;
                        vm.endingTimeMinutesRange[i].disabled = false;
                    }

                } else if (vm.startingHour === vm.endingHour) {
                    vm.updateStartingMinuteTime();
                    vm.updateEndingMinuteTime();
                }
            };

            /**
             * Whenever starting minutes changed, need to validate the time (start time < end time)
             * Also, make the items in dropdown disabled if not applicable
             */
            vm.updateStartingMinuteTime = function () {
                for (var i = 1; i < vm.timeMinutesRange.length; i++) {
                    vm.startingTimeMinutesRange[i].disabled =
                        !!(i * 15 > parseInt(vm.endingMinute, 10) && i * 15 < vm.timeMinutesRange.length);
                }
            };

            /**
             * Whenever ending minutes changed, need to validate the time (start time < end time)
             * Also, make the items in dropdown disabled if not applicable
             */
            vm.updateEndingMinuteTime = function () {
                for (var i = 1; i < vm.timeMinutesRange.length; i++) {
                    vm.endingTimeMinutesRange[i].disabled = !!(i * 15 < (parseInt(vm.startingMinute, 10)));
                }
            };

            $scope.$watch('ctrl.startingHour', function (newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }
                vm.setTime(vm.startingHour, vm.startingMinute, vm.startingFormat,
                           vm.endingHour, vm.endingMinute, vm.endingFormat);
            });

            $scope.$watch('ctrl.endingHour', function (newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }
                vm.setTime(vm.startingHour, vm.startingMinute, vm.startingFormat,
                           vm.endingHour, vm.endingMinute, vm.endingFormat);
            });

            $scope.$watch('ctrl.startingMinute', function (newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }
                vm.setTime(vm.startingHour, vm.startingMinute, vm.startingFormat,
                           vm.endingHour, vm.endingMinute, vm.endingFormat);
            });

            $scope.$watch('ctrl.endingMinute', function (newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }
                vm.setTime(vm.startingHour, vm.startingMinute, vm.startingFormat,
                           vm.endingHour, vm.endingMinute, vm.endingFormat);
            });

            $scope.$watch('ctrl.startingFormat', function (newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }
                vm.setTime(vm.startingHour, vm.startingMinute, vm.startingFormat,
                           vm.endingHour, vm.endingMinute, vm.endingFormat);
            });

            $scope.$watch('ctrl.endingFormat', function (newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }
                vm.setTime(vm.startingHour, vm.startingMinute, vm.startingFormat,
                           vm.endingHour, vm.endingMinute, vm.endingFormat);
            });

            vm.setInitialTime();
        },
        controllerAs: 'ctrl'
    };
});
