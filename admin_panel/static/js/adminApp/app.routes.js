/**
 * Created by reyrodrigues on 1/3/17.
 */

angular.module('adminApp')
    .config(function ($stateProvider, moment) {

        const analyticsContentMinBoundary = moment('2016-09-01');
        const analyticsVisitorsMinBoundary = moment('2016-09-01');
        const analyticsHotspotMinBoundary = moment('2017-03-03');
        const analyticsBalanceMinBoundary = moment('2017-03-08');
        const analyticsGasMinBoundary = moment('2016-09-15');
        const analyticsSocialMinBoundary = moment('2015-10-21');
        const analyticsMaxBoundary = moment();

        const analyticsLastWeekStartDate = moment().day(-5).format('YYYY-MM-DD');
        const analyticsLastWeekEndDate = moment().format('YYYY-MM-DD');

        $stateProvider
            .state('login', {
                url: '/login',
                data: {
                    allowAnonymous: true
                },
                views: {
                    'login@': {
                        templateUrl: 'views/user/login.html',
                        controller: 'LoginController as ctrl'
                    }
                }
            })
            .state('login.next', {
                url: '?next',
                data: {
                    allowAnonymous: true
                },
                views: {
                    'login@': {
                        templateUrl: 'views/user/login.html',
                        controller: 'LoginController as ctrl'
                    }
                }
            })
            .state('logout', {
                url: '/logout',
                data: {
                    allowAnonymous: true
                },
                onEnter: function (AuthService) {
                    return AuthService.logout().then(function () {
                        document.location = '/';
                    });
                }
            })
            .state('resetPassword', {
                url: '/reset_password',
                abstract: true
            })
            .state('resetPassword.email', {
                url: '/',
                data: {
                    allowAnonymous: true
                },
                onEnter: function ($stateParams, $state, $uibModal) {
                    $uibModal.open({
                        templateUrl: 'views/user/reset_password.html',
                        windowTemplateUrl: 'partials/directives/window.html',
                        backdrop: 'static',
                        size: 'md',
                        resolve: {},
                        controller: 'ResetPasswordController as ctrl'
                    }).result.finally(function () {
                    });
                }
            })
            .state('resetPassword.check', {
                url: '/{uidb64:[0-9A-Za-z_\-]+}/{token:[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20}}',
                data: {
                    allowAnonymous: true
                },
                onEnter: function ($stateParams, $state, $uibModal) {
                    $uibModal.open({
                        templateUrl: 'views/user/reset_password.html',
                        windowTemplateUrl: 'partials/directives/window.html',
                        backdrop: 'static',
                        size: 'lg',
                        resolve: {},
                        controller: 'ResetPasswordController as ctrl'
                    }).result.finally(function () {
                    });
                }
            })
            .state('home', {
                url: '/',
                views: {
                    'main@': {
                        template: '<div></div>',
                        controller: ($state, $rootScope) => {
                            /*
                             * TODO: figure out a default dashboard per user
                             * */
                            let locationPath = window.location.hash;

                            if (locationPath.includes('next=')) {
                                let redirectUrl = locationPath.split('=')[1].split('%23').join('#').split('~2F').join('/');
                                window.location.assign(redirectUrl);
                            } else {
                                if($rootScope.user.isSuperuser) {
                                    $state.go('provider.list');
                                } else {
                                    $state.go('service.list');
                                    
                                }
                            }
                        }
                    }
                }
            })
            /*
             * Menu
             * */
            // Analytics Dashboard
            .state('analytics', {
                url: '/analytics',
                abstract: true,
                resolve: {}
            })
            .state('analytics.services', {
                url: '/services',
                views: {
                    'services': {
                        templateUrl: 'views/analytics/services.html',
                    }
                },
                resolve: {}
            })
            .state('analytics.content', {
                url: '/content',
                views: {
                    'main@': {
                        templateUrl: 'views/analytics/content.html',
                        controller: 'AnalyticsContentController as ctrl'
                    }
                },
                resolve: {
                    analytics: AnalyticsService => AnalyticsService.getContentAnalytics(
                                                                    analyticsLastWeekStartDate,
                                                                    analyticsLastWeekEndDate
                                                                    ).then(response => response.data),
                    tableData: LatestPageService => LatestPageService.forDataTables,
                    datepickerRanges: () => ({
                        startDate: analyticsLastWeekStartDate,
                        endDate: analyticsLastWeekEndDate
                    }),
                    datePickerBoundries: () => ({
                        min: analyticsContentMinBoundary,
                        max: analyticsMaxBoundary
                    })
                }
            })
            .state('analytics.content.outdated', {
                url: '/outdated',
                views: {
                    'outdated': {
                        templateUrl: 'views/analytics/content.outdated.html',
                        controller: 'AnalyticsOutdatedContentController as ctrl'
                    }
                },
                resolve: {
                    outdated: (AnalyticsService) => AnalyticsService.getOutdatedContent().then(response => response.data)
                }
            })
            .state('analytics.visitors', {
                url: '/visitors',
                views: {
                    'main@': {
                        templateUrl: 'views/analytics/visitors.html',
                        controller: 'AnalyticsVisitorsController as ctrl'
                    }
                },
                resolve: {
                    datepickerRanges: function () {
                        return {
                            startDate: analyticsLastWeekStartDate,
                            endDate: analyticsLastWeekEndDate
                        }
                    },
                    datePickerBoundries: function () {
                        return {
                            min: analyticsVisitorsMinBoundary,
                            max: analyticsMaxBoundary
                        }
                    }
                }
            })
            .state('analytics.mobile', {
                url: '/mobile',
                views: {
                    'mobile': {
                        templateUrl: 'views/analytics/mobile.html',
                    }
                },
                resolve: {}
            })
            .state('analytics.social', {
                url: '/social',
                views: {
                    'main@': {
                        templateUrl: 'views/analytics/social.html',
                        controller: 'AnalyticsSocialController as ctrl'
                    }
                },
                resolve: {
                    datepickerRanges: () => {
                        return {
                            startDate: analyticsLastWeekStartDate,
                            endDate: analyticsLastWeekEndDate
                        };
                    },
                    datePickerBoundries: () => {
                        return {
                            min: analyticsSocialMinBoundary,
                            max: analyticsMaxBoundary
                        };
                    }
                }
            })
            .state('analytics.hotspots', {
                url: '/hotspots',
                views: {
                    'main@': {
                        templateUrl: 'views/analytics/hotspots.html',
                        controller: 'AnalyticsHotspotsController as ctrl'
                    }
                },
                resolve: {
                    merakiStats: (AnalyticsService) => AnalyticsService.getMerakiStats(
                                                                        analyticsLastWeekStartDate,
                                                                        analyticsLastWeekEndDate,
                                                                        'L_637259347272927954'
                                                                        ).then(response => response.data),
                    merakiNetworks: (AnalyticsService) => AnalyticsService.getMerakiNetworks().then(response => response.data),
                    merakiApps: (AnalyticsService) => AnalyticsService.getMerakiApps(
                                                                        analyticsLastWeekStartDate,
                                                                        analyticsLastWeekEndDate,
                                                                        'L_637259347272927954'
                                                                        ).then(response => response.data),
                    datepickerRanges: function () {
                        return {
                            startDate: analyticsLastWeekStartDate,
                            endDate: analyticsLastWeekEndDate
                        }
                    },
                    datePickerBoundries: function () {
                        return {
                            min: analyticsHotspotMinBoundary,
                            max: analyticsMaxBoundary
                        }
                    }
                }
            })
            .state('analytics.balance', {
                url: '/balance',
                views: {
                    'balance': {
                        templateUrl: 'views/analytics/balance.html',
                    }
                },
                resolve: {}
            })
            .state('analytics.search', {
                url: '/search',
                views: {
                    'search': {
                        templateUrl: 'views/analytics/search.html',
                    }
                },
                resolve: {}
            })
            // Team Management
            .state('team', {
                url: '/team',
                data: {
                    title: 'Team Management'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/team/view.html',
                        controller: 'TeamController as ctrl'
                    }
                },
                resolve: {}
            })
            // Calendar & Eventes
            .state('calendar', {
                url: '/calendar',
                data: {
                    title: 'Calendar & Eventes'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/calendar/view.html',
                        controller: 'CalendarController as ctrl'
                    }
                },
                resolve: {}
            })
            // What's New
            .state('whatsNew', {
                url: '/whats-new',
                data: {
                    title: 'What\'s New'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/whatsnew/view.html',
                        controller: 'WhatsNewController as ctrl'
                    }
                },
                resolve: {}
            })

            /*
             * Your Apps
             * */

            // Services Management
            .state('service', {
                url: '/service',
                abstract: true
            })
            .state('service.dashboard', {
                url: '/dashboard',
                data: {
                    title: 'Service overview'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/service/overview.html',
                        controller: 'ServiceOverviewController as ctrl'
                    }
                },
                resolve: {
                    provider: function (ProviderService, $rootScope, $q) {
                        var dfd = $q.defer();
                        $rootScope.$watch('selectedProvider', function (value) {
                            if (value) {
                                ProviderService.get($rootScope.selectedProvider.id).then(function (p) {
                                    dfd.resolve(p);
                                });
                            }
                        });
                        return dfd.promise;
                    },
                    services: function (ServiceService, $rootScope, $q) {
                        var dfd = $q.defer();
                        $rootScope.$watch('selectedProvider', function (value) {
                            if (value) {
                                ServiceService.get('', {'provider': $rootScope.selectedProvider.id}).then(function (p) {
                                    dfd.resolve(p);
                                });
                            }
                        });
                        return dfd.promise;
                    },
                    serviceTypes: function (CommonDataService) {
                        return CommonDataService.getServiceTypes();
                    },
                    regions: function allRegions(GeoRegionService, $q, $window) {
                        var dfd = $q.defer();
                        if ($window.sessionStorage.allRegions) {
                            dfd.resolve(JSON.parse($window.sessionStorage.allRegions));
                        } else {
                            GeoRegionService.getList({exclude_geometry: true}).then(function (r) {
                                var regions = r.plain().map(function (r1) {
                                    return {
                                        name: r1.name,
                                        centroid: r1.centroid,
                                        id: r1.id,
                                        slug: r1.slug
                                    };
                                });

                                $window.sessionStorage.allRegions = JSON.stringify(regions);
                                dfd.resolve(regions);
                            });
                        }
                        return dfd.promise;
                    }
                }
            })
            .state('service.list', {
                url: '/list',
                data: {
                    title: 'Service list'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/service/list-view.html',
                        controller: 'ServiceListController as ctrl'
                    }
                },
                resolve: {
                    provider: function (ProviderService, $rootScope, $q) {
                        var dfd = $q.defer();
                        $rootScope.$watch('selectedProvider', function (value) {
                            if (value) {
                                ProviderService.get($rootScope.selectedProvider.id).then(function (p) {
                                    dfd.resolve(p);
                                });
                            }
                        });
                        return dfd.promise;
                    },
                    serviceTypes: function (CommonDataService) {
                        return CommonDataService.getServiceTypes();
                    },
                    regions: function allRegions(GeoRegionService, $q, $window) {
                        var dfd = $q.defer();
                        if ($window.sessionStorage.allRegions) {
                            dfd.resolve(JSON.parse($window.sessionStorage.allRegions));
                        } else {
                            GeoRegionService.getList({exclude_geometry: true}).then(function (r) {
                                var regions = r.plain().map(function (r1) {
                                    return {
                                        name: r1.name,
                                        centroid: r1.centroid,
                                        id: r1.id,
                                        slug: r1.slug
                                    };
                                });

                                $window.sessionStorage.allRegions = JSON.stringify(regions);
                                dfd.resolve(regions);
                            });
                        }
                        return dfd.promise;
                    }
                }
            })
            .state('service.open', {
                url: '/:serviceId',
                data: {
                    title: 'Service Details'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/service/service-view.html',
                        controller: 'ServiceOpenController as ctrl'
                    }
                },
                resolve: {
                    provider: function (Restangular, $rootScope) {
                        if ($rootScope.selectedProvider) {
                            return Restangular.one('providers', $rootScope.selectedProvider.id).get();
                        }
                        else {
                            var dfd = $q.defer();
                            $rootScope.$watch('selectedProvider', function(){
                                Restangular.one('providers', $rootScope.selectedProvider.id).get().then(function(p){
                                    dfd.resolve(p);
                                });
                            });
                                
                            return dfd;
                        }
                    },
                    providers: function (ProviderService, Restangular, $q) {
                        var dfd = $q.defer();
                        ProviderService.getList().then(function (p) {
                            var providers = p.plain().map(function (ps) {
                                return {
                                    name: ps.name,
                                    id: ps.id
                                };
                            });
                            dfd.resolve(providers);
                        });
                        return dfd.promise;
                    },
                    serviceTypes: function (CommonDataService) {
                        return CommonDataService.getServiceTypes();
                    },
                    regions: function allRegions(GeoRegionService, $q, $window) {
                        var dfd = $q.defer();
                        if ($window.sessionStorage.allRegions) {
                            dfd.resolve(JSON.parse($window.sessionStorage.allRegions));
                        } else {
                            GeoRegionService.getList({exclude_geometry: true}).then(function (r) {
                                var regions = r.plain().map(function (r1) {
                                    return {
                                        name: r1.name,
                                        centroid: r1.centroid,
                                        id: r1.id,
                                        slug: r1.slug
                                    };
                                });

                                $window.sessionStorage.allRegions = JSON.stringify(regions);
                                dfd.resolve(regions);
                            });
                        }
                        return dfd.promise;
                    },
                    service: function (Restangular, $stateParams) {
                        return Restangular.one('services', $stateParams.serviceId).get();
                    },
                    tags: Restangular => Restangular.all('service-tag').getList(),
                    confirmationLogs: (Restangular, $stateParams) => Restangular.one('confirmation-logs', $stateParams.serviceId).get()
                }
            })
            .state('service.confirmation', {
                url: '/confirm/:serviceId/:confirmationKey',
                data: {
                    allowAnonymous: true,
                    title: 'Service Confirmation'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/service/service-confirm.html',
                        controller: 'ServiceConfirmationController as ctrl'
                    },
                    'login@': {
                        templateUrl: 'views/service/service-confirm.html',
                        controller: 'ServiceConfirmationController as ctrl'
                    }
                },
                resolve: {
                    serviceTypes: function (CommonDataService) {
                        return CommonDataService.getServiceTypes();
                    },
                    service: function (Restangular, $stateParams) {
                        return Restangular.one('services').customGET('preview', {id: $stateParams.serviceId});
                    },
                }
            })
            .state('service.create', {
                url: '/create',
                data: {
                    title: 'Service Create'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/service/service-view.html',
                        controller: 'ServiceOpenController as ctrl'
                    }
                },
                resolve: {

                    provider: function (Restangular, $rootScope) {
                        if ($rootScope.selectedProvider) {
                            return Restangular.one('providers', $rootScope.selectedProvider.id).get();
                        }
                        else {
                            var dfd = $q.defer();
                            $rootScope.$watch('selectedProvider', function(){
                                conosle.log('changed??', $rootScope.selectedProvider);
                                Restangular.one('providers', $rootScope.selectedProvider.id).get().then(function(p){
                                    dfd.resolve(p);
                                });
                            });
                                
                            return dfd;
                        }
                    },
                    providers: function (ProviderService, Restangular, $q) {
                        var dfd = $q.defer();
                        ProviderService.getList().then(function (p) {
                            var providers = p.plain().map(function (ps) {
                                return {
                                    name: ps.name,
                                    id: ps.id
                                };
                            });
                            dfd.resolve(providers);
                        });
                        return dfd.promise;
                    },
                    serviceTypes: function (CommonDataService) {
                        return CommonDataService.getServiceTypes();
                    },
                    regions: function allRegions(GeoRegionService, $q, $window) {
                        var dfd = $q.defer();
                        if ($window.sessionStorage.allRegions) {
                            dfd.resolve(JSON.parse($window.sessionStorage.allRegions));
                        } else {
                            GeoRegionService.getList({exclude_geometry: true}).then(function (r) {
                                var regions = r.plain().map(function (r1) {
                                    return {
                                        name: r1.name,
                                        centroid: r1.centroid,
                                        id: r1.id,
                                        slug: r1.slug
                                    };
                                });

                                $window.sessionStorage.allRegions = JSON.stringify(regions);
                                dfd.resolve(regions);
                            });
                        }
                        return dfd.promise;
                    },
                    service: function () {
                        return {};
                    },
                    tags: Restangular => Restangular.all('service-tag').getList(),
                    confirmationLogs: () => {
                        return {};
                    }
                }
            })
            .state('service.duplicate', {
                url: '/duplicate/:serviceId',
                onEnter: function ($stateParams, $state, $uibModal, ServiceService, toasty) {
                    $uibModal.open({
                        templateUrl: 'views/service/service-duplicate.html',
                        windowTemplateUrl: 'partials/directives/window.html',
                        backdrop: 'static',
                        resolve: {
                            serviceId: () => {
                                return $stateParams.serviceId;
                            }
                        },
                        controller: 'ServiceDuplicateController as ctrl'
                    }).result.then((data) => {
                        ServiceService.duplicate(data.serviceId, data.newName).then( () => {
                            toasty.success({
                                msg: 'Service successfully duplicated.',
                                clickToClose: true,
                                showClose: false,
                                sound: false
                            });
                            $state.reload();
                        });
                    }).result.finally(() => {
                        $state.go('^');
                    });
                }
            })
            .state('service.archive', {
                url: '/archive/:serviceId',
                onEnter: function ($stateParams, $state, $uibModal, ServiceService, toasty) {
                    $uibModal.open({
                        templateUrl: 'views/service/service-archive.html',
                        windowTemplateUrl: 'partials/directives/window.html',
                        backdrop: 'static',
                        resolve: {
                            serviceId: () => {
                                return $stateParams.serviceId;
                            }
                        },
                        controller: 'ServiceArchiveController as ctrl'
                    }).result.then((serviceId) => {
                        ServiceService.archive(serviceId).then( () => {
                            toasty.success({
                                msg: 'Service successfully archived.',
                                clickToClose: true,
                                showClose: false,
                                sound: false
                            });
                            $state.reload();
                        });
                    }).result.finally(() => {
                        $state.go('^');
                    });
                }
            })

            .state('newsletter', {
                url: '/newsletter',
                abstract: true
            })

            .state('newsletter.logs', {
                url: '/logs',
                data: {
                    title: 'Newsletter Logs'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/newsletter/confirmation-log-list.html',
                        controller: 'ConfirmationLogListController as ctrl'
                    }
                },
                resolve: {
                    confirmationLogs: Restangular => Restangular.all('confirmation-log-list').getList()
                }
            })

            .state('newsletter.settings', {
                url: '/settings',
                data: {
                    title: 'Newsletter Settings'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/newsletter/newsletter-settings.html',
                        controller: 'NewsletterSettingsController as ctrl'
                    }
                },
                resolve: {
                    settings: Restangular => Restangular.all('settings').getList()
                }
            })

            // Balance Checker
            .state('balance', {
                url: '/balance',
                data: {
                    title: 'Balance Checker'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/shared/analytics/view.html',
                        controller: 'AnalyticsDetailController as ctrl'
                    }
                },
                resolve: {
                    statObjects: function (Restangular) {
                        return Restangular.all('web-stats/').customGET('detail', {
                                                                                    view_id: balanceCheckerId,
                                                                                    date: analyticsLastWeekStartDate,
                                                                                    end_date: analyticsLastWeekEndDate}
                                                                    );
                    },
                    analyticsId: function () {
                        return balanceCheckerId;
                    },
                    title: function () {
                        return 'Balance Checker';
                    },
                    url: function () {
                        return '#';
                    },
                    datepickerRanges: function () {
                        return {
                            startDate: analyticsLastWeekStartDate,
                            endDate: analyticsLastWeekEndDate
                        }
                    },
                    datePickerBoundries: function () {
                        return {
                            min: analyticsBalanceMinBoundary,
                            max: analyticsMaxBoundary
                        }
                    }
                }
            })
            // GAS Search tool
            .state('gas', {
                url: '/gas',
                data: {
                    title: 'GAS Search tool'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/shared/analytics/view.html',
                        controller: 'AnalyticsDetailController as ctrl'
                    }
                },
                resolve: {
                    statObjects: function (Restangular) {
                        return Restangular.all('web-stats/').customGET('detail', {
                                                                                    view_id: gasSearchId,
                                                                                    date: analyticsLastWeekStartDate,
                                                                                    end_date: analyticsLastWeekEndDate}
                                                                    );
                    },
                    analyticsId: function () {
                        return gasSearchId;
                    },
                    title: function () {
                        return 'Gas Search Tool';
                    },
                    url: function () {
                        return 'https://search.rescueapp.org/#/';
                    },
                    datepickerRanges: function () {
                        return {
                            startDate: analyticsLastWeekStartDate,
                            endDate: analyticsLastWeekEndDate
                        }
                    },
                    datePickerBoundries: function () {
                        return {
                            min: analyticsGasMinBoundary,
                            max: analyticsMaxBoundary
                        }
                    }
                }
            })

            /*
             * Your Apps
             * */

            // Social Media
            .state('social', {
                url: '/social',
                abstract: true
            })
            .state('social.conversation', {
                url: '/conversation',
                abstract: true
            })
            .state('social.conversation.list', {
                url: '/',
                data: {
                    title: 'Conversations'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/generic/table-view.html',
                        controller: 'ConversationListController as ctrl'
                    }
                },
                resolve: {}
            })
            .state('social.conversation.open', {
                url: '/:id',
                data: {
                    title: 'Conversation'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/conversation/view.html',
                        controller: 'ConversationOpenController as ctrl'
                    }
                },
                resolve: {
                    object: function (ConversationService, $stateParams) {
                        return ConversationService.get($stateParams.id);
                    },
                    messages: function (MessageService, $stateParams) {
                        return MessageService.getList({conversation: $stateParams.id, ordering: 'created'});
                    }
                }
            })
            // Notifications
            .state('notifications', {
                url: '/notifications',
                data: {
                    title: 'Notifications'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/notifications/view.html',
                        controller: 'NotificationsController as ctrl'
                    }
                },
                resolve: {}
            })
            // Account Settings
            .state('settings', {
                url: '/settings',
                data: {
                    title: 'Account Settings'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/user/view.html',
                        controller: 'UserViewController as ctrl'
                    }
                },
                resolve: {
                    user: function (Restangular, $rootScope) {
                        return Restangular.one('users', $rootScope.user.id).get();
                    },
                    groups: function (Restangular) {
                        return Restangular.all('groups').getList();
                    }
                }
            })

            // Tutorials and Support
            .state('tutorials', {
                url: '/tutorials',
                data: {
                    title: 'Tutorials and Support'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/tutorials/view.html',
                        controller: 'TutorialsController as ctrl'
                    }
                },
                resolve: {}
            })
            // Contact Us
            .state('contactUs', {
                url: '/contact-us',
                data: {
                    title: 'Contact Us'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/contact/view.html',
                        controller: 'ContactUsController as ctrl'
                    }
                },
                resolve: {}
            })

            /*
             * Refugee.info Admin
             * */

            // Users Management
            .state('user', {
                url: '/user',
                abstract: true
            })
            .state('user.list', {
                url: '/',
                data: {
                    title: 'System Users'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/generic/table-view.html',
                        controller: 'UserListController as ctrl'
                    }
                },
                resolve: {
                    tableData: UserService => UserService.forDataTables
                }
            })
            .state('user.create', {
                url: '/create',
                data: {
                    title: 'Create System User'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/user/view.html',
                        controller: 'UserViewController as ctrl'
                    }
                },
                resolve: {
                    user: () => {
                        return {};
                    },
                    groups: Restangular => Restangular.all('groups').getList()

                }
            })
            .state('user.open', {
                url: '/:id',
                data: {
                    title: 'System User'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/user/view.html',
                        controller: 'UserViewController as ctrl'
                    }
                },
                resolve: {
                    user: function (Restangular, $stateParams) {
                        return Restangular.one('users', $stateParams.id).get();
                    },
                    groups: function (Restangular) {
                        return Restangular.all('groups').getList();
                    }
                }
            })
            // Service Provider Management
            .state('provider', {
                url: '/provider',
                abstract: true
            })
            .state('provider.list', {
                url: '/',
                data: {
                    title: 'Service Providers'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/generic/table-view.html',
                        controller: 'ProviderListController as ctrl'
                    }
                },
                resolve: {
                    providerTypes: function (CommonDataService) {
                        return CommonDataService.getProviderTypes();
                    }
                }
            })
            .state('provider.openMe', {
                url: '/me',
                data: {
                    title: 'Service Provider'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/provider/view.html',
                        controller: 'ProviderOpenController as ctrl'
                    }
                },
                resolve: {
                    providerTypes: function (CommonDataService) {
                        return CommonDataService.getProviderTypes();
                    },
                    serviceAreas: function (CommonDataService) {
                        return CommonDataService.getServiceAreas();
                    },
                    systemUsers: function (CommonDataService) {
                        return CommonDataService.getUsersForLookup();
                    },
                    provider: function (ProviderService, $rootScope, $q) {
                        var dfd = $q.defer();
                        $rootScope.$watch('selectedProvider', function (value) {
                            if (value) {
                                ProviderService.get($rootScope.selectedProvider.id).then(function (p) {
                                    dfd.resolve(p);
                                });
                            }
                        });
                        return dfd.promise;
                    },
                    
                }
            })
            .state('provider.dashboard', {
                url: '/dashboard',
                data: {
                    title: 'Service Provider Dashboard'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/provider/view.html',
                        controller: 'ProviderOpenController as ctrl'
                    }
                },
                resolve: {
                    providerTypes: function (CommonDataService) {
                        return CommonDataService.getProviderTypes();
                    },
                    serviceAreas: function (CommonDataService) {
                        return CommonDataService.getServiceAreas();
                    },
                    systemUsers: function (CommonDataService) {
                        return CommonDataService.getUsersForLookup();
                    },
                    provider: function (ProviderService, $rootScope, $q) {
                        var dfd = $q.defer();
                        $rootScope.$watch('selectedProvider', function (value) {
                            if (value) {
                                ProviderService.get($rootScope.selectedProvider.id).then(function (p) {
                                    dfd.resolve(p);
                                });
                            }
                        });
                        return dfd.promise;
                    }
                }
            })
            .state('provider.open', {
                url: '/:id',
                data: {
                    title: 'Service Provider'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/provider/view.html',
                        controller: 'ProviderOpenController as ctrl'
                    }
                },
                resolve: {
                    providerTypes: function (CommonDataService) {
                        return CommonDataService.getProviderTypes();
                    },
                    serviceAreas: function (CommonDataService) {
                        return CommonDataService.getServiceAreas();
                    },
                    systemUsers: function (CommonDataService) {
                        return CommonDataService.getUsersForLookup();
                    },
                    provider: function (ProviderService, $stateParams) {
                        return ProviderService.get($stateParams.id);
                    },regions: function allRegions(GeoRegionService, $q, $window) {
                        var dfd = $q.defer();
                        if ($window.sessionStorage.allRegions) {
                            dfd.resolve(JSON.parse($window.sessionStorage.allRegions));
                        } else {
                            GeoRegionService.getList({exclude_geometry: true}).then(function (r) {
                                var regions = r.plain().map(function (r1) {
                                    return {
                                        name: r1.name,
                                        centroid: r1.centroid,
                                        id: r1.id,
                                        slug: r1.slug
                                    };
                                });

                                $window.sessionStorage.allRegions = JSON.stringify(regions);
                                dfd.resolve(regions);
                            });
                        }
                        return dfd.promise;
                    },
                }
            })
            .state('provider.create', {
                url: '/create',
                data: {
                    title: 'Service Provider Create'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/provider/view.html',
                        controller: 'ProviderOpenController as ctrl'
                    }
                },
                resolve: {
                    providerTypes: function (CommonDataService) {
                        return CommonDataService.getProviderTypes();
                    },
                    serviceAreas: function (CommonDataService) {
                        return CommonDataService.getServiceAreas();
                    },
                    systemUsers: function (CommonDataService) {
                        return CommonDataService.getUsersForLookup();
                    },
                    provider: function () {
                        return {};
                    },
                    regions: function allRegions(GeoRegionService, $q, $window) {
                        var dfd = $q.defer();
                        if ($window.sessionStorage.allRegions) {
                            dfd.resolve(JSON.parse($window.sessionStorage.allRegions));
                        } else {
                            GeoRegionService.getList({exclude_geometry: true}).then(function (r) {
                                var regions = r.plain().map(function (r1) {
                                    return {
                                        name: r1.name,
                                        centroid: r1.centroid,
                                        id: r1.id,
                                        slug: r1.slug
                                    };
                                });

                                $window.sessionStorage.allRegions = JSON.stringify(regions);
                                dfd.resolve(regions);
                            });
                        }
                        return dfd.promise;
                    },
                }
            })
            //Geographic Regions
            .state('region', {
                url: '/region',
                abstract: true
            })
            .state('region.list', {
                url: '/',
                data: {
                    title: 'Geographic Regions'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/generic/table-view.html',
                        controller: 'RegionListController as ctrl'
                    }
                },
                resolve: {}
            })
            .state('region.create', {
                url: '/create',
                data: {
                    title: 'Create Geographic Region'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/region/view.html',
                        controller: 'RegionViewController as ctrl'
                    }
                },
                resolve: {
                    region: function ($q) {
                        var dfd = $q.defer();
                        dfd.resolve({});
                        return dfd.promise;
                    },
                    allRegions: function (GeoRegionService, $q, $window) {
                        var dfd = $q.defer();
                        if ($window.sessionStorage.allRegions) {
                            dfd.resolve(JSON.parse($window.sessionStorage.allRegions));
                        } else {
                            GeoRegionService.getList({exclude_geometry: true}).then(function (r) {
                                var regions = r.plain().map(function (r1) {
                                    return {
                                        name: r1.name,
                                        centroid: r1.centroid,
                                        id: r1.id,
                                        slug: r1.slug
                                    };
                                });

                                $window.sessionStorage.allRegions = JSON.stringify(regions);
                                dfd.resolve(regions);
                            });
                        }
                        return dfd.promise;
                    }
                }
            })
            .state('region.open', {
                url: '/:id',
                data: {
                    title: 'Geographic Region'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/region/view.html',
                        controller: 'RegionViewController as ctrl'
                    }
                },
                resolve: {
                    region: function (GeoRegionService, $stateParams) {
                        return GeoRegionService.get($stateParams.id);
                    },
                    allRegions: function (GeoRegionService, $q, $window) {
                        var dfd = $q.defer();
                        if ($window.sessionStorage.allRegions) {
                            dfd.resolve(JSON.parse($window.sessionStorage.allRegions));
                        } else {
                            GeoRegionService.getList({exclude_geometry: true}).then(function (r) {
                                var regions = r.plain().map(function (r1) {
                                    return {
                                        name: r1.name,
                                        centroid: r1.centroid,
                                        id: r1.id,
                                        slug: r1.slug
                                    };
                                });

                                $window.sessionStorage.allRegions = JSON.stringify(regions);
                                dfd.resolve(regions);
                            });
                        }
                        return dfd.promise;
                    }
                }
            })
            // App Management
            .state('apps', {
                url: '/apps',
                abstract: true
            })
            .state('apps.manage', {
                url: '/manage',
                abstract: true
            })
            .state('apps.manage.list', {
                url: '/',
                data: {
                    title: 'Micro Apps'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/generic/table-view.html',
                        controller: 'MicroAppListController as ctrl'
                    }
                },
                resolve: {}
            })
            .state('apps.manage.create', {
                url: '/create',
                data: {
                    title: 'New Micro App'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/app/view.html',
                        controller: 'MicroAppOpenController as ctrl'
                    }
                },
                resolve: {
                    object: function ($q) {
                        var dfd = $q.defer();
                        dfd.resolve({});
                        return dfd.promise;
                    }
                }
            })
            .state('apps.manage.open', {
                url: '/:id',
                data: {
                    title: 'Micro App'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/app/view.html',
                        controller: 'MicroAppOpenController as ctrl'
                    }
                },
                resolve: {
                    object: function (MicroAppService, $stateParams) {
                        return MicroAppService.get($stateParams.id);
                    }
                }
            })


            .state('blog', {
                url: '/blog',
                abstract: true
            })
            .state('blog.list', {
                url: '/',
                data: {
                    title: 'Blog Entry Translations'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/generic/table-view.html',
                        controller: 'BlogListController as ctrl'
                    }
                },
                resolve: {}
            })

            .state('blog.list.push', {
                url: ':id/push',
                onEnter: ($stateParams, $state, toasty, $timeout, BlogService)=> {
                    $timeout(()=> {
                        BlogService.pushToTransifex($stateParams.id).then(()=> {
                            toasty.success({
                                msg: 'Blog post uploaded to transifex.',
                                clickToClose: true,
                                showClose: false,
                                sound: false
                            });
                            $state.go('^').then(()=> $state.reload());

                        });
                    });
                }
            })

            .state('blog.list.pull', {
                url: ':id/pull',
                onEnter: ($stateParams, $state, toasty, $timeout, BlogService)=> {
                    $timeout(()=> {
                        BlogService.pullFromTransifex($stateParams.id).then(()=> {
                            toasty.success({
                                msg: 'Completed translations uploaded to blog.',
                                clickToClose: true,
                                showClose: false,
                                sound: false
                            });
                            $state.go('^').then(()=> $state.reload());
                        });
                    });
                }
            })

            // Controlled Lists

            .state('lists', {
                url: '/lists',
                abstract: true
            })
            .state('lists.serviceType', {
                url: '/serviceType',
                abstract: true
            })
            .state('lists.serviceType.list', {
                url: '/',
                data: {
                    title: 'Service Types'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/generic/table-view.html',
                        controller: 'ServiceTypeListController as ctrl'
                    }
                },
                resolve: {}
            })
            .state('lists.serviceType.create', {
                url: '/create',
                data: {
                    title: 'New Service Type'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/lists/serviceType/view.html',
                        controller: 'ServiceTypeViewController as ctrl'
                    }
                },
                resolve: {
                    object: function ($q) {
                        var dfd = $q.defer();
                        dfd.resolve({});
                        return dfd.promise;
                    },
                    serviceTypes: function (CommonDataService) {
                        return CommonDataService.getServiceTypes();
                    },
                }
            })
            .state('lists.serviceType.open', {
                url: '/:id',
                data: {
                    title: 'Service Type'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/lists/serviceType/view.html',
                        controller: 'ServiceTypeViewController as ctrl'
                    }
                },
                resolve: {
                    object: function (ServiceTypeService, $stateParams) {
                        return ServiceTypeService.get($stateParams.id);
                    },
                    serviceTypes: function (CommonDataService) {
                        return CommonDataService.getServiceTypes();
                    },
                }
            })

            .state('lists.providerType', {
                url: '/providerType',
                abstract: true
            })
            .state('lists.providerType.list', {
                url: '/',
                data: {
                    title: 'Provider Types'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/generic/table-view.html',
                        controller: 'ProviderTypeListController as ctrl'
                    }
                },
                resolve: {}
            })
            .state('lists.providerType.create', {
                url: '/create',
                data: {
                    title: 'New Provider Type'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/lists/providerType/view.html',
                        controller: 'ProviderTypeOpenController as ctrl'
                    }
                },
                resolve: {
                    object: function ($q) {
                        var dfd = $q.defer();
                        dfd.resolve({});
                        return dfd.promise;
                    }
                }
            })
            .state('lists.providerType.open', {
                url: '/:id',
                data: {
                    title: 'Provider Type'
                },
                views: {
                    'main@': {
                        templateUrl: 'views/lists/providerType/view.html',
                        controller: 'ProviderTypeOpenController as ctrl'
                    }
                },
                resolve: {
                    object: function (ProviderTypeService, $stateParams) {
                        return ProviderTypeService.get($stateParams.id);
                    }
                }
            })

            // CMS Routes TODO: REFACTOR
            .state('environmentChoice', {
                url: '/cms/',
                views: {
                    'main': {
                        templateUrl: 'partials/environment.choice.html',
                        controller: 'EnvironmentController as ctrl'
                    }
                },
                resolve: {
                    environments: function () {
                        return ['staging', 'production'];
                    }
                },
                ncyBreadcrumb: {
                    label: 'Environments'
                }
            })
            .state('countryChoice', {
                url: ':environment',
                parent: 'environmentChoice',
                views: {
                    'main@': {
                        templateUrl: 'partials/country.choice.html',
                        controller: 'CountryController as ctrl'
                    },
                    'environmentBreadcrumbs@': {
                        templateUrl: 'partials/environment.breadcrumbs.html',
                        controller: 'CountryController as ctrl'
                    }
                },
                resolve: {
                    countries: function (RegionService) {
                        return RegionService.getCountries().then(function (response) {
                            return response.data;
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Countries'
                }
            })
            .state('about', {
                url: ':environment/about',
                parent: 'environmentChoice',
                views: {
                    'main@': {
                        templateUrl: 'partials/about.html',
                        controller: 'AboutController as ctrl'
                    }
                },
                resolve: {
                    page: function (PageService, $stateParams) {
                        return PageService.getPage('about-us', $stateParams.environment).then(function (response) {
                            return response.data;
                        });
                    }
                }
            })
            .state('main', {
                url: '/:countrySlug',
                parent: 'countryChoice',
                views: {
                    'main@': {
                        templateUrl: 'partials/main.html',
                        controller: 'CMSRegionListController as ctrl'
                    },
                    'countryBreadcrumbs@': {
                        templateUrl: 'partials/country.breadcrumbs.html',
                        controller: 'RegionListController as ctrl'
                    }
                },
                resolve: {
                    pages: function (PageService, $stateParams) {
                        return PageService.getPagesSimple($stateParams.environment, $stateParams.countrySlug).then(function (response) {
                            return response.data;
                        });
                    },
                    country: function (RegionService, $stateParams) {
                        return RegionService.getSimplePagesByRegion($stateParams.countrySlug, $stateParams.environment).then(function (response) {
                            return response.data;
                        });
                    }
                },
                ncyBreadcrumb: {
                    label: 'Edit Region'
                }
            })
            .state('regionDetails', {
                url: '/:regionSlug',
                parent: 'main',
                views: {
                    'regionDetails': {
                        templateUrl: 'partials/region.details.html',
                        controller: 'RegionDetailsController as ctrl'
                    },
                    'pageList': {
                        templateUrl: 'partials/page.list.html',
                        controller: 'RegionDetailsController as ctrl'
                    },
                    'regionHeader': {
                        templateUrl: 'partials/region.header.html',
                        controller: 'RegionDetailsController as ctrl'
                    }
                },
                resolve: {
                    region: function (RegionService, $stateParams) {
                        if ($stateParams.regionSlug == '-') {
                            return {};
                        }
                        return RegionService.getPagesByRegion($stateParams.regionSlug, $stateParams.environment).then(function (response) {
                            return response.data;
                        });
                    }
                },
                ncyBreadcrumb: {
                    skip: true // Never display this state in breadcrumb.
                }
            })
            .state('regionPublish', {
                url: '/publish',
                parent: 'regionDetails',
                onEnter: function ($stateParams, $state, $uibModal) {
                    $uibModal.open({
                        templateUrl: 'partials/region.publish.html',
                        windowTemplateUrl: 'partials/directives/window.html',
                        backdrop: 'static',
                        resolve: {
                            region: (RegionService, $stateParams) => RegionService.getPagesByRegion(
                                $stateParams.regionSlug, $stateParams.environment).then((response) => response.data)
                        },
                        controller: 'RegionPublishController as ctrl'
                    }).result.finally(() => {
                        $state.go('^');
                    });
                }
            })
            .state('pageCreate', {
                url: '/create',
                parent: 'regionDetails',
                views: {
                    'main@': {
                        templateUrl: 'partials/page.create.html',
                        controller: 'PageCreateController as ctrl'
                    }
                },
                resolve: {
                    simpleRegions: function (RegionService) {
                        return RegionService.getSimpleRegions().then(function (response) {
                            return response.data;
                        });
                    },
                }
            })
            .state('pageDetails', {
                url: '/:pageSlug',
                parent: 'regionDetails',
                views: {
                    'pageDetails': {
                        templateUrl: 'partials/page.details.html',
                        controller: 'PageDetailsController as ctrl'
                    }
                },
                resolve: {
                    page: function (PageService, $stateParams) {
                        return PageService.getPage($stateParams.pageSlug, $stateParams.environment).then(function (response) {
                            var page = response.data;
                            if (page) {
                                page.newSlug = page.slug;
                            }
                            return page;
                        });
                    }
                },
                ncyBreadcrumb: {
                    skip: true // Never display this state in breadcrumb.
                }
            })
            .state('pageUpdate', {
                url: '/update',
                parent: 'pageDetails',
                views: {
                    'main@': {
                        templateUrl: 'partials/page.update.html',
                        controller: 'PageUpdateController as ctrl'
                    }
                },
                resolve: {
                    simpleRegions: function (RegionService) {
                        return RegionService.getSimpleRegions().then(function (response) {
                            return response.data;
                        });
                    },
                    countries: function (RegionService) {
                        return RegionService.getCountries().then(function (response) {
                            return response.data;
                        });
                    }
                },
                ncyBreadcrumb: {
                    skip: true // Never display this state in breadcrumb.
                }
            })
            .state('pageDelete', {
                url: '/delete',
                parent: 'pageDetails',
                onEnter: function ($stateParams, $state, $uibModal) {
                    $uibModal.open({
                        templateUrl: 'partials/page.delete.html',
                        windowTemplateUrl: 'partials/directives/window.html',
                        backdrop: 'static',
                        resolve: {
                            page: function (PageService, $stateParams) {
                                return PageService.getPage($stateParams.pageSlug, $stateParams.environment).then(function (response) {
                                    var page = response.data;
                                    page.newSlug = page.slug;
                                    return page;
                                });
                            }
                        },
                        controller: 'PageDeleteController as ctrl'
                    }).result.finally(function () {
                        $state.go('^');
                    });
                }
            })
            .state('pagePublish', {
                url: '/publish',
                parent: 'pageDetails',
                onEnter: function ($stateParams, $state, $uibModal) {
                    $uibModal.open({
                        templateUrl: 'partials/page.publish.html',
                        windowTemplateUrl: 'partials/directives/window.html',
                        backdrop: 'static',
                        resolve: {
                            page: function (PageService, $stateParams) {
                                return PageService.getPage($stateParams.pageSlug, $stateParams.environment).then(function (response) {
                                    var page = response.data;
                                    page.newSlug = page.slug;
                                    return page;
                                });
                            }
                        },
                        controller: 'PagePublishController as ctrl'
                    }).result.finally(function () {
                        $state.go('^');
                    });
                }
            })
            .state('pagePreview', {
                url: '/preview/:languageCode',
                parent: 'pageDetails',
                views: {
                    'main@': {
                        templateUrl: 'partials/page.preview.html',
                        controller: 'PagePreviewController as ctrl'
                    },
                    'languageChoice@': {
                        templateUrl: 'partials/page.language.html',
                        controller: 'PagePreviewController as ctrl'
                    }
                },
                resolve: {
                    page: function (PageService, $stateParams) {
                        return PageService.getPageContent($stateParams.pageSlug, $stateParams.languageCode, $stateParams.environment)
                            .then(function (response) {
                                return response.data;
                            });
                    }
                },
                ncyBreadcrumb: {
                    skip: true // Never display this state in breadcrumb.
                }
            })
            .state('pageCompare', {
                url: '/compare',
                parent: 'pageDetails',
                views: {
                    'main@': {
                        templateUrl: 'partials/page.compare.html',
                        controller: 'PageCompareController as ctrl'
                    },
                    'languageChoice@': {
                        templateUrl: 'partials/page.language.html',
                        controller: 'PageCompareController as ctrl'
                    }
                },
                resolve: {
                    differences: (PageService, $stateParams) => {
                        return PageService.comparePage($stateParams.pageSlug).then((response) => response.data);
                    }
                },
                ncyBreadcrumb: {
                    skip: true // Never display this state in breadcrumb.
                }
            })
            .state('regionPreview', {
                url: '/preview/:languageCode',
                parent: 'regionDetails',
                views: {
                    'main@': {
                        templateUrl: 'partials/region.preview.html',
                        controller: 'RegionPreviewController as ctrl'
                    },
                    'languageChoice@': {
                        templateUrl: 'partials/region.language.html',
                        controller: 'RegionPreviewController as ctrl'
                    }
                },
                resolve: {
                    region: function (RegionService, $stateParams) {
                        return RegionService.getRegionContent(
                            $stateParams.regionSlug,
                            $stateParams.environment,
                            $stateParams.languageCode
                        ).then(function (response) {
                            return response.data;
                        });
                    }
                },
                ncyBreadcrumb: {
                    skip: true // Never display this state in breadcrumb.
                }
            })
        ;
    });
