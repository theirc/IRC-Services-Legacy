
import React, { Component } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Login from "../scenes/Login/Login";
import Skeleton from '../components/layout/Skeleton/Skeleton';
import Providers from '../scenes/Providers/Providers';
import ProviderTypes from '../scenes/ProviderTypes/ProviderTypes';
import Regions from '../scenes/Regions/Regions';
import ServiceCategories from '../scenes/ServiceCategories/ServiceCategories';
import Services from '../scenes/Services/Services';
import Settings from '../scenes/Settings/Settings';
import { connect } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { history } from '../shared/store';

const AppRouter = props => {
	const initialCsrf = props.initialCsrf;
	sessionStorage.setItem("csrf", initialCsrf);

	console.log(props);
	return (
		<ConnectedRouter history={history}>
			<Switch>
				{props.user &&
				<Skeleton {...props}>
					<Route exact path='/providers' component={props => <Providers {...props} />} />
					<Route exact path='/providers/:id' component={props => <Providers {...props} />} />
					<Route exact path='/provider-types' component={props => <ProviderTypes {...props} />} />
					<Route exact path='/provider-types/:id' component={props => <ProviderTypes {...props} />} />
					<Route exact path='/regions' component={props => <Regions {...props} />} />
					<Route exact path='/regions/:id' component={props => <Regions {...props} />} />
					<Route exact path='/service-categories' component={props => <ServiceCategories {...props} />} />
					<Route exact path='/service-categories/:id' component={props => <ServiceCategories {...props} />} />
					<Route exact path='/services' component={props => <Services {...props} />} />
					<Route exact path='/services/:id' component={props => <Services {...props} />} />
					<Route exact path='/settings' component={props => <Settings {...props} />} />
				</Skeleton>
				}
				{!props.user &&
					<div>
						<Redirect to='/' />
						<Route path='/' component={props => <Login {...props} />} />
					</div>
				}
			</Switch>
		</ConnectedRouter>
	)
}
const mapStateToProps = state => ({
	user: state.login.user,
});

export default connect(mapStateToProps)(AppRouter);
