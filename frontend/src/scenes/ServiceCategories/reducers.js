import actions from './actions';

const initialState = {
	list: null,
};

const serviceCategoriesReducers = (state = initialState, action) => {
	switch (action.type) {
		case actions.types.setServiceCategoriesList:
			console.log('serviceCategoriesReducers::setServiceCategoriesList');
			return { ...state, list: action.payload };
		default:
			return state;
	}
};

export default serviceCategoriesReducers;
