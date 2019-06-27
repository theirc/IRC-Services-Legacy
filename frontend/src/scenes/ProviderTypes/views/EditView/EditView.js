import React from 'react';
import { useTranslation } from "react-i18next";
import Edit from '../../../../components/views/Edit/Edit';
import './Edit.scss';

const EditView = props => {
	const { t, i18n } = useTranslation();

	return <Edit {...props} />
}

export default EditView;
