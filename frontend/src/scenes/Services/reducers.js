import actions from './actions';
import settings from '../../shared/settings';

const initialState = {
	list: null,
};

const servicesReducers = (state = initialState, action) => {
	switch (action.type) {
		case actions.types.setServicesList:
			settings.logger.reducers && console.log('servicesReducers::setServicesList');
			return { ...state, list: action.payload };

		default:
			return state;
	}
};

export default servicesReducers;
