import composeHeader from '../../data/Helpers/request';
import store from '../../shared/store';

const url = '/api/settings/';
let api = api || {};

api.settings = {
	getAll: () => {
		let {login} = store.getState();

		if(!login.user) return [];

		let headers = composeHeader(login.csrfToken, login.user.token);

		return fetch(`${url}`, {headers}).then(r => r.json());
	}
};

export default api;
