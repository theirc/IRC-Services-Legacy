import React from 'react';
import { useTranslation } from "react-i18next";
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import Actions from './Actions/Actions';
import { connect } from 'react-redux';

import './List.scss';

const options = {
	hidePageListOnlyOnePage: true,
	pageStartIndex: 0,
	sizePerPage: 25,
};

const List = ({ data, columns, rowEvents, darkMode }) => {
	const { t, i18n } = useTranslation();

	return (
		<div className={`List ${darkMode ? 'bg-dark' : ''}`}>
			<ToolkitProvider
				bootstrap4
				columns={columns}
				data={data}
				keyField='id'
				search={{ defaultSearch: '' }}
			>
				{props =>
					<div>
						<Actions {...props} />
						{!data.length && <p>loading...</p>}
						{!!data.length &&
							<BootstrapTable {...props.baseProps}
								hover
								pagination={paginationFactory(options)}
								rowEvents={rowEvents}
								selectRow={{ mode: 'checkbox' }}
								striped
							/>
						}
					</div>
				}
			</ToolkitProvider>
		</div>
	)
}

const mapStateToProps = state => ({
	darkMode: state.skeleton.darkMode,
});

export default connect(mapStateToProps)(List);
