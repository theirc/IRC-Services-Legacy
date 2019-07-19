import React, { useEffect, useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../api';

import './EditView.scss';

const EditView = props => {
	const [data, setData] = useState([]);

	const [isSaving, setIsSaving] = useState(false);
	const [isNew, setIsNew] = useState(false);


	const handleSubmit = (event) => {
		setIsSaving(true);
		if (event) event.preventDefault();
		(async function save(){
			const response = await api.users.save(data);
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
				const response = await api.users.getOne(props.match.params.id);
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

	const onClick = () => props.history.goBack()

	return (
		<div>
			<Link onClick={onClick}>&lt; Back</Link>
			<Card>
				<Card.Body>
					<Card.Title>User</Card.Title>
					<Card.Text>
						<Form onSubmit={handleSubmit}>
							<Form.Group controlId='formEmail'>
								<Form.Label>Email</Form.Label>
									<Form.Control type='text' name='email' onChange={handleChange} value={data.email} required />
							</Form.Group>
							<Form.Group controlId='formName'>
								<Form.Label>Name</Form.Label>
									<Form.Control type='text' name='name' onChange={handleChange} value={data.name} required />
							</Form.Group>
							<Form.Group controlId='formName_es'>
								<Form.Label>Last Name</Form.Label>
								<Form.Control type='text' name='surname' onChange={handleChange} value={data.surname}  />
							</Form.Group>
							<Form.Group controlId='formName_es'>
								<Form.Label>Language</Form.Label>
								<Form.Control type='text' name='language' onChange={handleChange} value={data.language}  />
							</Form.Group>
							<Form.Group controlId='formName_es'>
								<Form.Label>Title</Form.Label>
								<Form.Control type='text' name='title' onChange={handleChange} value={data.title}  />
							</Form.Group>
							
							{!isSaving && 
							<Button type="submit"  className="button is-block is-info is-fullwidth">Save</Button>
							}
							{!!isSaving && <p>Saving Service Type...</p>}
						</Form>
					
					</Card.Text>
				</Card.Body>	
			</Card>
		</div>
	);
}

export default EditView;