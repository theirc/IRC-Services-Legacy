import React, { useEffect, useState } from 'react';
import Edit from '../../../../components/views/Edit/Edit';
import api from '../../api';

import './EditView.scss';

const EditView = props => {
	const [data, setData] = useState([]);

	const t = props.t;

	useEffect(() => {
		(async function fetchData() {
			const response = await api.regions.getOne(props.match.params.id);
			setData(response);
		})();
	}, []);

	const onClick = () => props.history.goBack()

	return (
		<div className='EditView'>
			<Edit {...props} data={data} title={t('edit.title')} />
		</div>
	);
}

export default EditView;