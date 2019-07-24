import actions from './actions';
import settings from '../../shared/settings';

const initialState = {
	csrfToken: null,
	timedOut: false,
	user: null,
};

const loginReducers = (state = initialState, action) => {
	switch (action.type) {
		case actions.types.setCsrfToken:
			settings.logger.reducers && console.log('loginReducer::setCsrfToken');
			return { ...state, csrfToken: action.payload };
		
		case actions.types.setTimedOut:
			settings.logger.reducers && console.log('loginReducer::setTimedOut');
			return { ...state, timedOut: action.payload };
			
		case actions.types.setUser:
			settings.logger.reducers && console.log('loginReducer::setUser');
			return { ...state, user: action.payload };
		
		default:
			return state;
	}
};

export default loginReducers;
