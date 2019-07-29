import React, { useState, useEffect } from 'react';
import { ButtonToolbar, Form, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import api from './api';
import i18n from '../../shared/i18n';
import languages from './languages.json';
import settingsActions from '../../scenes/Settings/actions';
import skeletonActions from '../../components/layout/Skeleton/actions';

import './Settings.scss';

const NS = 'Settings';

const Settings = props => {
	i18n.customLoad(languages, NS);
	const { t } = useTranslation(NS);

	const [data, setData] = useState([]);

	useEffect(() => {
		(async function fetchData() {
			const response = await api.settings.getAll();
			setData(response);
		})();
	}, []);

	const handleDarkMode = value => {
		props.setDarkMode(value);
	}

	const handleAutoLogout = e => {
		props.setLogoutTimeout(parseInt(e.target.value));
	}

	const handleLanguage = e => {
		props.setLanguage(e.target.value);
		i18n.changeLanguage(e.target.value);
	}

	return (
		<div className={NS}>
			<h2>{t('title')}</h2>
			<ButtonToolbar>
				<ToggleButtonGroup type='radio' name='theme' value={props.darkMode ? true : false} onChange={v => handleDarkMode(v)}>
					<ToggleButton variant='light' value={false}>Light (default)</ToggleButton>
					<ToggleButton variant='light' value={true}>Dark</ToggleButton>
				</ToggleButtonGroup>
			</ButtonToolbar>

			<Form>
				<Form.Group controlId='settingsForm.LanguageSelect'>
					<Form.Label>Languages</Form.Label>
					<Form.Control as='select' onChange={handleLanguage} value={props.language}>
						<option value='en-US'>English</option>
						<option value='fr-FR'>French</option>
					</Form.Control>
				</Form.Group>

				<Form.Group controlId='settingsForm.TimeoutSelect'>
					<Form.Label>Automatically log out</Form.Label>
					<Form.Control as='select' onChange={handleAutoLogout} value={props.logoutTimeout}>
						<option value='1'>1 min</option>
						<option value='10'>10 min</option>
						<option value='20'>20 min</option>
						<option value='30'>30 min</option>
					</Form.Control>
				</Form.Group>
			</Form>
		</div>
	)
}

const mapStateToProps = state => ({
	darkMode: state.skeleton.darkMode,
	language: state.settings.language,
	logoutTimeout: state.settings.logoutTimeout
});

const mapDispatchToProps = dispatch => {
	return {
		setDarkMode: darkMode => dispatch(skeletonActions.setDarkMode(darkMode)),
		setLanguage: language => dispatch(settingsActions.setLanguage(language)),
		setLogoutTimeout: timeout => dispatch(settingsActions.setLogoutTimeout(timeout)),
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
