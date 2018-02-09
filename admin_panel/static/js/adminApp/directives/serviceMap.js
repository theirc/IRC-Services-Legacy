angular.module('adminApp').directive('serviceMap', function (leafletData) {
    return {
        restrict: 'E',
        scope: {
            service: '=',
            defaultRegion: '=',
            isEditable: '=',
            isCreate: '=',
            control: '='
        },
        link: {
            pre: function (scope) {
                angular.extend(scope, {
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
                    touched: false
                });
            },
            post: function (scope) {
                let refreshMap = function () {
                    let service = scope.service;
                    let defaultRegion = scope.defaultRegion;
                    let lat;
                    let lng;
                    if (!scope.isCreate && scope.service || scope.markers) {
                        lat = service.location ? service.location.coordinates[1] : (defaultRegion ? defaultRegion.centroid.coordinates[1] : 37.98);
                        lng = service.location ? service.location.coordinates[0] : (defaultRegion ? defaultRegion.centroid.coordinates[0] : 23.73);
                    }
                    else {
                        lat = (defaultRegion ? defaultRegion.centroid.coordinates[1] : 37.98);
                        lng = (defaultRegion ? defaultRegion.centroid.coordinates[0] : 23.73);
                    }
                    scope.service.location = {
                        'type': 'Point',
                        'coordinates':[
                            lng,
                            lat
                        ]
                    };
                    if (!scope.touched) {
                        angular.extend(scope, {
                            markers: {
                                service: {
                                    lat: lat,
                                    lng: lng,
                                    draggable: scope.isEditable
                                }
                            }
                        });
                        leafletData.getMap().then(function(map) {
                            let zoom = scope.isCreate ? 10 : 16;
                            map._onResize();
                            map.setView([lat, lng], zoom);
                        });
                    }
                };

                leafletData.getMap().then(function(map) {
                    map.on('click', function(e) {
                        if (scope.isEditable) {
                            let clickLocation = e.latlng;
                            scope.markers.service.lat = clickLocation.lat;
                            scope.markers.service.lng = clickLocation.lng;
                            scope.service.location.coordinates[1] = clickLocation.lat;
                            scope.service.location.coordinates[0] = clickLocation.lng;
                            scope.touched = true;
                            scope.$apply();
                        }
                    });
                });
                refreshMap();

                scope.internalControl = scope.control || {};
                scope.internalControl.refreshMapExternal = function(lat, lng) {
                    scope.markers.service.lat = lat ? lat : scope.markers.service.lat;
                    scope.markers.service.lng = lng ? lng : scope.markers.service.lng;
                    scope.touched = true;
                    leafletData.getMap().then(function(map) {
                        let zoom = scope.isCreate ? 10 : 16;
                        map._onResize();
                        map.setView([scope.markers.service.lat, scope.markers.service.lng], zoom);
                    });
                }
            }
        },
        template: '<leaflet markers="markers" layers="layers" event-broadcast="events" class="service-details-map"></leaflet>'
    };
});
