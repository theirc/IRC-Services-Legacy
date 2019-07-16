import composeHeader from '../../data/Helpers/headers';
import store from '../../shared/store';

let api = api || {};

api.regions = {
	getAll: () => {
		const url = '/api/regions/?exclude_geometry=true';
		let {login} = store.getState();
		
		if(!login.user) return [];
		
		let headers = composeHeader(login.csrfToken, login.user.token);
		
		return fetch(`${url}`, {headers}).then(r => r.json());
	},
	getOne: (id) => {
		const url = `/api/regions/${id}/`;
		let {login} = store.getState();

		if(!login.user) return [];

		let headers = composeHeader(login.csrfToken, login.user.token);

		return fetch(`${url}`, {headers}).then(r => r.json());
	},
	listAll: () => {
		const url = '/api/list-regions/';
		let {login} = store.getState();
		
		if(!login.user) return [];
		
		let headers = composeHeader(login.csrfToken, login.user.token);
		
		return fetch(`${url}`, {headers}).then(r => r.json());
	},
};

export default api;
