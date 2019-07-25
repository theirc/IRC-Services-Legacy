import React, { useEffect, useState } from 'react';
import Edit from '../../../../components/views/Edit/Edit';
import api from '../../api';

import './EditView.scss';

const EditView = props => {
	const [data, setData] = useState([]);

	useEffect(() => {
		(async function fetchData() {
			const response = await api.services.getOne(props.match.params.id);
			setData(response);
		})();
	}, []);

	const onClick = () => props.history.goBack()

	return (
		<div className='EditView'>
			<Edit {...props} data={data} />
		</div>
	);
}

export default EditView;