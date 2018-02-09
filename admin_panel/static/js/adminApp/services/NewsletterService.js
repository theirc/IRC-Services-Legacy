angular.module('adminApp').factory('NewsletterService', function ($http, apiUrl) {
    return {
        getNewsletterHtmls: (type) => {
            return $http({
                method: 'GET',
                url: apiUrl + '/v2/newsletter-htmls?type=' + type,
            });
        },
    };
});
