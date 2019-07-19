import React from 'react';
import { Button, Form } from 'react-bootstrap';
import { useTranslation } from "react-i18next";
import { connect } from 'react-redux';

import './SidePanel.scss';

const SidePanel = props => {
	const { t, i18n } = useTranslation();

	return (
		<div className={`SidePanel ${props.darkMode ? 'bg-dark' : ''}`}>
			<h2>SORT &amp; FILTER</h2>
			<hr />
			<Form>
				<Form.Group controlId="exampleForm.ControlSelect1">
					<Form.Label>Category</Form.Label>
					<Form.Control as="select">
						<option>Cat 1</option>
						<option>Cat 2</option>
					</Form.Control>
				</Form.Group>
				<Form.Group controlId="exampleForm.ControlSelect1">
					<Form.Label>Country</Form.Label>
					<Form.Control as="select">
						<option>Country 1</option>
						<option>Country 2</option>
					</Form.Control>
				</Form.Group>
				<Form.Group controlId="exampleForm.ControlSelect1">
					<Form.Label>Provider</Form.Label>
					<Form.Control as="select">
						<option>Red Cross</option>
						<option>Country 2</option>
					</Form.Control>
				</Form.Group>
				<hr />
				<h3>Advanced Options</h3>
				<Form.Group controlId="exampleForm.ControlSelect1">
					{/* <Form.Label>Country</Form.Label> */}
					<Form.Control as="select">
						<option>Region / Area</option>
						<option>Option 2</option>
					</Form.Control>
				</Form.Group>
				<Form.Group controlId="exampleForm.ControlSelect1">
					{/* <Form.Label>Country</Form.Label> */}
					<Form.Control as="select">
						<option>City</option>
						<option>Option 2</option>
					</Form.Control>
				</Form.Group>
				<h3>Status</h3>
				<Form.Check inline custom type={'radio'} label={'Public'} />
				<Form.Check inline custom type={'radio'} label={'Private'} />
				<Form.Check inline custom type={'radio'} label={'Draft'} />
				<Button block variant="primary" size="lg" active>Apply</Button>
			</Form>
		</div>
	)
}

const mapStateToProps = state => ({
	darkMode: state.skeleton.darkMode,
});

export default connect(mapStateToProps)(SidePanel);
