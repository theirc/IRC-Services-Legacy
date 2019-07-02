import { createAction } from 'redux-actions';

const actionTypes = {
	setSidebarNavOpen: 'SET_SIDEBARNAV_OPEN',
}
export default {
	types: actionTypes,
	setSidebarNavOpen: createAction(actionTypes.setSidebarNavOpen),
};
