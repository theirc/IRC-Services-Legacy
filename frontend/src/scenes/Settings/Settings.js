import React, { useState, useEffect } from 'react';
import { ButtonToolbar, Form, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import actions from '../../components/layout/Skeleton/actions';
import api from './api';
import i18n from '../../shared/i18n';
import languages from './languages.json';

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
			console.log(response);
		})();
	}, []);

	const onChange = value => {
		props.setDarkMode(value);
	}

	return (
		<div className={NS}>
			<h2>Settings</h2>
			<ButtonToolbar>
				<ToggleButtonGroup type='radio' name='theme' defaultValue={props.darkMode ? true : false} onChange={v => onChange(v)}>
					<ToggleButton variant='light' value={false}>Light (default)</ToggleButton>
					<ToggleButton variant='dark' value={true}>Dark</ToggleButton>
				</ToggleButtonGroup>
			</ButtonToolbar>

			<Form>
				<Form.Group controlId="exampleForm.ControlSelect1">
					<Form.Label>Languages</Form.Label>
					<Form.Control as="select">
						<option>English</option>
						<option>Spanish</option>
					</Form.Control>
				</Form.Group>
			</Form>
		</div>
	)
}

const mapStateToProps = state => ({
	darkMode: state.skeleton.darkMode,
});

const mapDispatchToProps = dispatch => {
	return {
		setDarkMode: darkMode => dispatch(actions.setDarkMode(darkMode)),
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
