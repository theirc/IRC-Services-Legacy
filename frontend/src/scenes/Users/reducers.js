import actions from './actions';

const initialState = {
	list: null,
};

const usersReducers = (state = initialState, action) => {
	switch (action.type) {
		case actions.types.setUsersList:
			console.log('usersReducers::setUsersList');
			return { ...state, list: action.payload };
		default:
			return state;
	}
};

export default usersReducers;
