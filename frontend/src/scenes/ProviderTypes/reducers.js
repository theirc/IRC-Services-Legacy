import actions from './actions';

const initialState = {
	list: null,
};

const providerTypesReducers = (state = initialState, action) => {
	switch (action.type) {
		case actions.types.setProviderTypesList:
			console.log('providerTypesReducers::setProviderTypesList');
			return { ...state, list: action.payload };
		default:
			return state;
	}
};

export default providerTypesReducers;
