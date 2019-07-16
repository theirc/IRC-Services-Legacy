import React from 'react';
import { useTranslation } from "react-i18next";
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';

import './Actions.scss';

const Actions = props => {
	const { t, i18n } = useTranslation();

	return (
		<div className='Actions'>
			<InputGroup className='mb-3 search'>
				<FormControl
					placeholder='Search'
					aria-label='Search'
				/>
				<Button variant="primary">Search</Button>
			</InputGroup>
		</div>
	);
}

export default Actions;
