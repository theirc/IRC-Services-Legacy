import actions from './actions';
import settings from '../../shared/settings';

const initialState = {
	list: null,
};

const serviceCategoriesReducers = (state = initialState, action) => {
	switch (action.type) {
		case actions.types.setServiceCategoriesList:
			settings.logger.reducers && console.log('serviceCategoriesReducers::setServiceCategoriesList');
			return { ...state, list: action.payload };

		default:
			return state;
	}
};

export default serviceCategoriesReducers;
