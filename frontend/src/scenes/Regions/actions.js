import { createAction } from 'redux-actions';

const actionTypes = {
	setCountriesList: 'SET_COUNTRIES_LIST',
	setRegionsList: 'SET_REGIONS_LIST',
}
export default {
	types: actionTypes,
	setCountriesList: createAction(actionTypes.setCountriesList),
	setRegionsList: createAction(actionTypes.setRegionsList),
};
