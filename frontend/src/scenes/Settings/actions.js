import { createAction } from 'redux-actions';

const actionTypes = {
	setLogoutTimeout: 'SET_LOGOUT_TIMEOUT',
}
export default {
	types: actionTypes,
	setLogoutTimeout: createAction(actionTypes.setLogoutTimeout),
};
