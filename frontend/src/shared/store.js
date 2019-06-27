import { createStore, combineReducers, compose } from "redux";
import loginReducers from '../scenes/Login/reducers';

const window = global.window || {};

let initialState = window && window.initialState ? window.initialState : {
	login: {
		csrfToken: null
	}
};

// binding redux devtools extension
const enhancers = compose(window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

const reducers = {
	login: loginReducers
};
console.log('store::reducers', reducers);

const store = createStore(combineReducers({ ...reducers }), initialState, enhancers);
console.log('store::store', store);

export default store;
