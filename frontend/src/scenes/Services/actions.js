import { createAction } from 'redux-actions';

const actionTypes = {
	setServicesList: 'SET_SERVICES_LIST',
}
export default {
	types: actionTypes,
	setServicesList: createAction(actionTypes.setServicesList),
};
