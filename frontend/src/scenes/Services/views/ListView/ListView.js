import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
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

	const t = props.t;
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
			settings.logger.requests && console.log(response);
		})();
	}, []);

	return (
		<div className='ListView'>
			<h2>{t('list.title')}</h2>
			<div className='wrapper'>
				<List {...props} data={data} columns={columns} enableFilter={true} rowEvents={rowEvents} create={addNew} defaultSorted={[{ dataField: 'id', order: 'asc' }]} />
				{props.showFilter && <SidePanel />}
			</div>
		</div>
	);
}

const mapStateToProps = state => ({
	showFilter: state.skeleton.showFilter,
});

export default connect(mapStateToProps)(ListView);