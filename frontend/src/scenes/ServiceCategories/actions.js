import { createAction } from 'redux-actions';

const actionTypes = {
	setServiceCategoriesList: 'SET_SERVICE_CATEGORIES_LIST',
}
export default {
	types: actionTypes,
	setServiceCategoriesList: createAction(actionTypes.setServiceCategoriesList),
};
