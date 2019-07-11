import React, { useEffect, useState } from 'react';
import api from '../../api';
import { Link } from 'react-router-dom';
import './EditView.scss';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

const EditView = props => {
	const [values, setValues] = useState({});
	const [isSaving, setIsSaving] = useState(false);
	const [isNew, setIsNew] = useState(false);


	const handleSubmit = (event) => {
		setIsSaving(true);
		if (event) event.preventDefault();
		(async function save(){
			const response = await api.providerTypes.saveType(values);
			if (response){
				props.history.goBack()
			}
		})();
		
	};
	
	const handleChange = (event) => {
		event.persist();

		setValues(values => ({ ...values, [event.target.name]: event.target.value }));
	};

	useEffect(() => {
		if (props.match.params.id){
			(async function fetchData() {
				const response = await api.providerTypes.getOne(props.match.params.id);
				setValues(response);
				console.log(values.name);
				setIsSaving(false);
			})();
		}else{
			setIsNew(true);
			let type = {
				id: 0,
				name: '',
				name_en: '',
				name_es: '',
				name_fr: '',
				name_ar: ''
			};
			setValues(type);
		}
		
	}, []);

	const onClick = () => props.history.goBack()

	return (
		<div>
			<Link onClick={onClick}>&lt; Back</Link>
			{ !values.name && <p>loading...</p> }
			{!!values.name &&
			<Form onSubmit={handleSubmit}>
				<Form.Group controlId='formName'>
					<Form.Label>Name (English)</Form.Label>
						<Form.Control type='text' name='name_en' onChange={handleChange} value={values.name_en} required />
				</Form.Group>
				<Form.Group controlId='formName'>
					<Form.Label>Name (Arabic)</Form.Label>
						<Form.Control type='text' name='name_ar' onChange={handleChange} value={values.name_ar}  />
				</Form.Group>
				<Form.Group controlId='formName'>
					<Form.Label>Name (French)</Form.Label>
						<Form.Control type='text' name='name_fr' onChange={handleChange} value={values.name_fr}  />
				</Form.Group>
				<Form.Group controlId='formName'>
					<Form.Label>Name (Spanish)</Form.Label>
						<Form.Control type='text' name='name_es' onChange={handleChange} value={values.name_es}  />
				</Form.Group>
				{!isSaving && 
				<Button type="submit" className="button is-block is-info is-fullwidth">Save</Button>
				}
				{!!isSaving && <p>Saving Provider Type...</p>}
			</Form>
			}
		</div>
	);
}

export default EditView;