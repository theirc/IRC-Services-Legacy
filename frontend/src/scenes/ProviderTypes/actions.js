import { createAction } from 'redux-actions';

const actionTypes = {
	setProviderTypesList: 'SET_PROVIDER_TYPES_LIST',
}
export default {
	types: actionTypes,
	setProviderTypesList: createAction(actionTypes.setProviderTypesList),
};
