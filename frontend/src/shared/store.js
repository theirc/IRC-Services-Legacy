import { createStore, combineReducers, compose, applyMiddleware } from "redux";
import { connectRouter, routerMiddleware } from 'connected-react-router'
import { createBrowserHistory } from 'history'
import loginReducers from '../scenes/Login/reducers';

const window = global.window || {};

let initialState = window && window.initialState ? window.initialState : {
	login: {
		csrfToken: null
	},
	user: null
};

export const history = createBrowserHistory();

// binding redux devtools extension and routerMiddleware(history) to dispatch history actions
const enhancers = window.__REDUX_DEVTOOLS_EXTENSION__ ?
	compose(applyMiddleware(routerMiddleware(history)), window.__REDUX_DEVTOOLS_EXTENSION__()) :
	compose(applyMiddleware(routerMiddleware(history)));

const reducers = {
	login: loginReducers,
	router: connectRouter(history)
};

const store = createStore(combineReducers({ ...reducers }), initialState, enhancers);

export default store;
