import React from 'react';
import { useTranslation } from "react-i18next";
import { Search } from 'react-bootstrap-table2-toolkit';

import './Actions.scss';

const { SearchBar } = Search;

const Actions = props => {
	const { t, i18n } = useTranslation();

	return (
		<div className='Actions'>
			<SearchBar {...props.searchProps} className='SearchBar' />
		</div>
	);
}

export default Actions;
