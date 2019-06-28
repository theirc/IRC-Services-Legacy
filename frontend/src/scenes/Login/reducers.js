import actions from './actions';

const loginReducers = (state = { csrfToken: null }, action) => {
	switch (action.type) {
		case actions.types.setCsrfToken:
			console.log('loginReducer:setCsrfToken');
			return { ...state, csrfToken: action.payload };
		case actions.types.setToken:
			console.log('loginReducer:setToken');
			return { ...state, token: action.payload };
		default:
			return state;
	}
};

export default loginReducers;
