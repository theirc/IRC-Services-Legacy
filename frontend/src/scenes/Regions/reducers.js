import actions from './actions';

const initialState = {
	list: null,
};

const regionsReducers = (state = initialState, action) => {
	switch (action.type) {
		case actions.types.setRegionsList:
			console.log('regionsReducers::setRegionsList');
			return { ...state, list: action.payload };
		default:
			return state;
	}
};

export default regionsReducers;
