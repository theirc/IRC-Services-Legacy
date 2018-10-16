angular
    .module('adminApp')
    .controller('ServiceOverviewController', function (tableUtils, $scope, provider, services, serviceTypes, regions, $filter, $window, ServiceService, selectedLanguage) {
        let vm = this;
        vm.provider = provider;
        vm.services = services;
        vm.serviceTypes = serviceTypes;
        vm.currentServiceColor = '#4cae4e';
        vm.draftServiceColor = '#fcd735';
        vm.isMapView = false;

        vm.getServiceIcon = function (url) {
            let serviceType = vm.serviceTypes[url];
            if (!serviceType) {
                return;
            } else {
                return serviceType.vector_icon;
            }
        };

        vm.getServiceColor = function (service) {
            return service.status == 'current' ?
                vm.currentServiceColor :
                vm.draftServiceColor;
        };

        vm.listView = function () {
            vm.isMapView = false;
        };

        vm.mapView = function () {
            vm.isMapView = true;
        };

        vm.isMobile = function () {
            return $window.innerWidth <= 991;
        };

        vm.dtOptions = tableUtils.defaultsWithServiceNameAndFilter('ServiceService', {
            provider: provider.id
        });
        vm.dtColumns = [
            tableUtils
            .newColumn('id')
            .withTitle('ID'),
            tableUtils.newColumn(`name_${selectedLanguage}`).withTitle(`Name (${selectedLanguage})`),
            tableUtils
            .newColumn('types')
            .withTitle($filter('translate')('TABLE_TYPES'))
            .renderWith(function (types) {
                return types.map((type) => type.name).join(', ');
            }),
            tableUtils
            .newColumn('updated_at')
            .withTitle($filter('translate')('TABLE_UPDATE_AT'))
            .renderWith(function (data) {
                return $filter('date')(data, 'medium');
            }),
            tableUtils
            .newColumn('region')
            .withTitle($filter('translate')('TABLE_REGION'))
            .renderWith(function (data) {
                let region = regions.filter(function (t) {
                    return t.id == data.id;
                });

                if (!region.length)
                    return '';
                return region[0].name;
            }),
            tableUtils
            .newColumn('status').renderWith(data => {
                var dict = {
                    'draft': $filter('translate')('SERVICE_DRAFT'),
                    'private': $filter('translate')('SERVICE_PRIVATE'),
                    'current': $filter('translate')('SERVICE_CURRENT'),
                    'rejected': $filter('translate')('SERVICE_REJECTED'),
                    'canceled': $filter('translate')('SERVICE_CANCELED'),
                    'archived': $filter('translate')('SERVICE_ARCHIVED')
                };
                return dict[data];
            })
            .withTitle($filter('translate')('TABLE_STATUS'))
        ];

        vm.dtInstance = {};
        vm.createLink = '^.create';

        angular.extend($scope, vm);
    })
    .controller('ServiceListController', function (tableUtils, $scope, provider, serviceTypes, regions, $filter, service_languages, ServiceService, selectedLanguage) {
        let vm = this;
        vm.provider = provider;
        let langs = service_languages;
        if (provider) {
            vm.dtOptions = tableUtils.defaultsWithServiceNameAndFilterAndSearch('ServiceManagementService', {
                provider: provider.id
            });
        } else {
            vm.dtOptions = tableUtils.defaultsWithService('ServiceService');
        }
        vm.dtColumns = [
            tableUtils
            .newColumn('id')
            .withTitle('ID'),
            tableUtils.newColumn(`name_${selectedLanguage}`).withTitle($filter('translate')('NAME', `${selectedLanguage}`)),
            tableUtils
            .newColumn('types')
            .withTitle($filter('translate')('TABLE_TYPES'))
            .renderWith(function (types) {
                return types.map((type) => type.name).join(', ');
            }),
            tableUtils
            .newColumn('updated_at')
            .withTitle($filter('translate')('TABLE_UPDATE_AT'))
            .renderWith(function (data) {
                return $filter('date')(data, 'medium');
            }),
            tableUtils
            .newColumn('region')
            .withTitle($filter('translate')('TABLE_REGION'))
            .renderWith(function (data) {
                let region = regions.filter(function (t) {
                    return t.id == data;
                });

                if (!region.length)
                    return '';
                return region[0].name;
            }),
            tableUtils
            .newColumn('status').renderWith(data => {
                var dict = {
                    'draft': $filter('translate')('SERVICE_DRAFT'),
                    'private': $filter('translate')('SERVICE_PRIVATE'),
                    'current': $filter('translate')('SERVICE_CURRENT'),
                    'rejected': $filter('translate')('SERVICE_REJECTED'),
                    'canceled': $filter('translate')('SERVICE_CANCELED'),
                    'archived': $filter('translate')('SERVICE_ARCHIVED')
                };
                return dict[data];
            })
            .withTitle($filter('translate')('TABLE_STATUS')),

        ];

        if ($scope.user.isSuperuser) {
            vm.dtColumns.push(
                tableUtils
                .newColumn('transifex_status')
                .withTitle('Transifex Status')
                .renderWith(function (data) {
                    if (data.hasOwnProperty('errors')) {
                        return data.errors;
                    } else {
                        let transifexStatus = '';
                        langs.forEach(function (lang) {
                            if (lang[0] != 'en') {
                                transifexStatus += `${lang[1]}: ${data[lang[0]] || 'N/A'}<br />`;
                            }
                        });
                        return transifexStatus;
                    }
                }));
        }

        vm.dtColumns.push(tableUtils
            .newServiceActionColumn()
            .withOption('width', '200px'));

        vm.dtInstance = {};
        vm.createLink = '^.create';

        angular.extend($scope, vm);
    })
    .controller('ServiceDuplicateController', function (ServiceService, $state, serviceId, $uibModalInstance) {
        let vm = this;
        vm.serviceId = serviceId;
        vm.newName = '';

        vm.confirm = function () {
            $uibModalInstance.close({
                serviceId: vm.serviceId,
                newName: vm.newName
            });
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

    })
    .controller('ServiceArchiveController', function (ServiceService, $state, serviceId, $uibModalInstance) {
        let vm = this;
        vm.serviceId = serviceId;

        vm.confirm = function () {
            $uibModalInstance.close(vm.serviceId);
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

    })
    .controller('ServiceOpenController', function ($rootScope, Restangular, $state, Upload, provider, providers, serviceTypes, regions, $filter,
        service, tags, ServiceService, leafletData, $window, service_languages, toasty, $scope, webClientUrl, confirmationLogs,
        DTOptionsBuilder, DTColumnDefBuilder, staticUrl) {
        let vm = this;
        if (Object.keys(service).length !== 0) {
            if (Object.keys(provider).length !== 0 && service.provider.id == provider.id) {
                vm.provider = provider;
            } else {
                //  $rootScope.selectedProvider = service.provider;
                vm.provider = service.provider;
            }
        } else {
            vm.provider = provider;
        }

        vm.providerRegion = regions.filter(function (r) {
            return r.id === provider.region;
        });

        vm.providerRegion = vm.providerRegion && vm.providerRegion[0]
        vm.serviceTypes = serviceTypes;        

        vm.regions = regions;        
        vm.providers = Array.isArray(provider) ? provider : [provider];
        //vm.providers = providers;
        vm.service = service;        
        vm.service.type = vm.service.type ? serviceTypes.filter( (t) =>  t.id == vm.service.type.id )[0] : null;

        vm.updatedServiceTypes = vm.service.type ? vm.serviceTypes.filter((type) => type != vm.service.type) :vm.serviceTypes;

        vm.showNewsletter = ($rootScope.user.site.domain || '').indexOf('refugee.info') > -1;


        vm.regionslvl1 = $rootScope.user.isSuperuser ? regions : [vm.providerRegion];
        vm.regionslvl2 = [];
        vm.regionslvl3 = [];

        vm.regionlvl1 = null;
        vm.regionlvl2 = null;
        vm.regionlvl3 = null;

        /*vm.updateCity = () => {
            service_languages.forEach(function (lang) {
                vm.service[`address_city_${lang[0]}`] = vm.regionlvl3.name;
            });
        }*/

        vm.onRegionChange = () => {
            vm.regionslvl3 = [];
            if (vm.regionlvl1) {
                let parent = vm.regions.filter((region) => region.id == vm.regionlvl1.id)[0];
                vm.regionslvl2 = vm.regions.filter((region) => region.parent == parent.id);
            } else {
                vm.regionslvl2 = [];
            }
        }

        vm.onRegionChangelvl2 = () => {
            vm.regionslvl3 = vm.regions.filter((region) => region.parent == vm.regionlvl2);
            vm.regionlvl3 = '';
            if (vm.regionlvl2) {
                let parent = vm.regions.filter((region) => region.id == vm.regionlvl2.id)[0];
                vm.regionslvl3 = vm.regions.filter((region) => region.parent == parent.id);    
            } else {
                vm.regionslvl3 = [];
            }
        }

        vm.filterTypes = () => {
            vm.updatedServiceTypes = vm.serviceTypes.filter((type) => type != vm.service.type);
        }

        if (Object.keys(confirmationLogs).length !== 0) {
            vm.serviceConfirmationLogs = confirmationLogs.confirmation_logs;
            vm.lastStatus = '';
            if (_.last(_.sortBy(vm.serviceConfirmationLogs, 'id', ))) {
                vm.lastStatus = _
                    .last(_.sortBy(vm.serviceConfirmationLogs, 'id', ))
                    .status;
            }
            vm.serviceConfirmation = (vm.lastStatus == 'Confirmed');
            vm.dtOptions = DTOptionsBuilder
                .newOptions()
                .withOption('order', [
                    [
                        1, 'desc'
                    ],
                    [0, 'desc']
                ]);
            vm.dtColumnDefs = [
                DTColumnDefBuilder
                .newColumnDef(1)
                .withOption('type', 'date')
                .renderWith(data => {
                    return $filter('date')(data, 'medium');
                })
            ];
        } else {
            vm.service.confirmedByAdmin = false;
            vm.serviceConfirmation = false;
        }
        vm.tags = tags.plain();
        if (!vm.service.hasOwnProperty('selection_criteria')) {
            vm.service.selection_criteria = [];
        }
        vm.selectedLanguageTab = $scope.languages ? $scope.languages[0][0] : 'en';
        let langs = service_languages;
        vm.isNew = !vm
            .service
            .hasOwnProperty('id');
        vm.isEditing = vm.isNew;
        vm.transifexStatus = "---";
        vm.statusChoices = {
            'draft': $filter('translate')('SERVICE_DRAFT'),
            'private': $filter('translate')('SERVICE_PRIVATE'),
            'current': $filter('translate')('SERVICE_CURRENT'),
            'rejected': $filter('translate')('SERVICE_REJECTED'),
            'canceled': $filter('translate')('SERVICE_CANCELED'),
            'archived': $filter('translate')('SERVICE_ARCHIVED')
        };
        vm.contactTypeChoices = {
            'email': 'Email',
            'phone': 'Phone',
            'viber': 'Viber',
            'whatsapp': 'Whatsapp',
            'skype': 'Skype',
            'facebook_messenger': 'Facebook Messenger'
        };
        vm.days = [
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday'
        ];
        vm.translatedDays = _.fromPairs(_.zip(vm.days, moment.weekdays().map(s => (s.charAt(0).toUpperCase() + s.slice(1)))));


        if (vm.isNew || !vm.service.opening_time) {
            vm.service.provider = vm.provider.id;
            vm.service.region = vm.providerRegion ?
                vm.providerRegion.id :
                null;
            vm.service.tags = [];
            vm.service.types = [];
            vm.service.opening_time = {
                '24/7': false
            }
            for (let day in vm.days) {
                vm.service.opening_time[vm.days[day]] = [{
                    'open': null,
                    'close': null
                }];
            }

        } else {
            let selectedRegion = vm.regions.find(r => r.id === vm.service.region.id);
            let regionChain = [selectedRegion.id];
            while (selectedRegion.parent) {
                regionChain.push(selectedRegion.parent);
                selectedRegion = vm.regions.find(r => r.id === selectedRegion.parent);
            }

            regionChain = regionChain.reverse().concat([null, null, null]).slice(0, 3).map(r => r ? vm.regions.find(ar => r === ar.id) : null);

            if (regionChain[0]) {

                vm.regionlvl1 = regionChain[0];
                vm.onRegionChange();

                if (regionChain[1]) {
                    vm.regionlvl2 = regionChain[1];
                    vm.onRegionChangelvl2();

                    if (regionChain[2]) {
                        vm.regionlvl3 = regionChain[2];
                    }
                }
            }

        }
        $scope.mapControl = {};
        vm.provideLocation = vm.service.location ?
            true :
            false;

        leafletData
            .getMap('service-details-map')
            .then(function (map) {
                map
                    .scrollWheelZoom
                    .disable();
            });


        vm.goBack = function () {
            history.go(-1);
        };

        vm.canEdit = (
            $rootScope.user.isSuperuser ||
            ($rootScope.user.groups.filter(g => g.name === 'Providers').length > 0 && ($rootScope.selectedProvider.id === vm.service.provider.id || vm.isNew))
        )
        if (vm.canEdit) {
            /*
Only superusers and service providers have access to the edit functions. Everyone else should see the read only version only.
            */

            vm.startEditing = function () {
                vm.isEditing = true;

                leafletData
                    .getMap('service-details-map')
                    .then(function (map) {
                        map
                            .scrollWheelZoom
                            .enable();
                    });
            };

            vm.stopEditing = function () {
                vm.isEditing = false;

                leafletData
                    .getMap('service-details-map')
                    .then(function (map) {
                        map
                            .scrollWheelZoom
                            .disable();
                    });
            };

            vm.cancelEditing = function () {
                vm.stopEditing();
                $state.reload();
            };

            vm.removeImage = function () {
                let image = {
                    'image': null
                };
                return vm
                    .service
                    .customPATCH(image)
                    .then(function (resp) {
                        $state.reload();
                    });
            };

            vm.save = function (file) {
                vm.generateSlug();
                vm.service.region = vm.regionlvl3 || vm.regionlvl2 || vm.regionlvl1;
                //vm.service.type = 0;
                if (!vm.provideLocation) {
                    vm.service.location = null;
                }

                if (vm.isNew) {
                    vm.service.region = vm.service.region.id;

                    ServiceService
                        .post(vm.service)
                        .then(function (s) {
                            if (file) {
                                Upload.upload({
                                        url: 'v2/services/' + s.id + '/',
                                        data: {
                                            image: file
                                        },
                                        method: 'PATCH'
                                    })
                                    .then(function () {
                                        vm.errors = false;
                                        $state.go('^.open', {
                                            serviceId: s.id
                                        });
                                    })
                                    .catch(function (e) {
                                        vm.errors = true;
                                    });
                            } else {
                                vm.errors = false;
                                $state.go('^.open', {
                                    serviceId: s.id
                                });
                            }
                        })
                        .catch(function (e) {
                            vm.errors = true;
                        });
                } else {
                    vm
                        .service
                        .save()
                        .then(function () {
                            if (file) {
                                Upload.upload({
                                        url: 'v2/services/' + vm.service.id + '/',
                                        data: {
                                            image: file
                                        },
                                        method: 'PATCH'
                                    })
                                    .then(function () {
                                        vm.isEditing = false;
                                        $state.reload();
                                    })
                                    .catch(function (e) {
                                        vm.errors = true;
                                    });
                            } else {
                                vm.isEditing = false;
                                $state.reload();
                            }
                        });
                }
            };

            vm.remove = function () {
                if (confirm('Are you sure?')) {
                    vm
                        .service
                        .remove()
                        .then(function () {
                            $state.go('service.list');
                        });
                }
            };

            vm.pushToTransifex = function () {
                ServiceService
                    .pushServiceToTransifex(vm.service.id)
                    .then(function (s) {
                        $state.reload();
                        let message;
                        if (s.status == 'New') {
                            message = `Service has been created in transifex!
                        <br/>Strings added: ${s.strings_added}`;
                        } else {
                            message = `Service has been pushed to transifex!
                        <br/>Strings added: ${s.strings_added}
                        <br/>Strings updated: ${s.strings_updated}
                        <br/>Strings deleted: ${s.strings_delete}`;
                        }
                        $state.reload();
                        toasty.success({
                            title: 'Pushed to transifex!',
                            msg: message,
                            clickToClose: true,
                            showClose: false,
                            sound: false,
                            html: true
                        });
                    })
                    .catch(function (e) {
                        toasty.error({
                            title: 'Pushed to transifex failed!',
                            msg: 'An error occurred.',
                            clickToClose: true,
                            showClose: false,
                            sound: false,
                            html: true
                        });
                    });
                $state.reload();
            };

            vm.pullFromTransifex = function () {
                ServiceService
                    .pullServiceFromTransifex(vm.service.id)
                    .then(function (s) {
                        $state.reload();
                        let message = 'There was no translations for service';
                        if (s.length > 0) {
                            message = `Translations in ${s} for service have been pulled from transifex!`;
                        }
                        toasty.success({
                            title: 'Pulled from transifex!',
                            msg: message,
                            clickToClose: true,
                            showClose: false,
                            sound: false
                        });
                    })
                    .catch(function (e) {
                        toasty.error({
                            title: 'Pull from transifex failed!',
                            msg: 'An error occurred',
                            clickToClose: true,
                            showClose: false,
                            sound: false,
                            html: true
                        });
                    });
            };

            vm.getTranslationStatus = function () {
                ServiceService
                    .getServiceTransifexData(vm.service.id)
                    .then(function (s) {
                        if (s.hasOwnProperty('data')) {
                            vm.transifexStatus = s.data;
                        } else if (s.hasOwnProperty('errors')) {
                            vm.transifexStatus = s.errors;
                        } else {
                            vm.transifexStatus = '';
                            langs.forEach(function (lang) {
                                if (lang[0] != 'en') {
                                    vm.transifexStatus += `${lang[1]}: ${s[lang[0]]} `;
                                }
                            })
                        }
                    })
                    .catch(function (e) {});
            };

            vm.getTranslationStatus();

            vm.generateSlug = function () {
                let regionSelected = 'undefined';
                let nameParsed = '';
                if (vm.isNew) {
                    if (vm.service.name_en) {
                        nameParsed = vm
                            .service
                            .name_en
                            .toLowerCase()
                            .replace(/ /g, '-')
                            .replace(/[-]+/g, '-')
                            .replace(/[^\w-]+/g, '');
                    }
                    if (vm.service.region) {
                        regionSelected = regions.find(region => region.id == vm.service.region);
                    }
                    vm.service.slug = `${regionSelected.slug}_${vm.service.provider}_${nameParsed}`;
                }
            };

            vm.checkIfOnList = function (newTag) {
                return vm
                    .service
                    .tags
                    .find(element => {
                        return element.name == newTag;
                    });
            };

            vm.checkIfExists = (newTag) => {
                if (newTag) {
                    let object = vm
                        .tags
                        .find(element => {
                            return element.name === newTag;
                        });
                    if (object) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return true;
                }
            };

            vm.createNewTag = (newTag) => {
                if (!vm.checkIfExists(newTag)) {
                    Restangular
                        .service('service-tag')
                        .post({
                            'name': newTag
                        })
                        .then(createdTag => {
                            vm
                                .tags
                                .push({
                                    'id': createdTag.id,
                                    'name': createdTag.name
                                });
                            let objectToPop = vm
                                .service
                                .tags
                                .filter(element => {
                                    return element.name == newTag;
                                });
                            for (let obj of objectToPop) {
                                vm
                                    .service
                                    .tags
                                    .splice(vm.service.tags.indexOf(obj), 1);
                            }
                            vm
                                .service
                                .tags
                                .push({
                                    'id': createdTag.id,
                                    'name': createdTag.name
                                });
                        });
                } else {
                    let objectToPop = vm
                        .service
                        .tags
                        .filter(element => {
                            return element.name == newTag;
                        });
                    for (let obj of objectToPop) {
                        vm
                            .service
                            .tags
                            .splice(vm.service.tags.indexOf(obj), 1);
                    }
                    vm
                        .service
                        .tags
                        .push(vm.tags.find(element => {
                            return element.name == newTag;
                        }));
                }
            };

            vm.transformTag = (newTag) => {
                let item = {
                    'id': newTag,
                    'name': newTag
                };
                return item;
            };

            vm.adjustMap = function () {
                if (vm.service.location.coordinates[1] || vm.service.location.coordinates[0]) {
                    $scope
                        .mapControl
                        .refreshMapExternal(vm.service.location.coordinates[1], vm.service.location.coordinates[0]);
                }
            };

            vm.getPreviewLink = () => {
                return `${webClientUrl}preview/${vm.service.id}`;
            };

            vm.add_shift = (day) => {
                vm
                    .service
                    .opening_time[day]
                    .push({
                        'open': null,
                        'close': null
                    });
            };

            vm.remove_shift = (day, index) => {
                vm
                    .service
                    .opening_time[day]
                    .splice(index, 1);
            };

            vm.ckeditorOptions = () => {
                return {
                    autoParagraph: false,
                    allowedContent: true,
                    height: 100
                };
            };
        };
        vm.addContactInformation = () => {
            if (!vm.service.contact_information) {
                vm.service.contact_information = [];
            }
            vm.service.contact_information.push({
                'id': null,
                'text': '',
                'index': vm.service.contact_information.length,
                'type': ''
            })
        }
        vm.removeContact = (index) => {
            vm.service.contact_information.splice(index, 1)
        }

    })
    .controller('ServiceConfirmationController', function ($http, $state, $stateParams, service, serviceTypes, apiUrl) {
        let vm = this;
        vm.days = [
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday'
        ];
        vm.sendAnnotation = false;
        vm.invalidConfirmationKey = false;
        vm.confirmationSucceeded = false;
        vm.note = '';
        vm.service = service[0];
        vm.service_data = {};
        vm.service_data['general_info'] = {
            'Name': vm.service.name,
            'Description': vm.service.description,
            'Additional Information': vm.service.additional_info,
            'Region': vm.service.region.name,
            'Languages spoken': vm.service.languages_spoken
        };
        vm.service_data['address'] = {
            'Address (City)': vm.service.address_city,
            'Address (Street)': vm.service.address,
            'Address (Floor)': vm.service.address_floor,
            'Address (Country Language)': vm.service.address_in_country_language
        };
        vm.service_data['other_info'] = {
            'Phone Number': vm.service.phone_number,
            'Email': vm.service.email,
            'Website': vm.service.website,
            'Whatsapp Number': vm.service.whatsapp,
            'Facebook Page': vm.service.facebook_page
        };
        vm.service_data['opening_hours'] = vm.service.opening_time;

        vm.confirm = () => {
            if (vm.sendAnnotation && vm.note) {
                return $http({
                    method: 'POST',
                    url: apiUrl + '/v2/service_confirm/',
                    params: {
                        service_id: $stateParams.serviceId,
                        confirmation_key: $stateParams.confirmationKey
                    },
                    data: {
                        status: 'outdated',
                        note: vm.note
                    }
                }).then((data) => {
                    vm.confirmationSucceeded = true;
                }).catch((data) => {
                    vm.invalidConfirmationKey = true;
                });
            } else {
                return $http({
                    method: 'POST',
                    url: apiUrl + '/v2/service_confirm/',
                    params: {
                        service_id: $stateParams.serviceId,
                        confirmation_key: $stateParams.confirmationKey
                    },
                    data: {
                        status: 'confirmed'
                    }
                }).then((data) => {
                    vm.confirmationSucceeded = true;
                }).catch((data) => {
                    vm.invalidConfirmationKey = true;
                });
            }
        };
    })
    .controller('ServicePrivateViewController', function (tableUtils, $scope, providers, serviceTypes, serviceStatus, regions, $filter, service_languages, ServiceService, $http, apiUrl, leafletData, $state, selectedLanguage) {
        let vm = this;
        let langs = service_languages;

        vm.providers = providers;
        vm.serviceTypes = serviceTypes;
        vm.regions = regions;
        vm.regionslvl1 = regions;
        vm.regionslvl2 = [];
        vm.regionslvl3 = [];

        if ($scope.selectedProvider) {
            vm.providerRegion = regions.filter(function (r) {
                return r.id === $scope.selectedProvider.region;
            });

            vm.providerRegion = vm.providerRegion && vm.providerRegion[0]
            vm.regionslvl1 = $scope.user.isSuperuser ? regions : [vm.providerRegion];
        }

        vm.regionlvl1 = 0;
        vm.regionlvl2 = 0;
        vm.regionlvl3 = 0;

        vm.serviceStatus = serviceStatus;
        vm.searchResults = [];
        vm.isMapMode = false;

        vm.dtOptions = tableUtils.defaultsWithServiceNameAndFilter('PrivateServiceService', {});
        vm.dtColumns = [
            tableUtils
            .newColumn('id')
            .withTitle('ID'),
            tableUtils
            .newColumn(`name_${selectedLanguage}`)
            .withTitle($filter('translate')('TABLE_SERVICE')),
            tableUtils
            .newColumn(`provider.name_${selectedLanguage}`)
            .withTitle($filter('translate')('TABLE_PROVIDER')),
            tableUtils
            .newColumn('types')
            .withTitle($filter('translate')('TABLE_TYPES'))
            .renderWith(function (types) {
                return types.map((type) => type.name).join(', ');
            }),
            tableUtils
            .newColumn('updated_at')
            .withTitle($filter('translate')('TABLE_UPDATE_AT'))
            .renderWith(function (data) {
                return $filter('date')(data, 'medium');
            })
        ];

        if ($scope.user.isSuperuser) {
            vm
                .dtColumns
                .push(tableUtils.newServiceActionColumn().withOption('width', '200px'));
        } else {

            vm
                .dtColumns
                .push(tableUtils.newServiceReadOnlyActionColumn().withOption('width', '100px'));
        }

        vm.reloadOption = (n) => {
            let o = tableUtils.defaultsWithServiceNameAndFilter('PrivateServiceService', n);

            vm
                .dtInstance
                .dataTable
                .fnSettings()
                .ajax = o.ajax
            vm
                .dtInstance
                .reloadData();
        }
        vm.markers = new L.FeatureGroup();
        vm.infoDiv = L.control();

        vm.infoDiv.update = (service) => {
            if (!this._div) {
                vm.infoDiv._div = L.DomUtil.create('div', 'hidden');
            }
            if (!service) {
                vm.infoDiv._div.innerHTML = ('<b>' + $filter('translate')('NO_SERVICES_INFO', {
                    siteName: scope.$root.translatedSiteName
                }) + '</b>');
            } else {
                vm.infoDiv._div.innerHTML = '<b>' + service.name + '</b><br/>' + $filter('limitTo')(service.description, 250);
            }
            vm.infoDiv._div.className = 'service-info-control';
            vm.infoDiv.addTo(leafletData.getMap());
        };

        vm.showInfo = (e) => {
            vm.infoDiv.update(e ? e.target.options.service : null);
        };

        vm.hideDiv = () => {
            if (vm.infoDiv._div) {
                vm.infoDiv._div.className = 'hidden';
            }
        };

        vm.showMap = (n, page_number) => {
            $http({
                method: 'GET',
                url: apiUrl + '/v2/private-services/',
                params: Object.assign({
                    page_size: 100,
                    page_number: page_number || 1,
                }, n),
            }).then((r) => {
                vm.confirmationSucceeded = true;
                vm.searchResults = r.data.results;
                vm.isMapMode = true;
                leafletData
                    .getMap('search-map')
                    .then(function (map) {
                        vm.drawServices(map, vm.searchResults, false);
                    });

            }).catch((data) => {
                vm.invalidConfirmationKey = true;
            });
        }
        vm.hideMap = () => {
            vm.isMapMode = false;
        }
        vm.drawServices = (map, services, isMobile) => {
            vm.markers.clearLayers();

            services.forEach(function (service) {
                if (service.location) {
                    var lat = service.location.coordinates[1];
                    var lng = service.location.coordinates[0];
                    var serviceIcon = L.VectorMarkers.icon({
                        icon: 'fa-pointer',
                        prefix: 'fa'
                        /*markerColor: ctrl.getServiceColor(service)*/
                    });


                    var marker = L.marker([lat, lng], {
                        service: service,
                        icon: serviceIcon
                    }).bindPopup('<div><b>' + service.name + '</b><br/>' + service.description.substr(0, 250) + '</div>', {
                        autoPan: false
                    });
                    marker.on('mouseover',
                        function (e) {
                            e.target.openPopup()
                        }
                    );
                    marker.on('mouseout',
                        function (e) {
                            e.target.closePopup()
                        }
                    );
                    marker.on('click', function (e) {
                        $state.go('service.open', {
                            serviceId: e.target.options.service.id
                        });
                    });
                    vm.markers.addLayer(marker);
                }
            });

            if (services.length > 0) {
                map.addLayer(vm.markers);

                setTimeout(() => {
                    map.invalidateSize();
                    map.fitBounds(vm.markers.getBounds(), {
                        padding: [25, 25]
                    });
                }, 400);
            }
        };

        vm.dtInstance = {};
        vm.searchCriteria = {};

        vm.clearFilters = () => {
            vm.searchCriteria = {};
            vm.regionlvl1 = 0;
            vm.regionlvl2 = 0;
            vm.regionlvl3 = 0;
        };

        vm.onRegionChange = () => {
            vm.regionslvl3 = [];
            vm.searchCriteria.geographic_region = vm.regionlvl1;
            if (vm.regionlvl1) {
                let parent = regions.filter((region) => region.slug == vm.regionlvl1)[0];
                vm.regionslvl2 = regions.filter((region) => region.parent == parent.id);
            } else {
                vm.regionslvl2 = [];
            }
        }

        vm.onRegionChangelvl2 = () => {
            vm.searchCriteria.geographic_region = vm.regionlvl2;
            vm.regionslvl3 = regions.filter((region) => region.parentSlug == vm.regionlvl2);
            vm.regionlvl3 = '';
            if (vm.regionlvl2) {
                let parent = regions.filter((region) => region.slug == vm.regionlvl2)[0];
                vm.regionslvl3 = regions.filter((region) => region.parent == parent.id);
            } else {
                vm.regionslvl3 = [];
            }
        }

        vm.onRegionChangelvl3 = () => {
            if (vm.regionlvl3) {
                vm.searchCriteria.geographic_region = vm.regionlvl3;
            } else {
                vm.searchCriteria.geographic_region = vm.regionlvl2;
            }

        }

        angular.extend($scope, vm);
    });