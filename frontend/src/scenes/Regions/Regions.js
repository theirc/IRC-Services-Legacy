import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import i18n from '../../shared/i18n';
import languages from './languages.json';
import ListView from './views/ListView/ListView';
import { textFilter } from 'react-bootstrap-table2-filter';
import './Regions.scss';
import api from './api';

const NS = 'Regions';

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

const Regions = props => {
	i18n.customLoad(languages, NS);
	const { t } = useTranslation(NS);

	const [data, setData] = useState([]);

	useEffect(() => {
		(async function fetchData() {
			const response = await api.regions.getAll();
			setData(response.map(e => ({id: e.id, name: e.name})));
			console.log(response);
		})();
	}, []);

	return (
		<div className={NS}>
			{data.length && <ListView data={data} columns={columns} />}
		</div>
	)
}

export default Regions;
