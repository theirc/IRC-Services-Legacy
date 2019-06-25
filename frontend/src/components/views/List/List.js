import React from 'react';
import { useTranslation } from "react-i18next";
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import cellEditFactory from 'react-bootstrap-table2-editor';
import './List.scss';

const options = {
	// pageStartIndex: 0,
	sizePerPage: 10,
	hideSizePerPage: true,
	hidePageListOnlyOnePage: true
};

const List = ({data, columns}) => {
	const { t, i18n } = useTranslation();

	return (
		<div className='List'>
			<BootstrapTable
				striped
				hover
				keyField='id'
				data={data}
				columns={columns}
				pagination={paginationFactory(options)}
				cellEdit={cellEditFactory({ mode: 'click' })}
				selectRow={{ mode: 'checkbox' }}
			/>
		</div>
	)
}	

export default List;
