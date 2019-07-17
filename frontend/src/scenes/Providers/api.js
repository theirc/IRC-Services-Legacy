import composeHeader from '../../data/Helpers/headers';
import actions from './actions';
import store from '../../shared/store';

let api = api || {};

api.providers = {
	getAll: () => {
		const url = '/api/private-providers/';
		let { login } = store.getState();

		if (!login.user) return [];

		let headers = composeHeader(login.csrfToken, login.user.token);

		return fetch(url, { headers }).then(r => r.json());
	},
	getOne: id => {
		const url = `/api/private-providers/${id}/`;
		let { login } = store.getState();

		if (!login.user) return [];

		let headers = composeHeader(login.csrfToken, login.user.token);

		return fetch(url, { headers }).then(r => r.json());
	},
	listAll: () => {
		const url = '/api/list-private-providers/';
		let { login, providers } = store.getState();

		if (!login.user) return [];

		let headers = composeHeader(login.csrfToken, login.user.token);

		// Saving response to redux store
		return providers.list ? Promise.resolve(providers.list) : fetch(url, { headers }).then(r => r.json()).then(r => { store.dispatch(actions.setProvidersList(r)); return r; });
	},
};

export default api;
