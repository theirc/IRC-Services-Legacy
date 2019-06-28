import composeHeader from '../../data/Helpers/request';
import store from '../../shared/store';

const url = '/api/private-providers/';
let api = api || {};

api.providers = {
	getAll: () => {
		let {login} = store.getState();

		if(!login.user) return [];

		let headers = composeHeader(login.csrfToken, login.user.token);

		return fetch(`${url}`, {headers}).then(r => r.json());
	}
};

export default api;
