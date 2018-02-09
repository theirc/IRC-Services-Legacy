angular.module('adminApp').controller('NewsletterSettingsController', function ($sce, $scope, settings, staticUrl, Restangular, NewsletterService) {
    var vm = this;
    vm.settings = settings.plain().reduce((map, obj) => {
        map[obj.id] = obj;
        return map;
    }, {});
    vm.SERVICE_BASE = 'service_base';
    vm.SERVICE_CONFIRMATION = 'service_confirmation';
    vm.SERVICE_REMINDER = 'service_reminder';
    vm.SERVICE_THANKS = 'service_thanks';
    vm.newsletterTypes = [vm.SERVICE_BASE, vm.SERVICE_CONFIRMATION, vm.SERVICE_REMINDER, vm.SERVICE_THANKS];
    vm.headerTitles = {
        [vm.SERVICE_BASE]: 'Base for emails (header + footer)',
        [vm.SERVICE_CONFIRMATION]: 'Confirmation email',
        [vm.SERVICE_REMINDER]: 'Reminder email',
        [vm.SERVICE_THANKS]: 'Thanks email'
    };
    vm.newsletterlHtmls = {};

    vm.$onInit = () => {
        vm.updateAllNewsletters();
    };

    vm.save = (newsletterType) => {
        let s = Object.keys(vm.settings).map(x => vm.settings[x]).filter(x => x.type === newsletterType);
        s.forEach(x => {
            Restangular.one('settings', x.id).customPUT(x);
        });
        if (newsletterType === vm.SERVICE_BASE) {
            vm.updateAllNewsletters();
        }
    };

    vm.reset = (newsletterType) => {
        let s = Object.keys(vm.settings).map(x => vm.settings[x]).filter(x => x.type === newsletterType);
        s.forEach(x => {
            Restangular.one('settings', x.id).get().then((setting) => {
                vm.settings[setting.id].value = setting.value; 
            });
        });
    };

    vm.updateNewsletterHtml = (type) => {
        NewsletterService.getNewsletterHtmls(type).then((response) => {
            let data = response.data.replace(/newsletter_setting_([0-9]*)'/g, '\' ck-inline contenteditable="true" ng-model="ctrl.settings[$1].value"');
            vm.newsletterlHtmls[type] = data;
        });
    };

    vm.updateAllNewsletters = () => {
        vm.newsletterTypes.forEach((type) => {
            vm.updateNewsletterHtml((type));
        });
    };

    vm.getHeaderTitle = (newsletterType) => {
        return vm.headerTitles[newsletterType] || '';
    };
});
