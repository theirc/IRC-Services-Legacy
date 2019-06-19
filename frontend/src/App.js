import React, { Component } from 'react';
import './App.css';
import { Helmet } from "react-helmet";
import AppRouter from "./shared/router";

class App extends Component {
	render() {
		const initialCsrf = document.getElementById("initialCSRF").value;
		return (
			<div className="App">
				<Helmet>
					<title>CMS</title>
				</Helmet>
				<AppRouter initialCsrf={initialCsrf} />
			</div>
		);
	}

}

export default App;
