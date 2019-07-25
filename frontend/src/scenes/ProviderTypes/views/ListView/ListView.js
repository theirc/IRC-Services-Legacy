import React, { useEffect, useState } from 'react';
import api from '../../api';
import List from '../../../../components/views/List/List';
import settings from '../../../../shared/settings';

import './ListView.scss';

const ListView = props => {
	const columns = [
		{
			dataField: 'id',
			text: 'ID',
			sort: true,
			headerStyle: () => {
				return { width: '8%' };
			}
		}, {
			dataField: 'name',
			text: 'Name',
			sort: true,
			headerStyle: () => {
				return { width: '92%' };
			}
		}
	];

	const [data, setData] = useState([]);

	const rowEvents = {
		onClick: (e, row, rowIndex) => props.history.push(`/provider-types/${row.id}`)
	};

	const addNew = () => {
		props.history.push(`/provider-types/create`);
	};

	useEffect(() => {
		(async function fetchData() {
			const response = await api.providerTypes.listAll();
			setData(response.map(e => ({ id: e.id, name: e.name })));
			settings.logger.requests && console.table(response);
		})();
	}, []);

	return (
		<div className='ListView'>
			<h2>{props.title}</h2>
			<List {...props} data={data} columns={columns} rowEvents={rowEvents} create={addNew} defaultSorted={[{ dataField: 'id', order: 'asc' }]} />
		</div>
	);
}

export default ListView;