import composeHeader from '../../data/Helpers/headers';
import actions from './actions';
import store from '../../shared/store';

let api = api || {};

api.services = {
	getAll: () => {
		const url = '/api/private-services/';
		let { login } = store.getState();

		if (!login.user) return [];

		let headers = composeHeader(login.csrfToken, login.user.token);

		return fetch(url, { headers }).then(r => r.json());
	},
	getOne: id => {
		const url = `/api/private-services/${id}/`;
		let { login } = store.getState();

		if (!login.user) return [];

		let headers = composeHeader(login.csrfToken, login.user.token);

		return fetch(url, { headers }).then(r => r.json());
	},
	listAll: () => {
		const url = '/api/list-services/';
		let { login, services } = store.getState();

		if (!login.user) return [];

		let headers = composeHeader(login.csrfToken, login.user.token);

		// Saving response to redux store
		return services.list ? Promise.resolve(services.list) : fetch(url, { headers }).then(r => r.json()).then(r => { store.dispatch(actions.setServicesList(r)); return r; });
	}
};

export default api;
