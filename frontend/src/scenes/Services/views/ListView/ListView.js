import React, { useEffect, useState } from 'react';
import api from '../../api';
import List from '../../../../components/views/List/List';
import SidePanel from './SidePanel/SidePanel';
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
				return { width: '50%' };
			}
		}, {
			dataField: 'provider',
			text: 'Provider',
			sort: true,
			headerStyle: () => {
				return { width: '42%' };
			}
		}
	];

	const [data, setData] = useState([]);

	const rowEvents = {
		onClick: (e, row, rowIndex) => props.history.push(`/services/${row.id}`)
	};

	const addNew = () => {
		props.history.push(`/services/create`);
	};

	useEffect(() => {
		(async function fetchData() {
			const response = await api.services.listAll();
			setData(response.map(e => ({ id: e.id, name: e.name, provider: e.provider })));
			settings.logger.requests && console.table(response);
		})();
	}, []);

	return (
		<div className='ListView'>
			<h2>{props.title}</h2>

			<div className='wrapper'>
				<List {...props} data={data} columns={columns} rowEvents={rowEvents} create={addNew} defaultSorted={[{ dataField: 'id', order: 'asc' }]} />
				<SidePanel />
			</div>
		</div>
	);
}

export default ListView;