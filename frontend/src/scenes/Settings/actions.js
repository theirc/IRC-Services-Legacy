import { createAction } from 'redux-actions';

const actionTypes = {
	setLanguage: 'SET_LANGUAGE',
	setLogoutTimeout: 'SET_LOGOUT_TIMEOUT',
}
export default {
	types: actionTypes,
	setLanguage: createAction(actionTypes.setLanguage),
	setLogoutTimeout: createAction(actionTypes.setLogoutTimeout),
};
