import actions from './actions';

const initialState = {
	logoutTimeout: 10,
};

const settingsReducers = (state = initialState, action) => {
	switch (action.type) {
		case actions.types.setLogoutTimeout:
			console.log('settingsReducers::setLogoutTimeout');
			return { ...state, logoutTimeout: action.payload };
		default:
			return state;
	}
};

export default settingsReducers;
