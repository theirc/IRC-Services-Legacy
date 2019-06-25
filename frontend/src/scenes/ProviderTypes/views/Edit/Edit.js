import React from 'react';
import { useTranslation } from "react-i18next";
import EditView from '../../../../components/views/Edit/Edit';
import './Edit.scss';

const Edit = props => {
	const { t, i18n } = useTranslation();

	return <EditView {...props} />
}

export default Edit;
