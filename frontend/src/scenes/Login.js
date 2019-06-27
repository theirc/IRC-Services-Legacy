import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from "react-router-dom";
import { connect } from 'react-redux';
import './Login/actions';
import actions from './Login/actions';

class Login extends React.Component {
	static contextTypes = {
		router: PropTypes.object
	}
	state = {
		username: "",
		password: "",
	}

	login = (username, password) => {
		let csrftoken = sessionStorage.getItem("csrf");
		csrftoken = document.cookie.match(new RegExp('(^| )' + 'csrftoken' + '=([^;]+)'))[2];
		console.log('props, csrftoken', this.props, csrftoken);
		this.props.setCsrfToken(csrftoken);
		let headers = { "Content-Type": "application/json", 'X-CSRFToken': csrftoken };
		let body = JSON.stringify({ username, password });

		return fetch("/login", { headers, body, method: "POST" })
			.then(res => {
				if (res.status < 500) {
					window.res = res;
					console.log(res.data);
					return res.json().then(data => {
						return { status: res.status, data };
					})
				} else {
					console.log("Server Error!");
					throw res;
				}
			})
			.then(res => {
				if (res.status === 200) {
					console.log("Success");
					console.log(res.data);
					window.res = res;
					return res.data;
				} else if (res.status === 403 || res.status === 401) {
					console.log("Error");
					throw res.data;
				} else {
					console.log("Failed");
					throw res.data;
				}
			})
	}

	onSubmit = e => {
		e.preventDefault();
		this.login(this.state.username, this.state.password);
	}
	componentWillUpdate(nextProps) {
	}
	componentWillMount() {
	}
	render() {
		if (this.props.isAuthenticated) {
			return <Redirect to="/" />
		}
		return (
			<div>
				<form onSubmit={this.onSubmit}>
					<fieldset>
						<legend>Login</legend>
						<p>
							<label htmlFor="username">Username</label>
							<input
								type="text" id="username"
								onChange={e => this.setState({ username: e.target.value })} />
						</p>
						<p>
							<label htmlFor="password">Password</label>
							<input
								type="password" id="password"
								onChange={e => this.setState({ password: e.target.value })} />
						</p>
						<p>
							<button type="submit">Login</button>
						</p>

					</fieldset>
				</form>
			</div>

		)
	}

}

const mapStateToProps = (state, props) => ({});

const mapDispatchToProps = (dispatch) => {
	return {
		setCsrfToken: csrfToken => dispatch(actions.setCsrfToken(csrfToken))
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);