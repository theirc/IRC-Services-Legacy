import React from 'react';
import { Card } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';


import './Edit.scss';

const Edit = props => {
	const onClick = () => props.history.goBack()

	return (
		<section className={`Edit ${props.darkMode ? 'bg-dark' : ''}`}>
			<Link className='back' onClick={onClick}>&lt; Back</Link>
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

const mapStateToProps = state => ({
	darkMode: state.skeleton.darkMode,
});

export default connect(mapStateToProps)(Edit);
