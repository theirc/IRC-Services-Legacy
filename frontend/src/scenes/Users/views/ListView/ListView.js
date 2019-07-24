import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
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
				return { width: '50%' };
			}
		}, {
			dataField: 'email',
			text: 'email',
			sort: true,
			headerStyle: () => {
				return { width: '42%' };
			}
		}
	];

	const [data, setData] = useState([]);

	const rowEvents = {
		onClick: (e, row, rowIndex) => props.history.push(`/users/${row.id}`)
	};

	const addNew = () => {
		props.history.push(`/users/create`);
	};

	useEffect(() => {
		(async function fetchData() {
			const response = await api.users.listAll();
			setData(response.map(e => ({
				id: e.id,
				name: `${e.name} ${e.surname}`,
				email: e.email,
				groups: e.groups
			})));
			settings.logger.requests && console.table(response);
		})();
	}, []);

	return (
		<div className='ListView'>
			<h2>USERS</h2>
			<Button type="button" className="button is-block is-info is-fullwidth btn-add" onClick={addNew}>+ Add New</Button>

			<List {...props} data={data} columns={columns} rowEvents={rowEvents} defaultSorted={[{ dataField: 'id', order: 'asc' }]} />
		</div>
	);
}

export default ListView;
