import actions from './actions';

const initialState = {
	sidebarnav: {
		isOpen: true
	}
};

const skeletonReducers = (state = initialState, action) => {
	switch (action.type) {
		case actions.types.setSidebarNavOpen:
			console.log('skeletonReducers::setSidebarNavOpen');
			const sidebarnav = { ...state.sidebarnav, isOpen: action.payload };
			return { ...state, sidebarnav };
		default:
			return state;
	}
};

export default skeletonReducers;
