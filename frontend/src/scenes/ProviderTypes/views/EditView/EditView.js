import React, { useEffect, useState } from 'react';
import api from '../../api';
import { Link } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Tabs, Tab, Card } from 'react-bootstrap';
import Edit from '../../../../components/views/Edit/Edit';

import './EditView.scss';

const EditView = props => {
	const [data, setData] = useState({});
	const [isSaving, setIsSaving] = useState(false);
	const [isNew, setIsNew] = useState(false);


	const handleSubmit = (event) => {
		setIsSaving(true);
		if (event) event.preventDefault();
		(async function save(){
			const response = await api.providerTypes.saveType(data);
			if (response){
				sessionStorage.removeItem('providerTypes');
				props.history.goBack();
			}
		})();
		
	};
	
	const handleChange = (event) => {
		event.persist();

		setData(data => ({ ...data, [event.target.name]: event.target.value }));
	};

	useEffect(() => {
		if (props.match.params.id && props.match.params.id !== 'create'){
			(async function fetchData() {
				const response = await api.providerTypes.getOne(props.match.params.id);
				setData(response);
				setIsSaving(false);
			})();
		}else{
			setIsNew(true);
			let newType = {
				id: 0,
				name: '',
				name_en: '',
				name_es: '',
				name_fr: '',
				name_ar: ''
			};
			setData(newType);
		}
		
	}, []);


	return (
		<div>
			{ (!data.name && data.id !== 0) && <p>loading...</p> }
			{(!!data.name || data.id === 0) &&
			<Edit title='Provider Type' {...props}>
				<Form onSubmit={handleSubmit}>
						<Tabs defaultActiveKey="english" transition={false} id="noanim-tab-example">
							<Tab eventKey="english" title="English">
								<Form.Group controlId='formName'>
									<Form.Label>Name (English)</Form.Label>
										<Form.Control type='text' name='name_en' onChange={handleChange} value={data.name_en} required />
								</Form.Group>
							</Tab>
							<Tab eventKey="spanish" title="Spanish">
							<Form.Group controlId='formName_es'>
								<Form.Label>Name (Spanish)</Form.Label>
									<Form.Control type='text' name='name_es' onChange={handleChange} value={data.name_es}  />
								</Form.Group>
							</Tab>
							<Tab eventKey="arabic" title="Arabic">
								<Form.Group controlId='formName_ar'>
									<Form.Label>Name (Arabic)</Form.Label>
										<Form.Control type='text' name='name_ar' onChange={handleChange} value={data.name_ar}  />
								</Form.Group>
							</Tab>
							<Tab eventKey="french" title="French">
								<Form.Group controlId='formName_fr'>
									<Form.Label>Name (French)</Form.Label>
										<Form.Control type='text' name='name_fr' onChange={handleChange} value={data.name_fr}  />
								</Form.Group>
							</Tab>
						</Tabs>
						{!isSaving && 
						<Button type="submit"  className="button is-block is-info is-fullwidth">Save</Button>
						}
						{!!isSaving && <p>Saving Service Type...</p>}
					</Form>
			</Edit>
			}	
			
			
			
		</div>
	);
}

export default EditView;