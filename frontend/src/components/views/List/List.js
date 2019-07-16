import React from 'react';
import { useTranslation } from "react-i18next";
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import cellEditFactory from 'react-bootstrap-table2-editor';
import filterFactory from 'react-bootstrap-table2-filter';
import Actions from './Actions/Actions';
import { connect } from 'react-redux';

import './List.scss';

const options = {
	// pageStartIndex: 0,
	sizePerPage: 10,
	hideSizePerPage: true,
	hidePageListOnlyOnePage: true
};

const List = ({data, columns, rowEvents, darkMode}) => {
	const { t, i18n } = useTranslation();

	return (
		<div className={`List ${darkMode ? 'bg-dark' : ''}`}>
			<Actions />
			{ !data.length && <p>loading...</p> }
			{ !!data.length &&
				<BootstrapTable
					// cellEdit={cellEditFactory({ mode: 'click' })}
					columns={columns}
					data={data}
					filter={filterFactory()}
					hover
					keyField='id'
					pagination={paginationFactory(options)}
					rowEvents={rowEvents}
					selectRow={{ mode: 'checkbox' }}
					striped
				/>
			}
		</div>
	)
}	

const mapStateToProps = state => ({
	darkMode: state.skeleton.darkMode,
});

export default connect(mapStateToProps)(List);
