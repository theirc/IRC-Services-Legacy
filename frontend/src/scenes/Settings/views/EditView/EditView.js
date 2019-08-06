import React from 'react';
import { useTranslation } from "react-i18next";
import Edit from '../../../../components/views/Edit/Edit';

import './Edit.scss';

const Edit = props => {
	const t = props.t;

	return (
	<div className='EditView'>
		<Edit {...props} title={t('edit.title')}/>
	</div>
	);
}

export default Edit;
