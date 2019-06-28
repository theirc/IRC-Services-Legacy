import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Login from "../scenes/Login";
import Skeleton from '../components/layout/Skeleton/Skeleton';
import Providers from '../scenes/Providers/Providers';
import ProviderTypes from '../scenes/ProviderTypes/ProviderTypes';
import Regions from '../scenes/Regions/Regions';
import ServiceCategories from '../scenes/ServiceCategories/ServiceCategories';
import Settings from '../scenes/Settings/Settings';
import {ConnectedRouter} from 'connected-react-router';
import {history} from '../shared/store';

const AppRouter = props => {
	const initialCsrf = props.initialCsrf;
	sessionStorage.setItem("csrf", initialCsrf);

	return (
		<ConnectedRouter history={history}>
			<Switch>
				<Route exact path='/' component={props => <Login {...props} />} />
				<Skeleton {...props}>
					<Route path='/providers' component={props => <Providers {...props} />} />
					<Route path='/provider-types' component={props => <ProviderTypes {...props} />} />
					<Route path='/regions' component={props => <Regions {...props} />} />
					<Route path='/service-categories' component={props => <ServiceCategories {...props} />} />
					<Route path='/settings' component={props => <Settings {...props} />} />
				</Skeleton>
				<Route render={() => <h1>Page not found</h1>} />
			</Switch>
		</ConnectedRouter>
	)
}

export default AppRouter;
