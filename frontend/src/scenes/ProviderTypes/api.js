import composeHeader from '../../data/Helpers/request';
import store from '../../shared/store';


const url = '/v2/regions/?exclude_geometry=true';
let api = api || {};

api.providerTypes = {
	getAll: () => {
		let {login} = store.getState();
		let headers = composeHeader(login.csrfToken, login.token);

		return fetch(`${url}`, {headers}).then(r => r.json());
	}
};

export default api;
