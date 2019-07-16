import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../shared/i18n';
import languages from './languages.json';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import actions from '../../components/layout/Skeleton/actions';
import { connect } from 'react-redux';
import api from './api';

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
					<ToggleButton value={false}>Light (default)</ToggleButton>
					<ToggleButton value={true}>Dark</ToggleButton>
				</ToggleButtonGroup>
			</ButtonToolbar>
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
