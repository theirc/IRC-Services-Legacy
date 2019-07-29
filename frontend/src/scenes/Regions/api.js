import composeHeader from '../../data/Helpers/headers';
import actions from './actions';
import store from '../../shared/store';

let api = api || {};

api.regions = {
	getAll: () => {
		const url = '/api/regions/?exclude_geometry=true';
		let { login } = store.getState();

		if (!login.user) return [];

		let headers = composeHeader(login.csrfToken, login.user.token);

		return fetch(url, { headers }).then(r => r.json());
	},
	getOne: id => {
		const url = `/api/regions/${id}/`;
		let { login } = store.getState();

		if (!login.user) return [];

		let headers = composeHeader(login.csrfToken, login.user.token);

		return fetch(url, { headers }).then(r => r.json());
	},
	listAll: () => {
		const url = '/api/list-regions/';
		let { login, regions } = store.getState();

		if (!login.user) return [];

		let headers = composeHeader(login.csrfToken, login.user.token);

		// Saving response to redux store
		return regions.list ? Promise.resolve(regions.list) : fetch(url, { headers }).then(r => r.json()).then(r => { store.dispatch(actions.setRegionsList(r)); return r; });
	},
	listCountries: () => {
		const url = 'api/regions/?exclude_geometry=true&level=1';
		let { login, regions } = store.getState();

		if (!login.user) return [];

		let headers = composeHeader(login.csrfToken, login.user.token);

		// Saving response to redux store
		return regions.countriesList ? Promise.resolve(regions.countriesList) : fetch(url, { headers }).then(r => r.json()).then(r => { store.dispatch(actions.setCountriesList(r)); return r; });
	}
};

export default api;
