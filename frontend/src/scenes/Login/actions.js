import { createAction } from 'redux-actions';

const actionTypes = {
	setCsrfToken: 'SET_CSRF_TOKEN'
}
export default {
	types: actionTypes,
	setCsrfToken: createAction(actionTypes.setCsrfToken)
};
