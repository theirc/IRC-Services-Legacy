import { createAction } from 'redux-actions';

const actionTypes = {
	setDarkMode: 'SET_DARK_MODE',
	setSidebarNavOpen: 'SET_SIDEBARNAV_OPEN',
}
export default {
	types: actionTypes,
	setDarkMode: createAction(actionTypes.setDarkMode),
	setSidebarNavOpen: createAction(actionTypes.setSidebarNavOpen),
};
