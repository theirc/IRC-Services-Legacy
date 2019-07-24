import actions from './actions';
import settings from '../../shared/settings';

const initialState = {
	list: null,
};

const regionsReducers = (state = initialState, action) => {
	switch (action.type) {
		case actions.types.setRegionsList:
			settings.logger.reducers && console.log('regionsReducers::setRegionsList');
			return { ...state, list: action.payload };

		default:
			return state;
	}
};

export default regionsReducers;
