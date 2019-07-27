import { createStore, combineReducers, compose, applyMiddleware } from "redux";
import { connectRouter, routerMiddleware } from 'connected-react-router'
import { createBrowserHistory } from 'history'
import loginReducers from '../scenes/Login/reducers';
import providersReducers from '../scenes/Providers/reducers';
import providerTypesReducers from '../scenes/ProviderTypes/reducers';
import regionsReducers from '../scenes/Regions/reducers';
import serviceCategoriesReducers from '../scenes/ServiceCategories/reducers';
import servicesReducers from '../scenes/Services/reducers';
import settingsReducers from '../scenes/Settings/reducers';
import usersReducers from '../scenes/Users/reducers';
import skeletonReducers from '../components/layout/Skeleton/reducers';

const window = global.window || {};

let initialState = {
	login: {
		csrfToken: null,
		timedOut: false,
		user: null,
	},
	providers: {
		list: null
	},
	providerTypes: {
		list: null
	},
	regions: {
		list: null
	},
	serviceCategories: {
		list: null
	},
	services: {
		list: null
	},
	users: {
		list: null
	},
	skeleton: {
		darkMode: false,
		resultsPerPage: 10,
		sidebarnav: {
			isOpen: true
		}
	},
	settingsReducers
};

export const history = createBrowserHistory();

// binding redux devtools extension and routerMiddleware(history) to dispatch history actions
const enhancers = window.__REDUX_DEVTOOLS_EXTENSION__ ?
	compose(applyMiddleware(routerMiddleware(history)), window.__REDUX_DEVTOOLS_EXTENSION__()) :
	compose(applyMiddleware(routerMiddleware(history)));

const reducers = {
	login: loginReducers,
	providers: providersReducers,
	providerTypes: providerTypesReducers,
	regions: regionsReducers,
	serviceCategories: serviceCategoriesReducers,
	services: servicesReducers,
	users: usersReducers,
	skeleton: skeletonReducers,
	settings: settingsReducers,
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
			// Overrides on reload
			state.router.location.pathname = window.location.pathname; // update router if url changed
			state.login.timedOut = initialState.login.timedOut; // override timeout message on login scene refresh
			
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
