angular.module('adminApp').directive('servicesMap', function(leafletData, $state, $filter) {

    return {
        restrict: 'E',
        scope:  {
            services: '=',
            isMobile: '='
        },
        link: {
            pre: function(scope) {
                angular.extend(scope, {
                    center: {
                        lat: 22.05,
                        lng: 31.25,
                        zoom: 3
                    },
                    layers: {
                        baselayers: {
                            googleRoadmap: {
                                name: 'Google Streets',
                                layerType: 'ROADMAP',
                                type: 'google'
                            }
                        }
                    }
                });
            },
            post: function(scope) {
                var ctrl = scope.$parent.ctrl;
                var infoDiv = L.control();

                infoDiv.onAdd = function () {
                    this._div = L.DomUtil.create('div', 'hidden');
                    return this._div;
                };

                infoDiv.update = function (service) {
                    if (!service) {
                        this._div.innerHTML = ('<b>' + $filter('translate')('NO_SERVICES_INFO', { siteName: scope.$root.translatedSiteName }) + '</b>');
                    } else {
                        this._div.innerHTML = '<b>' + service.name + '</b><br/>' + $filter('limitTo')(service.description, 250);
                    }
                    this._div.className = 'service-info-control';
                };

                function showInfo(e) {
                    infoDiv.update(e ? e.target.options.service : null);
                };

                function hideDiv() {
                    infoDiv._div.className = 'hidden';
                };

                var refreshMap = function() {
                    leafletData.getMap().then(function (map) {
                        drawServices(map, scope.services, scope.isMobile);
                        infoDiv.addTo(map);
                    });
                };

                var displayServiceInfo = function(e) {
                    scope.regionSlug = ctrl.slug;
                    scope.serviceInfo = e ? e.target.options.service : null;
                    scope.showServiceInfo = true;
                    scope.serviceInfo.icon = ctrl.getServiceIcon(scope.serviceInfo.type);
                    scope.serviceInfo.description = $filter('limitTo')(scope.serviceInfo.description, 200);
                    refreshMap();
                };

                leafletData.getMap().then(function (map) {
                    map.on({
                        click: function() {
                            scope.showServiceInfo = false;
                        }
                    });
                    infoDiv.addTo(map);
                });

                var markers = new L.FeatureGroup();
                var markerClick = function onClick(e) {
                    $state.go('service.open',{serviceId: e.target.options.service.id});
                };
                var drawServices = function(map, services, isMobile) {
                    markers.clearLayers();
                    services.forEach(function(service) {
                        if (service.location) {
                            var lat = service.location.coordinates[1];
                            var lng = service.location.coordinates[0];
                            var serviceIcon = L.VectorMarkers.icon({
                                icon: 'fa-pointer',
                                prefix: 'fa',
                                markerColor: ctrl.getServiceColor(service)
                            });
                            var marker = L.marker([lat, lng], {
                                service: service,
                                icon: serviceIcon
                            });
                            marker.on({
                                mouseover: showInfo,
                                mouseout: hideDiv,
                                click: function (e) {
                                    if (isMobile) {
                                        displayServiceInfo(e);
                                    } else {
                                        markerClick(e);
                                    }
                                }
                            });
                            markers.addLayer(marker);
                        }
                    });

                    if (services.length > 0) {
                        map.addLayer(markers);
                        map.fitBounds(markers.getBounds(), {padding: [25, 25]});
                    }
                };

                scope.$watch('services', function () {
                    refreshMap();
                }, true);

            }
        },
        templateUrl: 'views/service/services-map.html'
    };
});
