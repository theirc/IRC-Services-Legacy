import { createStore, combineReducers, compose, applyMiddleware } from "redux";
import { connectRouter, routerMiddleware } from 'connected-react-router'
import { createBrowserHistory } from 'history'
import loginReducers from '../scenes/Login/reducers';
import skeletonReducers from '../components/layout/Skeleton/reducers';

const window = global.window || {};

let initialState = window && window.initialState ? window.initialState : {
	login: {
		csrfToken: null
	},
	skeleton: {
		darkMode: false,
		sidebarnav: {
			isOpen: true
		}
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
	skeleton: skeletonReducers,
	router: connectRouter(history)
};

// saves state to local storage
const persist = state => {
	try {
		localStorage.setItem('state', JSON.stringify(state));
	} catch(e) {
		console.log(e);
	}
}

// loads state from local storage
const load = () => {
	try {
		const serializedState = localStorage.getItem('state');

		if(serializedState) {
			let state = JSON.parse(serializedState);
			state.router.location.pathname = window.location.pathname; // update router if url changed
			return state;
		}
		
		return undefined;
	} catch(e) {
		console.log(e);

		return undefined;
	}
}

const persistedState = load();
const store = createStore(combineReducers({ ...reducers }), persistedState || initialState, enhancers);
store.subscribe(() => persist(store.getState()));

export default store;


///////////////////////////////////////////////
// StorePersistor class redesign
/*
export const history = createBrowserHistory();

const reducers = {
	login: loginReducers,
	skeleton: skeletonReducers,
	router: connectRouter(history)
};

const initialState = {
	login: {
		csrfToken: null
	},
	skeleton: {
		sidebarnav: {
			isOpen: true
		}
	},
	user: null
};

// binding redux devtools extension and routerMiddleware(history) to dispatch history actions
const enhancers = window.__REDUX_DEVTOOLS_EXTENSION__ ?
	compose(applyMiddleware(routerMiddleware(history)), window.__REDUX_DEVTOOLS_EXTENSION__()) :
	compose(applyMiddleware(routerMiddleware(history)));

class PersistedStore {
	constructor(reducers, initialState, enhancers, storeName) {
		this.name = storeName;
		const persistedState = this.load(); // overrides initial state
		this.store = createStore(combineReducers({ ...reducers }), persistedState || initialState, enhancers);
		this.store.subscribe(() => this.persist());
	}

	get name() {
		return this.name;
	}

	set name(newName) {
		this.name = newName;
	}

	get store() {
		return this.store;
	}	

	set store(s) {
		this.store = s;
	}	

	// saves state to local storage
	persist() {
		const state = this.store.getState();
		try {
			localStorage.setItem(this.name, JSON.stringify(state));
		} catch(e) {
			console.log(e);
		}
	}

	// loads state from local storage
	load() {
		try {
			const serializedState = localStorage.getItem(this.name);

			if(serializedState) {
				let state = JSON.parse(serializedState);
				state.router.location.pathname = window.location.pathname; // update router if url changed
				return state;
			}
			
			return undefined;
		} catch(e) {
			console.log(e);

			return undefined;
		}
	}
}

const ps = new PersistedStore(reducers, initialState, enhancers, 'app-state');

export default ps.store;
*/
