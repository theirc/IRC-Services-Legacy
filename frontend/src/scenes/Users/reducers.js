import actions from './actions';
import settings from '../../shared/settings';

const initialState = {
	list: null,
};

const usersReducers = (state = initialState, action) => {
	switch (action.type) {
		case actions.types.setUsersList:
			settings.logger.reducers && console.log('usersReducers::setUsersList');
			return { ...state, list: action.payload };

		default:
			return state;
	}
};

export default usersReducers;
