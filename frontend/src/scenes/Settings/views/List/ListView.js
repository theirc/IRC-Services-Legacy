import React from 'react';
import { useTranslation } from "react-i18next";
import ListView from '../../../../components/views/List/List';
import './List.scss';

const List = props => {
	const { t, i18n } = useTranslation();

	return <ListView {...props} />;
}

export default List;