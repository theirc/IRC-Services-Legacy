import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Row, Tab, Tabs } from 'react-bootstrap';
import Edit from '../../../../components/views/Edit/Edit';
import api from '../../api';

import './EditView.scss';

const EditView = props => {
	const [data, setData] = useState([]);
	const [isSaving, setIsSaving] = useState(false);
	const [isNew, setIsNew] = useState(false);

	const t = props.t;

	useEffect(() => {
		if (props.match.params.id && props.match.params.id !== 'create'){
			(async function fetchData() {
				const response = await api.providers.getOne(props.match.params.id);
				setData(response);
				setIsSaving(false);
			})();
		}else{
			setIsNew(true);
			let newCategory = {
				id: 0,
				name: '',
				name_en: '',
				name_es: '',
				name_fr: '',
				name_ar: '',
				description_en: '',
				description_es: '',
				description_fr: '',
				description_ar: '',
				address_en: '',
				address_es: '',
				address_fr: '',
				address_ar: '',
				region: ''
			};
			setData(newCategory);
		}
		(async function fetchData() {
			const response = await api.providers.getOne(props.match.params.id);
			setData(response);
		})();
	}, []);

	const handleChange = (event) => {
		event.persist();

		setData(data => ({ ...data, [event.target.name]: event.target.value }));
	};

	const handleSubmit = (event) => {
		setIsSaving(true);
		if (event) event.preventDefault();
		data.color = data.color.split('#').join('');  //Remove all # from color code
		(async function save(){
			const response = await api.serviceCategories.saveType(data);
			if (response){
				sessionStorage.removeItem('serviceCategories');
				props.history.goBack();
			}
		})();
		
	};

	return (
		<div className='EditView'>
			{ (!data.name && data.id !== 0) && <p>loading...</p> }
			{(!!data.name || data.id === 0) &&
			<Edit {...props} title={t('edit.title')}>
				<Form onSubmit={handleSubmit}>
					<Tabs defaultActiveKey="english" transition={false} id="noanim-tab-example">
						<Tab eventKey="english" title="English">
							<Form.Group controlId='formName'>
								<Form.Label>Name (English)</Form.Label>
									<Form.Control type='text' name='name_en' onChange={handleChange} value={data.name_en} required />
							</Form.Group>
							<Form.Group controlId='formName'>
								<Form.Label>Description (English)</Form.Label>
									<Form.Control type='text' name='description_en' onChange={handleChange} value={data.description_en} required />
							</Form.Group>
							<Form.Group controlId='formName'>
								<Form.Label>Address (English)</Form.Label>
									<Form.Control type='text' name='address_en' onChange={handleChange} value={data.address_en} required />
							</Form.Group>
						</Tab>
						<Tab eventKey="spanish" title="Spanish">
						<Form.Group controlId='formName_es'>
							<Form.Label>Name (Spanish)</Form.Label>
								<Form.Control type='text' name='name_es' onChange={handleChange} value={data.name_es}  />
							</Form.Group>
							<Form.Group controlId='formName'>
								<Form.Label>Description (Spanish)</Form.Label>
									<Form.Control type='text' name='description_es' onChange={handleChange} value={data.description_es} required />
							</Form.Group>
							<Form.Group controlId='formName'>
								<Form.Label>Address (Spanish)</Form.Label>
									<Form.Control type='text' name='address_es' onChange={handleChange} value={data.address_es} required />
							</Form.Group>
						</Tab>
						<Tab eventKey="arabic" title="Arabic">
							<Form.Group controlId='formName_ar'>
								<Form.Label>Name (Arabic)</Form.Label>
									<Form.Control type='text' name='name_ar' onChange={handleChange} value={data.name_ar}  />
							</Form.Group>
							<Form.Group controlId='formName'>
								<Form.Label>Description (Arabic)</Form.Label>
									<Form.Control type='text' name='description_ar' onChange={handleChange} value={data.description_ar} required />
							</Form.Group>
							<Form.Group controlId='formName'>
								<Form.Label>Address (Arabic)</Form.Label>
									<Form.Control type='text' name='address_ar' onChange={handleChange} value={data.address_ar} required />
							</Form.Group>
						</Tab>
						<Tab eventKey="french" title="French">
							<Form.Group controlId='formName_fr'>
								<Form.Label>Name (French)</Form.Label>
									<Form.Control type='text' name='name_fr' onChange={handleChange} value={data.name_fr}  />
							</Form.Group>
							<Form.Group controlId='formName'>
								<Form.Label>Description (French)</Form.Label>
									<Form.Control type='text' name='description_fr' onChange={handleChange} value={data.description_fr} required />
							</Form.Group>
							<Form.Group controlId='formName'>
								<Form.Label>Address (French)</Form.Label>
									<Form.Control type='text' name='address_fr' onChange={handleChange} value={data.address_fr} required />
							</Form.Group>
						</Tab>
					</Tabs>
					<hr></hr>
					<Row>
					<Col sm={6}>
						<Form.Group controlId='formName'>
							<Form.Label>Contact Name</Form.Label>
								<Form.Control type='text' name='address_fr' onChange={handleChange} value={data.address_fr} required />
						</Form.Group>
					</Col>
					<Col sm={6}>
						<Form.Group controlId='formName'>
							<Form.Label>Title</Form.Label>
								<Form.Control type='text' name='address_fr' onChange={handleChange} value={data.address_fr} required />
						</Form.Group>
					</Col>
					</Row>
					<Form.Group controlId='formName'>
						<Form.Label>Type</Form.Label>
							<Form.Control type='text' name='address_fr' onChange={handleChange} value={data.address_fr} required />
					</Form.Group>
					<Form.Group controlId='formName'>
						<Form.Label>Phone Number</Form.Label>
							<Form.Control type='text' name='address_fr' onChange={handleChange} value={data.address_fr} required />
					</Form.Group>
						
					
					
					{!isSaving && 
					<Button type="submit"  className="button is-block is-info is-fullwidth">Save</Button>
					}
					{!!isSaving && <p>Saving Provider...</p>}
				</Form>
			</Edit>
			}
		</div>
	);
}

export default EditView;