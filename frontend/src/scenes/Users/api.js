import composeHeader from '../../data/Helpers/headers';
import actions from './actions';
import store from '../../shared/store';

let api = api || {};

api.users = {
	getAll: () => {
		const url = '/api/users/';
		let { login } = store.getState();

		if (!login.user) return [];

		let headers = composeHeader(login.csrfToken, login.user.token);

		return fetch(url, { headers }).then(r => r.json());
	},
	getOne: id => {
		const url = `/api/users/${id}/`;
		let { login } = store.getState();

		if (!login.user) return [];

		let headers = composeHeader(login.csrfToken, login.user.token);

		return fetch(url, { headers }).then(r => r.json());
	},
	listAll: () => {
		const url = '/api/list-users/';
		let { login, users } = store.getState();

		if (!login.user) return [];

		let headers = composeHeader(login.csrfToken, login.user.token);

		// Saving response to redux store
		return users.list ? Promise.resolve(users.list) : fetch(url, { headers }).then(r => r.json()).then(r => { store.dispatch(actions.setUsersList(r)); return r; });
	},
	save: data => {
		let { login } = store.getState();

		if (!login.user) return [];

		let headers = composeHeader(login.csrfToken, login.user.token);
		const method = data.id === 0 ? 'POST' : 'PUT';
		const url = data.id === 0 ? `/api/users/` : `/api/users/${data.id}/`;

		return fetch(url, { method: method, body: JSON.stringify(data), headers: headers }).then(r => r.json());
	}
};

export default api;
