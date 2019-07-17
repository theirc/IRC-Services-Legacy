import React, { useEffect, useState } from 'react';
// import { textFilter } from 'react-bootstrap-table2-filter';
import List from '../../../../components/views/List/List';
import api from '../../api';
import Button from 'react-bootstrap/Button';

import './ListView.scss';

const ListView = props => {
	const columns = [
		{
			dataField: 'id',
			text: 'ID',
			sort: true
		}, {
			dataField: 'name',
			text: 'Name',
			sort: true,
			// filter: textFilter()
		}, {
			dataField: 'parent',
			text: 'Parent',
			sort: true,
		}
	];

	const [data, setData] = useState([]);

	const rowEvents = {
		onClick: (e, row, rowIndex) => props.history.push(`/regions/${row.id}`)
	};

	const addNew = () => {
		props.history.push(`/regions/create`);
	}
	
	useEffect(() => {
		(async function fetchData() {
			const response = await api.regions.listAll();
			setData(response.map(e => ({id: e.id, name: e.name, parent: e.parent__name})));
		})();
	}, []);

	return (
		<div className='ListView'>
			<h2>REGIONS</h2>
			<Button type="button" className="button is-block is-info is-fullwidth btn-add" onClick={addNew}>+ Add New</Button>

			<List {...props} data={data} columns={columns} rowEvents={rowEvents}/>
		</div>
	);
}

export default ListView;