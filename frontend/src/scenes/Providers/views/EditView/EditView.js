import React, { useEffect, useState } from 'react';
import Edit from '../../../../components/views/Edit/Edit';
import api from '../../api';
import { Link } from 'react-router-dom';

import './EditView.scss';

const EditView = props => {
	const [data, setData] = useState([]);

	useEffect(() => {
		(async function fetchData() {
			const response = await api.providers.getOne(props.match.params.id);
			setData(response);
		})();
	}, []);

	const onClick = () => props.history.goBack()

	return (
		<div className='EditView'>
			<div className='back'>
				<Link onClick={onClick}>&lt; Back</Link>
			</div>
			<h2>{data.name}</h2>
			<Edit {...props} data={data} />
			<Edit {...props} data={data} />
			<Edit {...props} data={data} />
			<Edit {...props} data={data} />
			<Edit {...props} data={data} />
			<Edit {...props} data={data} />
		</div>
	);
}

export default EditView;