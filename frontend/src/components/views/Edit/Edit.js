import React from 'react';
import { useTranslation } from "react-i18next";
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import './Edit.scss';

const Edit = props => {
	const { t, i18n } = useTranslation();

	const onClick = () => props.history.goBack()

	return (
		<section>
			<Link onClick={onClick}>&lt; Back</Link>
			<h2>{props.title}</h2>
			<Card>
				<Card.Body>
					<Card.Text>
					{props.children}
					</Card.Text>
				</Card.Body>	
			</Card>
			
		</section>
		
	);
}

export default Edit;
