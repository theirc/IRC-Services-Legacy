let api = api || {};

let csrftoken = sessionStorage.getItem("csrf");
csrftoken = document.cookie.match(new RegExp('(^| )' + 'csrftoken' + '=([^;]+)'))[2];
let token = '4c9a2838d5a705c37bafbe4ac74d7846547755f6';
let headers = {
	"Content-Type": "application/json",
	'X-CSRFToken': csrftoken,
	'Accept': 'application/json',
	'ServiceInfoAuthorization': 'token ' + token,
	'X-Requested-With': 'XMLHttpRequest' // for security reasons
};

let url = '/api/provider-types/?ordering=id&page=1&page_size=10';
api.providerTypes = {
	getAll: () => {
		return fetch(`${url}`,
			{headers}
		)
			.then(r => r.json())
			.then(console.log);
	}
};

export default api;
