import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { ConnectedRouter } from "react-router-redux";
import Placeholder from "./shared/placeholder";
import Login from "./scenes/Login";


let history;


class AppRouter extends Component {
	componentDidMount() {
		
	}

	render() {
		//const ServicesWithCountry = withCountry(Services);
		return (
			<Router>
				<Route path="/login" component={Login} />	
			</Router>
			
		);
	}
}

export default AppRouter;