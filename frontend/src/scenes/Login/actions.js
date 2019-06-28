import { createAction } from 'redux-actions';

const actionTypes = {
	setCsrfToken: 'SET_CSRF_TOKEN',
	setUser: 'SET_USER',
}
export default {
	types: actionTypes,
	setCsrfToken: createAction(actionTypes.setCsrfToken),
	setUser: createAction(actionTypes.setUser),
};
