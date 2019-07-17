import actions from './actions';

const initialState = {
	list: null,
};

const providersReducers = (state = initialState, action) => {
	switch (action.type) {
		case actions.types.setProvidersList:
			console.log('providersReducers::setProvidersList');
			return { ...state, list: action.payload };
		default:
			return state;
	}
};

export default providersReducers;
