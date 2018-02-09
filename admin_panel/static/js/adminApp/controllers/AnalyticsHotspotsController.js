angular.module('adminApp')
    .controller('AnalyticsHotspotsController', function ($scope, moment, Restangular, merakiStats, merakiApps, merakiNetworks, datepickerRanges, datePickerBoundries, leafletData, usSpinnerService) {

        var vm = this;
        vm.destination = merakiStats[0];
        vm.networks = merakiNetworks;
        vm.networks.selected = merakiNetworks[1];
        vm.dateLabels = [];
        vm.colors = ['#45b7cd', '#ff6384', '#ff8e72'];
        vm.usages = merakiApps[0];
        vm.activeTab = 'map';
        vm.devicesBounds = [];

        vm.getChartData = function (objsList, meanList) {
            let values = [];
            vm.dateLabels = [];
            for (var index in objsList){
                if (objsList[index].hasOwnProperty('clients')) {
                    values.push(objsList[index].clients);
                } else {
                    values.push(objsList[index].usage);
                }
                vm.dateLabels.push(objsList[index].date);
            }
            return [values, meanList];
        };

        vm.data = vm.getChartData(merakiStats[2], merakiStats[3]);
        vm.dataUsage = vm.getChartData(merakiApps[1], merakiApps[2]);

        vm.datasetOverride = [
            {
                label: 'Clients',
                borderWidth: 1,
                type: 'bar'
            },
            {
                label: 'Average',
                borderWidth: 2,
                type: 'line'
            }
        ];

        vm.usageDatasetOverride = [
            {
                label: 'Usage',
                borderWidth: 1,
                type: 'bar'
            },
            {
                label: 'Average',
                borderWidth: 2,
                type: 'line'
            }
        ];

        vm.options = {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    boxWidth: 20
                }
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        };

        vm.getData = (startDate, endDate, network_id) => {
            usSpinnerService.spin('spinner-devices');
            Restangular.all('meraki-networks/')
                .customGET('', {network_id: network_id, including_info: true})
                .then(function (obj) {
                    vm.networks.selected = obj[0];
                    vm.markersDevices = vm.getMarkersDevices(vm.networks.selected);
                    vm.devices_info = vm.extractDevicesInfo(obj[0]);
                    usSpinnerService.stop('spinner-devices');
                });
            Restangular.all('meraki-apps/')
                .customGET('', {network_id: network_id, date: startDate, end_date: endDate})
                .then(function (objs) {
                    vm.usages= objs[0];
                    vm.dataUsage = vm.getChartData(objs[1], objs[2]);
                });
            return Restangular.all('meraki-stats/')
                .customGET('', {network_id: network_id, date: startDate, end_date: endDate})
                .then(function (objs) {
                    vm.datePicker = {startDate: startDate, endDate: endDate};
                    vm.destination = objs.plain()[0];
                    vm.data = vm.getChartData(objs.plain()[2], objs.plain()[3]);
                });
        };

        vm.datePicker = datepickerRanges;
        vm.datePickerBoundries = datePickerBoundries;
        vm.datePicker.options = {
            ranges: {
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()]
            },
            eventHandlers: {
                'apply.daterangepicker': function (ev, picker) {
                    if (typeof ev.model.endDate != 'string' && typeof ev.model.startDate != 'string') {
                        let endDate = ev.model.endDate.format('YYYY-MM-DD');
                        let startDate = ev.model.startDate.format('YYYY-MM-DD');
                        vm.getData(startDate, endDate, vm.networks.selected.network_id);
                    }
                }
            },
            opens: 'center'
        };

        vm.getMarkers = (networks) => {
            let markers = {};
            let networksBounds = [];
            for (let i in networks) {
                if (!networks[i]) {
                    continue;
                }
                let markerName = i;
                if (networks[i].name) {
                    markerName = networks[i].name.split('-').join('');
                }

                let location = networks[i].devices.filter((device) => {return device.model.slice(0, 2) == 'MX'});
                if (location.length) {
                    markers[markerName] = {
                        lat: parseFloat(location[0].latitude),
                        lng: parseFloat(location[0].longitude),
                        message: networks[i].name,
                        icon: {
                            iconUrl: 'public/static/leaflet/dist/images/marker-icon.png'
                        }
                    };
                    networksBounds.push([parseFloat(location[0].latitude), parseFloat(location[0].longitude)]);
                }
                if (networksBounds.length) {
                    leafletData.getMap('networksMap').then((map) => {
                        map.fitBounds(networksBounds);
                    });
                }
            }
            return markers;
        };
        vm.markers = vm.getMarkers(merakiNetworks);

        vm.getMarkersDevices = (network) => {
            if (!network) {
                return;
            }
            let markers = {};
            vm.devicesBounds = [];
            for (let i in network.devices) {
                let markerName = i;
                if (network.devices[i].name) {
                    markerName = network.devices[i].name.split('-').join('');
                }

                if (network.devices[i].latitude && network.devices[i].longitude) {
                    markers[markerName] = {
                        lat: parseFloat(network.devices[i].latitude),
                        lng: parseFloat(network.devices[i].longitude),
                        message: network.devices[i].name,
                        icon: {
                            iconUrl: 'public/static/leaflet/dist/images/marker-icon.png'
                        }
                    };
                    vm.devicesBounds.push([
                        parseFloat(network.devices[i].latitude), parseFloat(network.devices[i].longitude)
                    ]);
                }
            }
            if (vm.devicesBounds.length) {
                leafletData.getMap('devicesMap').then((map) => {
                    map.fitBounds(vm.devicesBounds);
                });
            }
            return markers;
        };
        vm.markersDevices = vm.getMarkersDevices(vm.networks.selected);

        vm.extractDevicesInfo = (network) => {
            let devices = [];
            for (let device of network['devices']) {
                for (let deviceInterface of device['device_info']) {
                    if (deviceInterface) {
                        deviceInterface['name'] = device.name;
                        deviceInterface['model'] = device.model;
                        devices.push(deviceInterface);
                    }
                }
            }
            return devices;
        };

        angular.extend($scope, {
            defaults: {
                scrollWheelZoom: false
            },
            layers: {
                baselayers: {
                    googleRoadmap: {
                        name: 'Google Streets',
                        layerType: 'ROADMAP',
                        type: 'google'
                    }
                }
            },
            events: {
                map: {
                    enable: ['drag'],
                    logic: 'emit'
                }
            },
            touched: false,
            defaultsDevices: {
                scrollWheelZoom: false
            },
            layersDevices: {
                baselayers: {
                    googleRoadmap: {
                        name: 'Google Streets',
                        layerType: 'ROADMAP',
                        type: 'google'
                    }
                }
            },
            eventsDevices: {
                map: {
                    enable: ['drag'],
                    logic: 'emit'
                }
            },
            touchedDevices: false
        });

        vm.activateMapTab = () => {
            vm.activeTab = 'map';
            setTimeout(() => {
                leafletData.getMap('devicesMap').then((map) => {
                    map.invalidateSize();
                    if (vm.devicesBounds.length) {
                        map.fitBounds(vm.devicesBounds);
                    }
                });
            }, 200);
        };

        vm.activateMapTab();

        $scope.$on('leafletDirectiveMarker.networksMap.click', function(e, args) {
            let markerName = args.leafletEvent.target.options.message;
            let networkId = vm.networks.filter((network) => {return network.name == markerName})[0].network_id;
            vm.getData(vm.datePicker.startDate, vm.datePicker.endDate, networkId);
        });
    });