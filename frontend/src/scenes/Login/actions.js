import { createAction } from 'redux-actions';

const actionTypes = {
	setCsrfToken: 'SET_CSRF_TOKEN',
	setTimedOut: 'SET_TIMED_OUT',
	setUser: 'SET_USER',
};

export default {
	types: actionTypes,
	setCsrfToken: createAction(actionTypes.setCsrfToken),
	setUser: createAction(actionTypes.setUser),
	setTimedOut: createAction(actionTypes.setTimedOut),
};
