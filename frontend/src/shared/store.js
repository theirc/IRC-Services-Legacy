import { createStore, combineReducers, compose, applyMiddleware } from "redux";
import { connectRouter, routerMiddleware } from 'connected-react-router'
import { createBrowserHistory } from 'history'
import loginReducers from '../scenes/Login/reducers';

const window = global.window || {};

let initialState = window && window.initialState ? window.initialState : {
	login: {
		csrfToken: null
	}
};

export const history = createBrowserHistory();

// binding redux devtools extension and routerMiddleware(history) to dispatch history actions
const enhancers = compose(window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(), applyMiddleware(routerMiddleware(history)));

const reducers = {
	login: loginReducers,
	router: connectRouter(history)
};
console.log('store::reducers', reducers);

const store = createStore(combineReducers({ ...reducers }), initialState, enhancers);
console.log('store::store', store);

export default store;
