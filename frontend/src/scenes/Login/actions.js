import { createAction } from 'redux-actions';

const actionTypes = {
	setCsrfToken: 'SET_CSRF_TOKEN',
	setToken: 'SET_TOKEN',
}
export default {
	types: actionTypes,
	setCsrfToken: createAction(actionTypes.setCsrfToken),
	setToken: createAction(actionTypes.setToken),
};
