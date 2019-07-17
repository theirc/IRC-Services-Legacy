import actions from './actions';

const initialState = {
	list: null,
};

const servicesReducers = (state = initialState, action) => {
	switch (action.type) {
		case actions.types.setServicesList:
			console.log('servicesReducers::setServicesList');
			return { ...state, list: action.payload };
		default:
			return state;
	}
};

export default servicesReducers;
