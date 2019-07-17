import composeHeader from '../../data/Helpers/headers';
import store from '../../shared/store';

let api = api || {};

api.users = {
	getAll: () => {
		const url = '/api/users/';
		let {login} = store.getState();
		
		if(!login.user) return [];
		
		let headers = composeHeader(login.csrfToken, login.user.token);
		
		return fetch(`${url}`, {headers}).then(r => r.json());
	},
	getOne: (id) => {
		const url = `/api/users/${id}/`;
		let {login} = store.getState();

		if(!login.user) return [];

		let headers = composeHeader(login.csrfToken, login.user.token);

		return fetch(`${url}`, {headers}).then(r => r.json());
	},
	listAll: () => {
		const url = '/api/list-users/?siteid=1';
		let {login} = store.getState();
		
		if(!login.user) return [];
		
		let headers = composeHeader(login.csrfToken, login.user.token);
		
		return fetch(`${url}`, {headers}).then(r => r.json());
	},
};

export default api;
