angular.module('adminApp').factory('AnalyticsService', function ($http, apiUrl) {
    return {
        getContentAnalytics: (startDate, endDate) => {
            return $http({
                method: 'GET',
                url: apiUrl + '/v2/analytics/content/?updated_at=' + startDate + '&end_date=' + endDate
            });
        },
        getOutdatedContent: () => {
            return $http({
                method: 'GET',
                url: apiUrl + '/v2/analytics/content/outdated/'
            });
        },
        getMerakiStats: (startDate, endDate, networkId) => {
            return $http({
                method: 'GET',
                url: apiUrl + '/v2/meraki-stats/?date=' + startDate + '&end_date=' + endDate + '&network_id=' + networkId
            });
        },
        getMerakiDevices: () => {
            return $http({
                method: 'GET',
                url: apiUrl + '/v2/meraki-devices/'
            });
        },
        getMerakiNetworks: () => {
            return $http({
                method: 'GET',
                url: apiUrl + '/v2/meraki-networks/'
            });
        },
        getMerakiApps: (startDate, endDate, networkId) => {
            return $http({
                method: 'GET',
                url: apiUrl + '/v2/meraki-apps/?date=' + startDate + '&end_date=' + endDate + '&network_id=' + networkId
            });
        }
    };
});
