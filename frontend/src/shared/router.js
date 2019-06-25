import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Login from "../scenes/Login";
// import ProviderTypes from './scenes/ProviderTypes/ProviderTypes'
import Skeleton from '../components/layout/Skeleton/Skeleton';
import ProviderTypes from '../scenes/ProviderTypes/ProviderTypes';

class AppRouter extends Component {
	componentWillMount() {
		
	}

	render() {
		//const ServicesWithCountry = withCountry(Services);
		const initialCsrf = this.props.initialCsrf;
		console.log(initialCsrf, this.props);
		sessionStorage.setItem("csrf", initialCsrf);
		return (
			<Router>
				<Switch>
					<Route path='/userlogin' component={props => <Login {...props} />} />
					<Skeleton>
						<Route path='/provider-types' component={props => <ProviderTypes {...props} />} />
					</Skeleton>
					<Route render={() => <h1>Page not found</h1>} />
				</Switch>
			</Router>
		)
	}
}

export default AppRouter;