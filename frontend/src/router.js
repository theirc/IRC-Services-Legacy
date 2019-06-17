import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { ConnectedRouter } from "react-router-redux";
import Placeholder from "./shared/placeholder";
import Login from "./scenes/Login";


let history;


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
				<Route path="/userlogin" component={props => <Login {...props} />} />	
			</Router>
			
		);
	}
}

export default AppRouter;