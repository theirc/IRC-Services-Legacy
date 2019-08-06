import React from 'react';
// import { useTranslation } from "react-i18next";
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Search } from 'react-bootstrap-table2-toolkit';
import { connect } from 'react-redux';
import skeletonActions from '../../../layout/Skeleton/actions';
import icoFilter from './filter.png';

import './Actions.scss';

const {
	// ClearSearchButton,
	SearchBar
} = Search;

const Actions = props => {
	// const { t, i18n } = useTranslation();

	const handleShowFilter = () => props.setShowFilter(!props.showFilter);

	return (
		<div className='Actions'>
			<SearchBar {...props.searchProps} className='SearchBar' />
			{/* <ClearSearchButton { ...props.searchProps } className='ClearSearchButton' /> */}
			{props.enableFilter &&
				<OverlayTrigger placement='top' overlay={<Tooltip>Filter</Tooltip>} >
					<Button className='filter' onClick={handleShowFilter}><img src={icoFilter} /></Button>
				</OverlayTrigger>
			}
		</div>
	);
}

const mapStateToProps = state => ({
	showFilter: state.skeleton.showFilter,
});

const mapDispatchToProps = dispatch => {
	return {
		setShowFilter: show => dispatch(skeletonActions.setShowFilter(show)),
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(Actions);
