import React from 'react';
import { useTranslation } from "react-i18next";
import i18n from '../../shared/i18n';
import languages from './languages.json';
import ListView from './views/ListView/ListView';
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
		sort: true
	}, {
		dataField: 'description',
		text: 'Description',
		sort: true
	}
];

const products = [
	{ id: 1, name: 'name1', description: 'description' },
	{ id: 2, name: 'name2', description: 'description' },
	{ id: 3, name: 'name3', description: 'description' },
	{ id: 4, name: 'name4', description: 'description' },
	{ id: 5, name: 'name5', description: 'description' },
	{ id: 6, name: 'name6', description: 'description' },
	{ id: 7, name: 'name7', description: 'description' },
	{ id: 8, name: 'name8', description: 'description' },
	{ id: 9, name: 'name9', description: 'description' },
	{ id: 10, name: 'name10', description: 'description' },
	{ id: 11, name: 'name11', description: 'description' },
	{ id: 12, name: 'name12', description: 'description' },
];

const ProviderTypes = props => {
	i18n.customLoad(languages, NS);
	const { t } = useTranslation(NS);

	api.providerTypes.getAll();
	return (
		<div className={NS}>
			<ListView data={products} columns={columns} />
		</div>
	)
}

export default ProviderTypes;
