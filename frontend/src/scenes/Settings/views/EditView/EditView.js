import React from 'react';
import { useTranslation } from "react-i18next";
import Edit from '../../../../components/views/Edit/Edit';

import './Edit.scss';

const Edit = props => {
	const { t, i18n } = useTranslation();

	return (
	<div className='EditView'>
		<Edit {...props} />
	</div>
	);
}

export default Edit;
