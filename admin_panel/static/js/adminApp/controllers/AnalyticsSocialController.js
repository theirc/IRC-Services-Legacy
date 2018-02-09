angular.module('adminApp')
    .controller('AnalyticsSocialController', function (DTColumnDefBuilder, DTOptionsBuilder, moment, tableUtils, datepickerRanges, datePickerBoundries, $q, PageFansService, PageViewsService, PageEngagementService, ConversationsStatsService, PostStatsService, AdsStatsService) {

        let splitOptions = {
            scales: {
                yAxes: [
                    {
                        id: 'y-axis-1',
                        type: 'linear',
                        display: true,
                        position: 'left'
                    },
                    {
                        id: 'y-axis-2',
                        type: 'linear',
                        display: false,
                        position: 'right'
                    }
                ]
            },
            legend: {display: true}
        };

        let vm = this;

        vm.columnDescription = {
            'Spend': 'The estimated total amount of money you\'ve spent on your campaign, ad set or ad during its schedule.',
            'Reach': 'The number of people who saw your ads at least once. Reach is different from impressions,' +
                     'which may include multiple views of your ads by the same people.',
            'Clicks': 'The number of clicks on your ads.',
            'Impressions': 'The number of times your ads were viewed.',
            'Cost/Action': 'The average cost of a relevant action.',
            'CPM': 'The average cost for 1,000 impressions.',
            'CPC': 'The average cost for each click.',
            'CPP': 'The average cost to reach 1,000 people.',
            'CTR': 'The percentage of times people saw your ad and performed a click.',
            'Recall Rate': 'The rate at which an estimated number of additional people, when asked, would remember seeing your ads within 2 days.'
        }

        vm.$onInit = () => {
            vm.postStats = [];
            vm.adsStats = [];
            vm.datePicker = datepickerRanges;
            vm.datePickerBoundries = datePickerBoundries;
            vm.datePicker.options = {
                ranges: {
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                    'Last 30 Days': [moment().subtract(29, 'days'), moment()]
                },
                eventHandlers: {
                    'apply.daterangepicker': function (ev, picker) {
                        if (typeof ev.model.endDate != 'string') {
                            vm.datePicker.endDate = ev.model.endDate.format('YYYY-MM-DD');
                        }
                        if (typeof ev.model.startDate != 'string') {
                            vm.datePicker.startDate = ev.model.startDate.format('YYYY-MM-DD');
                        }
                        vm.watcher();
                    }
                },
                opens: 'center'
            };
            vm.watcher();
        };

        vm.currentPage = 0;
        vm.pageSize = 10;
        vm.currentPageLang = 0;
        vm.pageSizeLang = 10;

        vm.numberOfPages = (data) => {
            if (data) {
                return Math.ceil(data.length/vm.pageSize);
            }
            else {
                return 0;
            }
        }

        let totalByDate = (data, f) => _.sortBy(
            _.map(
                _.groupBy(data, (g) => moment.tz(g.date, 'utc').utc().format('YYYY-MM-DD'))
                , (v, k) => [k, _.sumBy(v, f)]
            ),
            (i) => i[0]);

        vm.watcher = () => {

            let enumerateDays = (startDate, endDate) => {
                let currDate = startDate.startOf('day');
                let lastDate = endDate.startOf('day');

                let dates = [currDate.format('YYYY-MM-DD')];

                while (currDate.add(1, 'days').diff(lastDate) < 0) {
                    dates.push(currDate.format('YYYY-MM-DD'));
                }

                return dates;
            };

            let days = enumerateDays(moment(vm.datePicker.startDate), moment(vm.datePicker.endDate));

            vm.dtColumns = [
                DTColumnDefBuilder.newColumnDef(0),
                DTColumnDefBuilder.newColumnDef(1),
                DTColumnDefBuilder.newColumnDef(2),
                DTColumnDefBuilder.newColumnDef(3),
                DTColumnDefBuilder.newColumnDef(4),
                DTColumnDefBuilder.newColumnDef(5),
                DTColumnDefBuilder.newColumnDef(6),
                DTColumnDefBuilder.newColumnDef(7),
            ];
            vm.dtOptions = DTOptionsBuilder.newOptions().withPaginationType('full_numbers');

            vm.dtCountryColumns = [];
            vm.dtCountryOptions = DTOptionsBuilder.newOptions().withPaginationType('full_numbers');

            vm.dtColumnsAds = [
                DTColumnDefBuilder.newColumnDef(0),
                DTColumnDefBuilder.newColumnDef(1),
                DTColumnDefBuilder.newColumnDef(2),
                DTColumnDefBuilder.newColumnDef(3),
                DTColumnDefBuilder.newColumnDef(4),
                DTColumnDefBuilder.newColumnDef(5),
                DTColumnDefBuilder.newColumnDef(6),
                DTColumnDefBuilder.newColumnDef(7),
                DTColumnDefBuilder.newColumnDef(8),
                DTColumnDefBuilder.newColumnDef(9),
                DTColumnDefBuilder.newColumnDef(10),
                DTColumnDefBuilder.newColumnDef(11),
                DTColumnDefBuilder.newColumnDef(12),
                DTColumnDefBuilder.newColumnDef(13)
            ];
            vm.dtOptionsAds = DTOptionsBuilder.newOptions().withPaginationType('full_numbers');

            $q.all([
                    PageFansService.getList({
                        date: vm.datePicker.startDate,
                        end_date: vm.datePicker.endDate
                    }),
                    PageViewsService.getList({
                        date: vm.datePicker.startDate,
                        end_date: vm.datePicker.endDate
                    }),
                    PageEngagementService.getList({
                        date: vm.datePicker.startDate,
                        end_date: vm.datePicker.endDate
                    }),
                    ConversationsStatsService.getList({
                        date: vm.datePicker.startDate,
                        end_date: vm.datePicker.endDate
                    }),
                    PostStatsService.getList({
                        date: vm.datePicker.startDate,
                        end_date: vm.datePicker.endDate
                    }),
                    AdsStatsService.getList({
                        date: vm.datePicker.startDate,
                        end_date: vm.datePicker.endDate
                    })
                ])
                .then((results)=> {
                    let pageFans = results[0],
                        pageViews = results[1],
                        pageEngagement = results[2],
                        conversations = results[3];
                    vm.postStats = results[4];
                    vm.adsStats = results[5];

                    //page fans

                    let totalFans = totalByDate(pageFans, b=>b.total).map(g=>g[1]);

                    let newFans = totalByDate(pageFans, b=>b.adds).map(g=>g[1]);
                    let removeFans = totalByDate(pageFans, b=>b.removes).map(g=>g[1]);
                    vm.totalNewFans = newFans.reduce((a, b) => a + b, 0);

                    let totalFansByCountry = totalByDate(pageFans, b=>b.by_country).map(g=>g[1]);
                    let countryKeys = [];
                    for (let keysC of totalFansByCountry) {
                        if (keysC && Object.keys(keysC).length != 0) {
                            countryKeys = Object.keys(keysC).sort();
                        }
                    }

                    let totalFansByCountryChartData = [];

                    for (let key of countryKeys) {
                        let fansByCountryByDate = [];
                        for (let d of totalFansByCountry) {
                            if (d[key]) {
                                fansByCountryByDate.push(d[key]);
                            }
                            else {
                                fansByCountryByDate.push(0);
                            }
                        }
                        totalFansByCountryChartData.push(fansByCountryByDate);
                    }

                    vm.totalFansByCountryTableHeadersData = ['Country'].concat(days);
                    vm.totalFansByCountryTableData = [];
                    for (let key of countryKeys) {
                        let fansByCountryByDate = {"country": key};
                        let index = 0;
                        for (let d of totalFansByCountry) {
                            if (d[key]) {
                                fansByCountryByDate[days[index]] = d[key];
                            }
                            else {
                                fansByCountryByDate[days[index]] = 0;
                            }
                            index += 1;
                        }
                        vm.totalFansByCountryTableData.push(fansByCountryByDate);
                    }

                    let totalFansByLanguage = totalByDate(pageFans, b=>b.by_language).map(g=>g[1]);

                    let languageKeys = [];
                    for (let keysL of totalFansByLanguage) {
                        if (keysL && Object.keys(keysL).length != 0) {
                            languageKeys = Object.keys(keysL).sort();
                        }
                    }
                    let totalFansByLanguageChartData = [];

                    for (let key of languageKeys) {
                        let fansByLanguageByDate = [];
                        for (let d of totalFansByLanguage) {
                            if (d[key]) {
                                fansByLanguageByDate.push(d[key]);
                            }
                            else {
                                fansByLanguageByDate.push(0);
                            }
                        }
                        totalFansByLanguageChartData.push(fansByLanguageByDate);
                    }

                    vm.totalFansByLanguageTableHeadersData = ['Language'].concat(days);
                    vm.totalFansByLanguageTableData = [];
                    for (let key of languageKeys) {
                        let fansByLanguageByDate = {"language": key};
                        let index = 0;
                        for (let d of totalFansByLanguage) {
                            if (d[key]) {
                                fansByLanguageByDate[days[index]] = d[key];
                            }
                            else {
                                fansByLanguageByDate[days[index]] = 0;
                            }
                            index += 1;
                        }
                        vm.totalFansByLanguageTableData.push(fansByLanguageByDate);
                    }

                    let maleByAge = {
                        '13-17': totalByDate(pageFans, b=>b.male_13_17).map(g=>g[1]),
                        '18-24': totalByDate(pageFans, b=>b.male_18_24).map(g=>g[1]),
                        '25-34': totalByDate(pageFans, b=>b.male_25_34).map(g=>g[1]),
                        '35-44': totalByDate(pageFans, b=>b.male_35_44).map(g=>g[1]),
                        '45-54': totalByDate(pageFans, b=>b.male_45_54).map(g=>g[1]),
                        '55-64': totalByDate(pageFans, b=>b.male_55_64).map(g=>g[1]),
                        '65+': totalByDate(pageFans, b=>b.male_65).map(g=>g[1]),
                    };

                    let femaleByAge = {
                        '13-17': totalByDate(pageFans, b=>b.female_13_17).map(g=>g[1]),
                        '18-24': totalByDate(pageFans, b=>b.female_18_24).map(g=>g[1]),
                        '25-34': totalByDate(pageFans, b=>b.female_25_34).map(g=>g[1]),
                        '35-44': totalByDate(pageFans, b=>b.female_35_44).map(g=>g[1]),
                        '45-54': totalByDate(pageFans, b=>b.female_45_54).map(g=>g[1]),
                        '55-64': totalByDate(pageFans, b=>b.female_55_64).map(g=>g[1]),
                        '65+': totalByDate(pageFans, b=>b.female_65).map(g=>g[1]),
                    };

                    let otherByAge = {
                        '13-17': totalByDate(pageFans, b=>b.other_13_17).map(g=>g[1]),
                        '18-24': totalByDate(pageFans, b=>b.other_18_24).map(g=>g[1]),
                        '25-34': totalByDate(pageFans, b=>b.other_25_34).map(g=>g[1]),
                        '35-44': totalByDate(pageFans, b=>b.other_35_44).map(g=>g[1]),
                        '45-54': totalByDate(pageFans, b=>b.other_45_54).map(g=>g[1]),
                        '55-64': totalByDate(pageFans, b=>b.other_55_64).map(g=>g[1]),
                        '65+': totalByDate(pageFans, b=>b.male_65).map(g=>g[1]),
                    };
                    let ageKeys = Object.keys(maleByAge);

                    //page views
                    let totalPageViews = totalByDate(pageViews, b=>b.page_views).map(g=>g[1]);
                    vm.totalViews = totalPageViews.reduce((a, b) => a + b, 0);

                    let totalVideoShortViews = totalByDate(pageViews, b=>b.video_views_short).map(g=>g[1]);
                    let totalVideoLongViews = totalByDate(pageViews, b=>b.video_views_long).map(g=>g[1]);

                    //page engagement
                    let engagedUsers = totalByDate(pageEngagement, b=>b.engaged_users).map(g=>g[1]);
                    let totalConsumptions = totalByDate(pageEngagement, b=>b.consumptions).map(g=>g[1]);

                    let totalConsumptionsByType = {
                        'Video Play': totalByDate(pageEngagement, b=>b.video_play).map(g=>g[1]),
                        'Photo View': totalByDate(pageEngagement, b=>b.photo_view).map(g=>g[1]),
                        'Other Clicks': totalByDate(pageEngagement, b=>b.other_clicks).map(g=>g[1]),
                        'Link Clicks': totalByDate(pageEngagement, b=>b.link_clicks).map(g=>g[1])
                    };
                    let totalConsumptionsByTypeKeys = Object.keys(totalConsumptionsByType);

                    let negativeFeedback = totalByDate(pageEngagement, b=>b.negative).map(g=>g[1]);

                    let positiveFeedbackByType = {
                        'Like': totalByDate(pageEngagement, b=>b.like).map(g=>g[1]),
                        'Comment': totalByDate(pageEngagement, b=>b.comment).map(g=>g[1]),
                        'Link': totalByDate(pageEngagement, b=>b.link).map(g=>g[1]),
                        'Answer': totalByDate(pageEngagement, b=>b.answer).map(g=>g[1]),
                        'Claim': totalByDate(pageEngagement, b=>b.claim).map(g=>g[1]),
                        'Respond to an event': totalByDate(pageEngagement, b=>b.rsvp).map(g=>g[1])
                    };
                    let positiveFeedbackKeys = Object.keys(positiveFeedbackByType);

                    let negativeFeedbackByType = {
                        'Hide Clicks': totalByDate(pageEngagement, b=>b.hide_clicks).map(g=>g[1]),
                        'Report Spam Clicks': totalByDate(pageEngagement, b=>b.report_spam_clicks).map(g=>g[1]),
                        'Unlike Page Clicks': totalByDate(pageEngagement, b=>b.unlike_page_clicks).map(g=>g[1])
                    };
                    let negativeFeedbackKeys = Object.keys(negativeFeedbackByType);

                    vm.totalFansByCountryChart = {
                        series: countryKeys,
                        labels: days,
                        data: totalFansByCountryChartData,
                        options: _.cloneDeep(splitOptions),
                        datasetOverride: _.range(totalFans.length + 1)
                            .map(()=> ({
                                yAxisID: 'y-axis-1',
                                fill: false
                            }))
                            .concat({
                                yAxisID: 'y-axis-2',
                                fill: false,
                                showLine: false,
                                pointBackgroundColor: 'rgba(59,89,152,0.4)',
                                pointStyle: 'triangle',
                                pointRadius: 7
                            })
                    };

                    vm.totalFansByLanguageChart = {
                        series: languageKeys,
                        labels: days,
                        data: totalFansByLanguageChartData,
                        options: _.cloneDeep(splitOptions),
                        datasetOverride: _.range(totalFans.length + 1)
                            .map(()=> ({
                                yAxisID: 'y-axis-1',
                                fill: false
                            }))
                            .concat({
                                yAxisID: 'y-axis-2',
                                fill: false,
                                showLine: false,
                                pointBackgroundColor: 'rgba(59,89,152,0.4)',
                                pointStyle: 'triangle',
                                pointRadius: 7
                            })
                    };

                    let getObjectValues = (object, keys) => {
                        let result = [];
                        for (let key of keys) {
                            result.push(object[key]);
                        }
                        return result;
                    }

                    vm.femaleByAgeChart = {
                        series: ageKeys,
                        labels: days,
                        data: getObjectValues(femaleByAge, ageKeys),
                        options: _.cloneDeep(splitOptions),
                        datasetOverride: _.range(totalFans.length + 1)
                            .map(()=> ({
                                yAxisID: 'y-axis-1',
                                fill: false
                            }))
                            .concat({
                                yAxisID: 'y-axis-2',
                                fill: false,
                                showLine: false,
                                pointBackgroundColor: 'rgba(59,89,152,0.4)',
                                pointStyle: 'triangle',
                                pointRadius: 7
                            })
                    };

                    vm.maleByAgeChart = {
                        series: ageKeys,
                        labels: days,
                        data: getObjectValues(maleByAge, ageKeys),
                        options: _.cloneDeep(splitOptions),
                        datasetOverride: _.range(totalFans.length + 1)
                            .map(()=> ({
                                yAxisID: 'y-axis-1',
                                fill: false
                            }))
                            .concat({
                                yAxisID: 'y-axis-2',
                                fill: false,
                                showLine: false,
                                pointBackgroundColor: 'rgba(59,89,152,0.4)',
                                pointStyle: 'triangle',
                                pointRadius: 7
                            })
                    };

                    vm.totalAddsRemovesChart = {
                        series: ['Fan Adds', 'Fan Removes'],
                        labels: days,
                        data: [newFans, removeFans],
                        options: _.cloneDeep(splitOptions),
                        datasetOverride: _.range(newFans.length + 1)
                            .map(()=> ({
                                yAxisID: 'y-axis-1',
                                fill: false
                            }))
                            .concat({
                                yAxisID: 'y-axis-2',
                                fill: false,
                                showLine: false,
                                pointBackgroundColor: 'rgba(59,89,152,0.4)',
                                pointStyle: 'triangle',
                                pointRadius: 7
                            })
                    };

                    vm.totalViewsChart = {
                        series: ['Total page views', 'Video views longer than 3s', 'Video views longer than 30s'],
                        labels: days,
                        data: [totalPageViews, totalVideoShortViews, totalVideoLongViews],
                        options: _.cloneDeep(splitOptions),
                        datasetOverride: _.range(totalPageViews.length + 1)
                            .map(()=> ({
                                yAxisID: 'y-axis-1',
                                fill: false
                            }))
                            .concat({
                                yAxisID: 'y-axis-2',
                                fill: false,
                                showLine: false,
                                pointBackgroundColor: 'rgba(59,89,152,0.4)',
                                pointStyle: 'triangle',
                                pointRadius: 7
                            })

                    };

                    vm.userEngagementChart = {
                        series: ['Engaged Users', 'Consumption'],
                        labels: days,
                        data: [engagedUsers, totalConsumptions],
                        options: _.cloneDeep(splitOptions),
                        datasetOverride: _.range(engagedUsers.length + 1)
                            .map(()=> ({
                                yAxisID: 'y-axis-1',
                                fill: false
                            }))
                            .concat({
                                yAxisID: 'y-axis-2',
                                fill: false,
                                showLine: false,
                                pointBackgroundColor: 'rgba(59,89,152,0.4)',
                                pointStyle: 'triangle',
                                pointRadius: 7
                            })
                    };

                    vm.totalConsumptionsByTypeChart = {
                        series: totalConsumptionsByTypeKeys,
                        labels: days,
                        data: getObjectValues(totalConsumptionsByType, totalConsumptionsByTypeKeys),
                        options: _.cloneDeep(splitOptions),
                        datasetOverride: _.range(engagedUsers.length + 1)
                            .map(()=> ({
                                yAxisID: 'y-axis-1',
                                fill: false
                            }))
                            .concat({
                                yAxisID: 'y-axis-2',
                                fill: false,
                                showLine: false,
                                pointBackgroundColor: 'rgba(59,89,152,0.4)',
                                pointStyle: 'triangle',
                                pointRadius: 7
                            })

                    };

                    vm.totalPositiveFeedbackChart = {
                        series: positiveFeedbackKeys,
                        labels: days,
                        data: getObjectValues(positiveFeedbackByType, positiveFeedbackKeys),
                        options: _.cloneDeep(splitOptions),
                        datasetOverride: _.range(negativeFeedback.length + 1)
                            .map(()=> ({
                                yAxisID: 'y-axis-1',
                                fill: false
                            }))
                            .concat({
                                yAxisID: 'y-axis-2',
                                fill: false,
                                showLine: false,
                                pointBackgroundColor: 'rgba(59,89,152,0.4)',
                                pointStyle: 'triangle',
                                pointRadius: 7
                            })
                    };

                    vm.totalNegativeFeedbackChart = {
                        series: negativeFeedbackKeys,
                        labels: days,
                        data: getObjectValues(negativeFeedbackByType, negativeFeedbackKeys),
                        options: _.cloneDeep(splitOptions),
                        datasetOverride: _.range(negativeFeedback.length + 1)
                            .map(()=> ({
                                yAxisID: 'y-axis-1',
                                fill: false
                            }))
                            .concat({
                                yAxisID: 'y-axis-2',
                                fill: false,
                                showLine: false,
                                pointBackgroundColor: 'rgba(59,89,152,0.4)',
                                pointStyle: 'triangle',
                                pointRadius: 7
                            })

                    };

                    let responded = conversations.filter((conversation) => conversation.participants_count == 2).length;
                    let notResponded = conversations.filter((conversation) => conversation.participants_count == 1).length;

                    vm.chartData = [responded, notResponded];
                    vm.chartLabels = ['Conversations responded', 'Conversations not responded']
                    vm.chartOptions = {
                        legend: {
                            display: true
                        }
                    };

                    let sumTotalLikes = (data) => {
                        let result = 0;
                        for (let key in data) {
                            result += data[key][data[key].length - 1];
                        }
                        return result;
                    };

                    vm.chartLikesData = [sumTotalLikes(femaleByAge), sumTotalLikes(maleByAge), sumTotalLikes(otherByAge)];
                    vm.chartLikesLabels = ['Females', 'Males', 'Unspecified']
                });
        };

    });
