// let csrftoken = sessionStorage.getItem("csrf");
// csrftoken = document.cookie.match(new RegExp('(^| )' + 'csrftoken' + '=([^;]+)'))[2];
// let headers = {"Content-Type": "application/json", 'X-CSRFToken': csrftoken};
// let body = JSON.stringify({username, password});

// return fetch("/login", {headers, body, method: "POST"})
// 		.then(res => {
// 				if (res.status < 500) {
// 						window.res = res;
// 						console.log(res.data);
// 						return res.json().then(data => {
// 								return {status: res.status, data};
// 						})
// 				} else {
// 						console.log("Server Error!");
// 						throw res;
// 				}
// 		})
// 		.then(res => {
// 		if (res.status === 200) {
// 				console.log("Success");
// 				console.log(res.data);
// 				window.res = res;
// 				return res.data;
// 		} else if (res.status === 403 || res.status === 401) {
// 				console.log("Error");
// 				throw res.data;
// 		} else {
// 				console.log("Failed");
// 				throw res.data;
// 		}
// 		})
// }

!api && (api = {});
api.providerTypes = {
	get: () => console.log('api.providerTypes.get()')
};

export default api;
