import actions from './actions';

const loginReducers = (state = { csrfToken: null }, action) => {
	switch (action.type) {
		case actions.types.setCsrfToken:
			console.log('loginReducer::setCsrfToken');
			return { ...state, csrfToken: action.payload };
		case actions.types.setUser:
			console.log('loginReducer::setUser');
			return { ...state, user: action.payload };
		default:
			return state;
	}
};

export default loginReducers;
