angular.module('adminApp')
    .filter('formatDate', function () {
        return function (date, locale) {
            if (locale) {
                moment.locale(locale);
            }

            return moment(date).format('LLL');
        }
    })
    .filter('escape', function () {
        return window.encodeURIComponent;
    })
    .filter('formatTime', function () {
        return function (time, locale) {
            if (locale) {
                moment.locale(locale);
            }

            return moment(time, 'HH:mm:ss').format('hh:mm A');
        }
    });

