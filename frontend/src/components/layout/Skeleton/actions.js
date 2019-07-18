import { createAction } from 'redux-actions';

const actionTypes = {
	setDarkMode: 'SET_DARK_MODE',
	setResultsPerPage: 'SET_RESULTS_PER_PAGE',
	setSidebarNavOpen: 'SET_SIDEBARNAV_OPEN',
}
export default {
	types: actionTypes,
	setDarkMode: createAction(actionTypes.setDarkMode),
	setResultsPerPage: createAction(actionTypes.setResultsPerPage),
	setSidebarNavOpen: createAction(actionTypes.setSidebarNavOpen),
};
