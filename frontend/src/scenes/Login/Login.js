import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../shared/i18n';
import languages from './languages.json';
import { connect } from 'react-redux';
import actions from './actions';
import api from './api';
import composeHeader from '../../data/Helpers/headers';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import './Login.scss';

const NS = 'Login';

const Login = props => {
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
			<Form onSubmit={onSubmit}>
				<Form.Group controlId='formBasicEmail'>
					<Form.Label>{t('username')}</Form.Label>
					<Form.Control type='email' placeholder='Enter email' onChange={e => setUser(e.target.value)} />
					<Form.Text className='text-muted'>
						We'll never share your email with anyone else.
				</Form.Text>
				</Form.Group>

				<Form.Group controlId='formBasicPassword'>
					<Form.Label>{t('password')}</Form.Label>
					<Form.Control type='password' placeholder='Password' onChange={e => setPass(e.target.value)} />
				</Form.Group>
				<Button variant='primary' type='submit'>
					{t('submit')}
				</Button>
			</Form>
		</div>
	)
}

const mapStateToProps = (state, props) => ({});

const mapDispatchToProps = dispatch => {
	return {
		setCsrfToken: csrfToken => dispatch(actions.setCsrfToken(csrfToken)),
		setUser: user => dispatch(actions.setUser(user)),
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
