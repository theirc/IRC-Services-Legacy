import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Edit from '../../../../components/views/Edit/Edit';
import api from '../../api';

import './EditView.scss';

const EditView = props => {
	const [data, setData] = useState([]);

	useEffect(() => {
		(async function fetchData() {
			const response = await api.regions.getOne(props.match.params.id);
			setData(response);
		})();
	}, []);

	const onClick = () => props.history.goBack()

	return (
		<div className='EditView'>
			<Edit title='Region' {...props} data={data} />
		</div>
	);
}

export default EditView;