import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import i18n from '../../shared/i18n';
import languages from './languages.json';
import { connect } from 'react-redux';
import actions from './actions';
import api from './api';
import composeHeader from '../../data/Helpers/request';
import './Login.scss';

const NS = 'Login';

const Login = props => {
	console.log('login props', props);
	i18n.customLoad(languages, NS);
	const { t } = useTranslation(NS);

	const [user, setUser] = useState('');
	const [pass, setPass] = useState('');

	const onSubmit = e => {
		e.preventDefault();
		login(user, pass);
	};

	const login = (user, pass) => {
		let body = JSON.stringify({ username: user, password: pass });

		let csrftoken = document.cookie.match(new RegExp('(^| )' + 'csrftoken' + '=([^;]+)'))[2];
		props.setCsrfToken(csrftoken);

		return fetch('/login', { headers: composeHeader(csrftoken), body, method: 'POST' })
			.then(res => res.json())
			.then(res => {
				props.setUser(res);
				props.history.push('/provider-types');
			});
	};

	return (
		<div className={NS}>
			<form onSubmit={onSubmit}>
				<fieldset>
					<legend>Login</legend>
					<p>
						<label htmlFor='username'>Username</label>
						<input type='text' id='username' onChange={e => setUser(e.target.value)} />
					</p>
					<p>
						<label htmlFor='password'>Password</label>
						<input type='password' id='password' onChange={e => setPass(e.target.value)} />
					</p>
					<p>
						<button type='submit'>Login</button>
					</p>
				</fieldset>
			</form>
		</div>
	)
}

const mapStateToProps = (state, props) => ({});

const mapDispatchToProps = (dispatch) => {
	return {
		setCsrfToken: csrfToken => dispatch(actions.setCsrfToken(csrfToken)),
		setUser: user => dispatch(actions.setUser(user)),
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);