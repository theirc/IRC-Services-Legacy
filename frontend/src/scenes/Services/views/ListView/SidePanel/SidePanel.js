import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
// import { useTranslation } from "react-i18next";
import { connect } from 'react-redux';
import serviceCategoriesApi from '../../../../ServiceCategories/api';
import providersApi from '../../../../Providers/api';
import regionsApi from '../../../../Regions/api';
import settings from '../../../../../shared/settings';

import './SidePanel.scss';

const api = {
	providers: providersApi.providers,
	regions: regionsApi.regions,
	serviceCategories: serviceCategoriesApi.serviceCategories,
};

const SidePanel = props => {
	// const { t, i18n } = useTranslation();

	const [ serviceCategories, setServiceCategories ] = useState([]);
	const [ countries, setCountries ] = useState([]);
	const [ providers, setProviders ] = useState([]);

	// Same effect to queue requests asynchronously for performance
	useEffect(() => {
		(async function fetchData() {
			// Service Categories
			let response = await api.serviceCategories.listAll();
			setServiceCategories(response);
			settings.logger.requests && console.log(response);

			// Regions
			response = await api.regions.listCountries();
			setCountries(response);
			settings.logger.requests && console.log(response);

			// Providers
			response = await api.providers.listAll();
			setProviders(response);
			settings.logger.requests && console.log(response);

			// Region/Area
			// City
		})();
	}, []);

	return (
		<div className={`SidePanel ${props.darkMode ? 'bg-dark' : ''}`}>
			<h2>SORT &amp; FILTER</h2>
			<hr />
			<Form>
				<Form.Group controlId="exampleForm.ControlSelect1">
					<Form.Label>Category</Form.Label>
					<Form.Control as="select">
						{serviceCategories && serviceCategories.map(e => <option value={e.id}>{e.name}</option>)}
					</Form.Control>
				</Form.Group>
				<Form.Group controlId="exampleForm.ControlSelect1">
					<Form.Label>Country</Form.Label>
					<Form.Control as="select">
						{countries && countries.map(e => <option value={e.id}>{e.name}</option>)}
					</Form.Control>
				</Form.Group>
				<Form.Group controlId="exampleForm.ControlSelect1">
					<Form.Label>Provider</Form.Label>
					<Form.Control as="select">
						{providers && providers.map(e => <option value={e.id}>{e.name}</option>)}
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
