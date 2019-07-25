import React from 'react';
import { Button } from 'react-bootstrap';
import { useTranslation } from "react-i18next";
import { connect } from 'react-redux';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import Actions from './Actions/Actions';
import skeletonActions from '../../layout/Skeleton/actions';
import i18n from '../../../shared/i18n';
import languages from './languages.json';


import './List.scss';

const NS = 'List';

const List = ({ data, columns, rowEvents, darkMode, resultsPerPage, setResultsPerPage, defaultSorted, create }) => {
	i18n.customLoad(languages, NS);
	const { t } = useTranslation(NS);

	const onSizePerPageChange = (sizePerPage, page) => {
		setResultsPerPage(sizePerPage);
	}

	const options = {
		hidePageListOnlyOnePage: true,
		onSizePerPageChange: onSizePerPageChange,
		pageStartIndex: 0,
		sizePerPage: resultsPerPage,
	};

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
								defaultSorted={defaultSorted}
								pagination={paginationFactory(options)}
								rowEvents={rowEvents}
								selectRow={{ mode: 'checkbox' }}
								striped
							/>
						}
					</div>
				}
			</ToolkitProvider>
			<Button type='button' className='button is-block is-info is-fullwidth btn-add' onClick={create}>{t('create')}</Button>
		</div>
	)
}

const mapStateToProps = state => ({
	darkMode: state.skeleton.darkMode,
	resultsPerPage: state.skeleton.resultsPerPage,
});

const mapDispatchToProps = dispatch => {
	return {
		setResultsPerPage: resultsPerPage => dispatch(skeletonActions.setResultsPerPage(resultsPerPage)),
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(List);
