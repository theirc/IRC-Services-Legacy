import actions from './actions';

const initialState = {
	darkMode: false,
	resultsPerPage: 10,
	sidebarnav: {
		isOpen: true
	},
};

const skeletonReducers = (state = initialState, action) => {
	switch (action.type) {
		case actions.types.setDarkMode:
			console.log('skeletonReducers::setDarkMode');
			return { ...state, darkMode: action.payload };

		case actions.types.setResultsPerPage:
			console.log('skeletonReducers::setResultsPerPage');
			return { ...state, resultsPerPage: action.payload };

		case actions.types.setSidebarNavOpen:
			console.log('skeletonReducers::setSidebarNavOpen');
			const sidebarnav = { ...state.sidebarnav, isOpen: action.payload };
			return { ...state, sidebarnav };
		
		default:
			return state;
	}
};

export default skeletonReducers;
