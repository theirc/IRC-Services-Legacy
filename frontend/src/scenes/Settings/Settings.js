import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import i18n from '../../shared/i18n';
import languages from './languages.json';
import ListView from './views/ListView/ListView';
import { textFilter } from 'react-bootstrap-table2-filter';
import './Settings.scss';
import api from './api';

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

	return (
		<div className={NS}>
			Settings
		</div>
	)
}

export default Settings;
