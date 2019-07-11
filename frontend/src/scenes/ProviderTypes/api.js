import composeHeader from '../../data/Helpers/headers';
import store from '../../shared/store';

let api = api || {};

api.providerTypes = {
	getAll: () => {
		const url = '/api/provider-types/';
		let {login} = store.getState();
		
		if(!login.user) return [];
		
		let headers = composeHeader(login.csrfToken, login.user.token);
		
		return fetch(`${url}`, {headers}).then(r => r.json());
	},
	getOne: (id) => {
		const url = `/api/provider-types/${id}/`;
		let {login} = store.getState();
		
		if(!login.user) return [];

		let headers = composeHeader(login.csrfToken, login.user.token);

		return fetch(`${url}`, {headers}).then(r => r.json());
	},
	saveType: (data) => {
		const url = `https://admin.refugee.info/v2/provider-types/${data.id}/`;
		
		let {login} = store.getState();

		if(!login.user) return [];

		let headers = composeHeader(login.csrfToken, login.user.token);

		return fetch(`${url}`, {method: 'PUT', body: JSON.stringify(data), headers: headers}).then(r => r.json());
	}
};

export default api;
