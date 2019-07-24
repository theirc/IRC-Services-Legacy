import actions from './actions';

const initialState = {
	csrfToken: null,
	timedOut: false,
	user: null,
};

const loginReducers = (state = initialState, action) => {
	switch (action.type) {
		case actions.types.setCsrfToken:
			console.log('loginReducer::setCsrfToken');
			return { ...state, csrfToken: action.payload };
		
		case actions.types.setTimedOut:
			console.log('loginReducer::setTimedOut');
			return { ...state, timedOut: action.payload };
			
		case actions.types.setUser:
			console.log('loginReducer::setUser');
			return { ...state, user: action.payload };
		
		default:
			return state;
	}
};

export default loginReducers;
