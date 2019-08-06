import actions from './actions';
import settings from '../../shared/settings';

const initialState = {
	list: null,
};

const providersReducers = (state = initialState, action) => {
	switch (action.type) {
		case actions.types.setProvidersList:
			settings.logger.reducers && console.log('providersReducers::setProvidersList');
			return { ...state, list: action.payload };

		default:
			return state;
	}
};

export default providersReducers;
