import actions from './actions';
import settings from '../../../shared/settings';


const initialState = {
	darkMode: false,
	resultsPerPage: 10,
	showFilter: false,
	sidebarnav: {
		isOpen: true
	},
};

const skeletonReducers = (state = initialState, action) => {
	switch (action.type) {
		case actions.types.setDarkMode:
			settings.logger.reducers && console.log('skeletonReducers::setDarkMode');
			return { ...state, darkMode: action.payload };

		case actions.types.setResultsPerPage:
			settings.logger.reducers && console.log('skeletonReducers::setResultsPerPage');
			return { ...state, resultsPerPage: action.payload };

		case actions.types.setShowFilter:
			settings.logger.reducers && console.log('skeletonReducers::setShowFilter');
			return { ...state, showFilter: action.payload };

		case actions.types.setSidebarNavOpen:
			settings.logger.reducers && console.log('skeletonReducers::setSidebarNavOpen');
			const sidebarnav = { ...state.sidebarnav, isOpen: action.payload };
			return { ...state, sidebarnav };

		default:
			return state;
	}
};

export default skeletonReducers;
