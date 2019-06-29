import composeHeader from '../../data/Helpers/headers';
import store from '../../shared/store';

let api = api || {};

api.serviceCategories = {
	getAll: () => {
		const url = '/api/service-types/';
		let {login} = store.getState();
		
		if(!login.user) return [];
		
		let headers = composeHeader(login.csrfToken, login.user.token);
		
		return fetch(`${url}`, {headers}).then(r => r.json());
	},
	getOne: (id) => {
		const url = `/api/service-types/${id}/`;
		let {login} = store.getState();

		if(!login.user) return [];

		let headers = composeHeader(login.csrfToken, login.user.token);

		return fetch(`${url}`, {headers}).then(r => r.json());
	}
};

export default api;
