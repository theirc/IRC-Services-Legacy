import { createAction } from 'redux-actions';

const actionTypes = {
	setRegionsList: 'SET_REGIONS_LIST',
}
export default {
	types: actionTypes,
	setRegionsList: createAction(actionTypes.setRegionsList),
};
