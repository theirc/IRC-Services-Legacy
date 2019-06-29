import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import i18n from '../../shared/i18n';
import languages from './languages.json';
import ListView from './views/ListView/ListView';
import { textFilter } from 'react-bootstrap-table2-filter';
import './Providers.scss';
import api from './api';

const NS = 'Providers';

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

const Providers = props => {
	i18n.customLoad(languages, NS);
	const { t } = useTranslation(NS);

	const [data, setData] = useState([]);
	console.log(props);

	const rowEvents = {
		onClick: (e, row, rowIndex) => props.history.push(`/providers/${row.id}`)
	};
	
	useEffect(() => {
		(async function fetchData() {
			const response = await api.providers.getAll();
			setData(response.map(e => ({id: e.id, name: e.name})));
			console.log(response);
		})();
	}, []);

	return (
		<div className={NS}>
			{/* {data.length && <ListView data={data} columns={columns} rowEvents={rowEvents} />} */}
			{data.length && <ListView data={data} columns={columns} />}
		</div>
	)
}

export default Providers;
