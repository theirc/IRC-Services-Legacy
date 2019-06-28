import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Login from "../scenes/Login";
import Skeleton from '../components/layout/Skeleton/Skeleton';
import ProviderTypes from '../scenes/ProviderTypes/ProviderTypes';
import {ConnectedRouter} from 'connected-react-router';
import {history} from '../shared/store';

const AppRouter = props => {
	const initialCsrf = props.initialCsrf;
	sessionStorage.setItem("csrf", initialCsrf);

	return (
		<ConnectedRouter history={history}>
			<Switch>
				<Route path='/userlogin' component={props => <Login {...props} />} />
				<Skeleton>
					<Route path='/provider-types' component={props => <ProviderTypes {...props} />} />
				</Skeleton>
				<Route render={() => <h1>Page not found</h1>} />
			</Switch>
		</ConnectedRouter>
	)
}

export default AppRouter;
