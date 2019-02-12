angular.module('adminApp')
    .controller('RegionListController', function (tableUtils, $filter) {
        var vm = this;

        vm.dtOptions = tableUtils.defaultsWithServiceNameAndFilterAndSearch('GeoRegionService');

        vm.dtColumns = [
            tableUtils.newColumn('id').withTitle('ID'),
            tableUtils.newLinkColumn('name', $filter('translate')('REGION_NAME')),
            tableUtils.newLinkColumn('slug', $filter('translate')('REGION_SLUG')),
            tableUtils.newLinkColumn('parent__name', $filter('translate')('REGION_PARENT')).withOption('sortBy', 'parent'),
            tableUtils.newColumn('level').withTitle($filter('translate')('REGION_LEVEL')),
            tableUtils.newColumn('hidden').withTitle($filter('translate')('REGION_IS_HIDDEN')),
            tableUtils.newActionColumn()
        ];

        vm.createLink = '^.create';
    })
    .controller('RegionViewController', function (region, languages, $rootScope, $state, allRegions, sites, GeoRegionService, $filter, leafletData, serviceTypes) {
        var vm = this;
        vm.object = region;
        vm.object.types_ordering = serviceTypes;
        vm.allRegions = allRegions;
        vm.selectedLanguageTab = $rootScope.languages ? $rootScope.languages[0][0] : 'en';
        vm.sites = _.sortBy(sites, r => r.name);

        var regionMap = _.fromPairs(allRegions.map(r => [r.id, r]));
        vm.allRegions = vm.allRegions.map(a => {
            a.parent = regionMap[a.parent];
            return a;
        });

        vm.geojson = {
            data: vm.object.geom,
            style: {
                fillColor: 'green',
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            }
        };
        vm.languages = languages.map(l => ({
            id: l[0],
            name: l[1],
        }));
        vm.levels = [{
                id: 1,
                name: $filter('translate')('REGION_LVL1')
            },
            {
                id: 2,
                name: $filter('translate')('REGION_LVL2')
            },
            {
                id: 3,
                name: $filter('translate')('REGION_LVL3')
            }
        ];
        vm.editOptions = {};
        vm.isNew = !region.hasOwnProperty('id');
        vm.object.languages = (vm.object.languages_available || '').split(', ').filter(a => a);



        if (vm.isNew) {
            startEditing();
        }

        var editableLayers = L.featureGroup();
        var options = {
            position: 'topright',
            draw: {
                polyline: false,
                marker: false,
                circle: false
            },
            edit: {
                featureGroup: editableLayers, //REQUIRED!!
                remove: true
            }
        };

        var drawControl = new L.Control.Draw(options);

        leafletData.getMap('map-simple-map').then(function (map) {
            map.addLayer(editableLayers);
            map.scrollWheelZoom.disable();

            if (vm.object.hasOwnProperty('geom')) {
                var bounds = L.geoJSON(vm.object.envelope).getBounds();

                map.fitBounds(bounds);
                vm.object.geom.coordinates.forEach(function (c) {
                    L.geoJSON({
                        type: 'Polygon',
                        coordinates: c
                    }, {
                        onEachFeature: function (feature, layer) {
                            editableLayers.addLayer(layer);
                        }
                    });
                });
            } else {
                map.fitBounds([
                    [50, -10],
                    [-50, 10]
                ]);
            }


            map.on('draw:created', function (e) {
                var layer = e.layer;
                editableLayers.addLayer(layer);


                var featureJSON = editableLayers.toGeoJSON();
                vm.object.geom = {
                    coordinates: featureJSON.features.map(function (f) {
                        return f.geometry.coordinates;
                    }),
                    type: 'MultiPolygon'
                };
            });

            map.on('draw:deleted', function () {

                var featureJSON = editableLayers.toGeoJSON();
                vm.object.geom = {
                    coordinates: featureJSON.features.map(function (f) {
                        return f.geometry.coordinates;
                    }),
                    type: 'MultiPolygon'
                };
            });

            map.on('draw:editstop', function () {

                var featureJSON = editableLayers.toGeoJSON();
                vm.object.geom = {
                    coordinates: featureJSON.features.map(function (f) {
                        return f.geometry.coordinates;
                    }),
                    type: 'MultiPolygon'
                };
            });

        });

        vm.save = save;
        vm.startEditing = startEditing;
        vm.stopEditing = stopEditing;
        vm.remove = remove;
        vm.cancelEditing = cancelEditing;

        function save() {
            //vm.object.geom.coordinates.forEach((c)=> c[0].splice(-1,1));
            vm.object.languages_available = vm.object.languages.map(l => l).join(', ');
            if (vm.isNew) {
                GeoRegionService.post(vm.object).then(function (o) {
                    $state.go('region.open', {
                        id: o.id
                    });
                });
            } else {
                vm.object.save();
            }
            vm.stopEditing();
            sessionStorage.removeItem('allRegions');
        }


        function remove() {
            if (confirm('Are you sure?')) {

                if (vm.isNew) {
                    $state.go('region.list');
                } else {
                    vm.object.remove().then(function () {
                        $state.go('region.list');
                    });
                }
                vm.stopEditing();
            }
        }

        function cancelEditing() {
            vm.stopEditing();
            $state.reload();
        }

        function startEditing() {
            vm.isEditing = true;
            leafletData.getMap('map-simple-map').then(function (map) {
                map.addControl(drawControl);
                map.scrollWheelZoom.enable();

            });
        }

        function stopEditing() {
            vm.isEditing = false;
            leafletData.getMap('map-simple-map').then(function (map) {
                map.removeControl(drawControl);
                map.scrollWheelZoom.disable();

            });
        }
    });