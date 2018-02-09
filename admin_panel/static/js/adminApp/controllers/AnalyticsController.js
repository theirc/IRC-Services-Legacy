angular
	.module("adminApp")
	.controller("AnalyticsController", function() {
		var vm = this;
		vm.HIDE_NOT_YET_IMPLEMENTED = true;
	})
	.controller("AnalyticsVisitorsController", function($scope, WebStatsService, PostService, $timeout, EventStatsService, $q, moment, datepickerRanges, datePickerBoundries, $window) {
		let splitOptions = {
			scales: {
				yAxes: [
					{
						id: "y-axis-1",
						type: "linear",
						display: true,
						position: "left",
					},
					{
						id: "y-axis-2",
						type: "linear",
						display: false,
						position: "right",
					},
				],
			},
		};

		var vm = this;

		vm.$onInit = function() {
			vm.datePicker = datepickerRanges;
			vm.datePickerBoundries = datePickerBoundries;
			vm.datePicker.options = {
				ranges: {
					"Last 7 Days": [moment().subtract(6, "days"), moment()],
					"Last 30 Days": [moment().subtract(29, "days"), moment()],
				},
				eventHandlers: {
					"apply.daterangepicker": function(ev, picker) {
						if (typeof ev.model.endDate != "string") {
							vm.datePicker.endDate = ev.model.endDate.format("YYYY-MM-DD");
						}
						if (typeof ev.model.startDate != "string") {
							vm.datePicker.startDate = ev.model.startDate.format("YYYY-MM-DD");
						}
						vm.watcher();
					},
				},
				opens: "center",
			};

			vm.viewId = "109693532";

			vm.allViews = [];
			vm.watcher();
		};

		vm.exportAsCsv = function(header, data) {
			var encodedUri = encodeURI("data:text/csv;charset=utf-8," + [header.map(a => `\"${a}\"`).join(",")].concat(data.map(b => b.map(a => `\"${a}\"`).join(","))).join("\n"));

			window.open(encodedUri);
		};

		var totalByDate = (data, f) =>
			_.sortBy(
				_.map(
					_.groupBy(data, g =>
						moment
							.tz(g.date, "utc")
							.utc()
							.format("YYYY-MM-DD")
					),
					(v, k) => [k, _.sumBy(v, f)]
				),
				i => i[0]
			);

		var groupByDateAndKey = (data, key, value, defaults) =>
			_.map(_.groupBy(data, key), (v, k) => [
				k,
				_.sortBy(
					_.toPairs(
						_.extend(
							_.clone(defaults || {}),
							_.fromPairs(
								_.map(
									_.groupBy(v, g =>
										moment
											.tz(g.date, "utc")
											.utc()
											.format("YYYY-MM-DD")
									),
									(v1, k1) => [k1, _.sumBy(v1, value)]
								).filter(o => o[0] in defaults)
							)
						)
					),
					i => i[0]
				),
			]);

		vm.watcher = () => {
			let enumerateDays = (startDate, endDate) => {
				let dates = [];

				let currDate = startDate.startOf("day");
				let lastDate = endDate.startOf("day");

				while (currDate.add(1, "days").diff(lastDate) < 0) {
					dates.push(currDate.format("YYYY-MM-DD"));
				}

				return dates;
			};

			let days = enumerateDays(moment(vm.datePicker.startDate), moment(vm.datePicker.endDate));
			let defs = _.fromPairs(_.map(days, g => [g, 0]));

			$q
				.all([
					WebStatsService.getList({
						date: vm.datePicker.startDate,
						end_date: vm.datePicker.endDate,
						view_id: vm.viewId,
					}),
					PostService.getList({
						date: vm.datePicker.startDate,
						end_date: vm.datePicker.endDate,
					}),
					EventStatsService.getList({
						date: vm.datePicker.startDate,
						end_date: vm.datePicker.endDate,
					}),
				])
				.then(results => {
					let web = results[0],
						posts = results[1],
						events = results[2];

					let totalUsers = totalByDate(web, b => b.users).map(g => g[1]);
					let totalUsersCount = totalUsers.reduce((a, b) => a + b, 0);

					let totalSessions = totalByDate(web, b => b.sessions).map(g => g[1]);
					let totalSessionsCount = totalSessions.reduce((a, b) => a + b, 0);

					let totalPageviews = totalByDate(web, b => b.pageviews).map(g => g[1]);

					let bounceRate = web.map(b => parseFloat(b.bounce_rate));
					let bounceRateAverage = _.sum(bounceRate) / bounceRate.length;

					let pageviewsPerSession = web.map(b => parseFloat(b.pageviews_per_session));
					let pageviewsPerSessionAverage = _.sum(pageviewsPerSession) / pageviewsPerSession.length;

					let sessionDuration = web.map(b => moment.duration(b.avg_session_duration, "HH:mm:ss").asSeconds());
					let sessionDurationAverage = _.sum(sessionDuration) / sessionDuration.length;

					let usersByCountry = groupByDateAndKey(web, g => g.country, b => b.users, defs);
					let sessionsByCountry = groupByDateAndKey(web, g => g.country, b => b.sessions, defs);
					let pageviewsByCountry = groupByDateAndKey(web, g => g.country, b => b.pageviews, defs);

					let usersByLanguage = groupByDateAndKey(web, g => g.language, b => b.users, defs);
					let sessionsByLanguage = groupByDateAndKey(web, g => g.language, b => b.sessions, defs);

					vm.popStats = {
						totalUsersCount,
						totalSessionsCount,
						bounceRateAverage,
						pageviewsPerSessionAverage,
						sessionDurationAverage: moment("1900-01-01 00:00:00")
							.add(sessionDurationAverage, "seconds")
							.format("HH:mm:ss"),
					};

					let p = _.toPairs(_.extend(_.clone(defs), _.fromPairs(_.map(posts, (v, k) => [moment(v.updated).format("YYYY-MM-DD"), 1]))));

					vm.newUsers = {
						series: ["All Countries"].concat(_.map(usersByCountry, g => g[0])).concat(["Facebook Post"]),
						labels: days,
						data: [totalUsers].concat(_.map(usersByCountry, g => _.map(g[1], g1 => g1[1]))).concat([_.map(p, k => k[1])]),
						options: _.cloneDeep(splitOptions),
						datasetOverride: _.range(usersByCountry.length + 1)
							.map(() => ({
								yAxisID: "y-axis-1",
								fill: false,
							}))
							.concat({
								yAxisID: "y-axis-2",
								fill: false,
								showLine: false,
								pointBackgroundColor: "rgba(59,89,152,0.4)",
								pointStyle: "triangle",
								pointRadius: 7,
							}),
					};
					vm.sessions = {
						series: ["All Countries"].concat(_.map(sessionsByCountry, g => g[0])).concat(["Facebook Post"]),
						labels: days,
						data: [totalSessions].concat(_.map(sessionsByCountry, g => _.map(g[1], g1 => g1[1]))).concat([_.map(p, k => k[1])]),
						options: splitOptions,
						datasetOverride: _.range(sessionsByCountry.length + 1)
							.map(() => ({
								yAxisID: "y-axis-1",
								fill: false,
							}))
							.concat({
								yAxisID: "y-axis-2",
								fill: false,
								showLine: false,
								pointBackgroundColor: "rgba(59,89,152,0.4)",
								pointStyle: "triangle",
								pointRadius: 7,
							}),
					};
					vm.pageviews = {
						series: ["All Countries"].concat(_.map(pageviewsByCountry, g => g[0])).concat(["Facebook Post"]),
						labels: days,
						data: [totalPageviews].concat(_.map(pageviewsByCountry, g => _.map(g[1], g1 => g1[1]))).concat([_.map(p, k => k[1])]),
						options: splitOptions,
						datasetOverride: _.range(pageviewsByCountry.length + 1)
							.map(() => ({
								yAxisID: "y-axis-1",
								fill: false,
							}))
							.concat({
								yAxisID: "y-axis-2",
								fill: false,
								showLine: false,
								pointBackgroundColor: "rgba(59,89,152,0.4)",
								pointStyle: "triangle",
								pointRadius: 7,
							}),
					};

					vm.usersByLanguage = {
						series: _.map(usersByLanguage, g => g[0]),
						labels: days,
						data: _.map(usersByLanguage, g => _.map(g[1], g1 => g1[1])),
						datasetOverride: _.range(usersByLanguage.length).map(() => ({
							fill: false,
						})),
					};
					vm.sessionsByLanguage = {
						series: _.map(sessionsByLanguage, g => g[0]),
						labels: days,
						data: _.map(sessionsByLanguage, g => _.map(g[1], g1 => g1[1])),
						datasetOverride: _.range(usersByLanguage.length).map(() => ({
							fill: false,
						})),
					};
				});
		};

		vm.printPage = () => {
			$window.print();
		};
	});
