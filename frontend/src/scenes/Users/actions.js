import { createAction } from 'redux-actions';

const actionTypes = {
	setUsersList: 'SET_USERS_LIST',
}
export default {
	types: actionTypes,
	setUsersList: createAction(actionTypes.setUsersList),
};
