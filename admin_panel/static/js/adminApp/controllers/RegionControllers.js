angular.module('adminApp')
    .controller('RegionListController', function (tableUtils) {
        var vm = this;

        vm.dtOptions = tableUtils.defaultsWithServiceName('GeoRegionService');

        vm.dtColumns = [
            tableUtils.newColumn('id').withTitle('ID'),
            tableUtils.newLinkColumn('name', 'Name'),
            tableUtils.newLinkColumn('slug', 'Slug'),
            tableUtils.newLinkColumn('parent__name', 'Parent').withOption('sortBy', 'parent'),
            tableUtils.newColumn('level').withTitle('Level'),
            tableUtils.newColumn('hidden').withTitle('Hidden'),
            tableUtils.newActionColumn()
        ];

        vm.createLink = '^.create';
    })
    .controller('RegionViewController', function (region, languages, $rootScope, $state, allRegions, GeoRegionService, leafletData) {
        var vm = this;
        vm.object = region;
        vm.allRegions = allRegions;
        vm.selectedLanguageTab = $rootScope.languages ? $rootScope.languages[0][0] : 'en';
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
                name: 'Country'
            },
            {
                id: 2,
                name: 'Region'
            },
            {
                id: 3,
                name: 'Camp / City'
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