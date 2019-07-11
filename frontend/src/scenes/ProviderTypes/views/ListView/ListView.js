import React, { useEffect, useState } from 'react';
// import { textFilter } from 'react-bootstrap-table2-filter';
import List from '../../../../components/views/List/List';
import api from '../../api';
import './ListView.scss';
import Button from 'react-bootstrap/Button';

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
		}
	];

	const [data, setData] = useState([]);

	const rowEvents = {
		onClick: (e, row, rowIndex) => props.history.push(`/provider-types/${row.id}`)
	};

	const addNew = () => {
		props.history.push(`/provider-types/create`);
	}
	
	useEffect(() => {
		let list = sessionStorage.getItem('providerTypes') ? JSON.parse(sessionStorage.getItem('providerTypes')) : null;
		if (list)
		{
			setData(list.map(e => ({id: e.id, name: e.name})));
		}else{
			(async function fetchData() {
				const response = await api.providerTypes.getAll();
				setData(response.map(e => ({id: e.id, name: e.name})));
				console.log(response);
				sessionStorage.setItem('providerTypes', JSON.stringify(response));
			})();
		}
		
	}, []);

	return (
		<div className='ListView'>
			<h2>PROVIDER TYPES</h2>
			<Button type="button" className="button is-block is-info is-fullwidth btn-add" onClick={addNew}>+ Add New</Button>
 
			<List {...props} data={data} columns={columns} rowEvents={rowEvents}/>
		</div>
	);
}

export default ListView;