import { createAction } from 'redux-actions';

const actionTypes = {
	setDarkMode: 'SET_DARK_MODE',
	setSidebarNavOpen: 'SET_SIDEBARNAV_OPEN',
	setResultsPerPage: 'SET_RESULTS_PER_PAGE',
}
export default {
	types: actionTypes,
	setDarkMode: createAction(actionTypes.setDarkMode),
	setResultsPerPage: createAction(actionTypes.setResultsPerPage),
};
