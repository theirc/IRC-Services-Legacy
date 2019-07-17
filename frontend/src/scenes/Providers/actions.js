import { createAction } from 'redux-actions';

const actionTypes = {
	setProvidersList: 'SET_PROVIDERS_LIST',
}
export default {
	types: actionTypes,
	setProvidersList: createAction(actionTypes.setProvidersList),
};
