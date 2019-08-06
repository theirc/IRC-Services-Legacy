import actions from './actions';
import settings from '../../shared/settings';

const initialState = {
	list: null,
};

const providerTypesReducers = (state = initialState, action) => {
	switch (action.type) {
		case actions.types.setProviderTypesList:
			settings.logger.reducers && console.log('providerTypesReducers::setProviderTypesList');
			return { ...state, list: action.payload };

		default:
			return state;
	}
};

export default providerTypesReducers;
