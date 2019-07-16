import actions from './actions';

const initialState = {
	darkMode: false,
	sidebarnav: {
		isOpen: true
	},
};

const skeletonReducers = (state = initialState, action) => {
	switch (action.type) {
		case actions.types.setSidebarNavOpen:
			console.log('skeletonReducers::setSidebarNavOpen');
			const sidebarnav = { ...state.sidebarnav, isOpen: action.payload };
			return { ...state, sidebarnav };
		case actions.types.setDarkMode:
			console.log('skeletonReducers::setDarkMode');
			return { ...state, darkMode: action.payload };
		default:
			return state;
	}
};

export default skeletonReducers;
