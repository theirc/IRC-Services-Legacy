import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import List from '../../../../components/views/List/List';
import SidePanel from './SidePanel/SidePanel';
import api from '../../api';

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
			setData(response.map(e => ({
				id: e.id,
				name: e.name,
				provider: e.provider
			})));
			console.log(response);
		})();
	}, []);

	return (
		<div className='ListView'>
			<h2>SERVICES</h2>
			<Button type="button" className="button is-block is-info is-fullwidth btn-add" onClick={addNew}>+ Add New</Button>

			<div className='wrapper'>
				<List {...props} data={data} columns={columns} rowEvents={rowEvents} defaultSorted={[{ dataField: 'id', order: 'asc' }]} />
				<SidePanel />
			</div>
		</div>
	);
}

export default ListView;