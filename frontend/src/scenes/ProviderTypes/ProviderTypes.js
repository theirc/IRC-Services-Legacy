import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import i18n from '../../shared/i18n';
import languages from './languages.json';
import ListView from './views/ListView/ListView';
import { textFilter } from 'react-bootstrap-table2-filter';
import './ProviderTypes.scss';
import api from './api';

const NS = 'ProviderTypes';

const columns = [
	{
		dataField: 'id',
		text: 'ID',
		sort: true
	}, {
		dataField: 'name',
		text: 'Name',
		sort: true,
		filter: textFilter()
	}
];

const ProviderTypes = props => {
	i18n.customLoad(languages, NS);
	const { t } = useTranslation(NS);

	const [data, setData] = useState([]);

	useEffect(() => {
		(async function fetchData() {
			const response = await api.providerTypes.getAll();
			// setData(response.map(e => ({...e, description: e.slug})));
			setData(response);
		})();
	}, []);

	return (
		<div className={NS}>
			<ListView data={data} columns={columns} />
		</div>
	)
}

export default ProviderTypes;
