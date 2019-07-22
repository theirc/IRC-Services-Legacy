import React, { useEffect, useState } from 'react';
// import Edit from '../../../../components/views/Edit/Edit';
import { Button, Form, Tab, Tabs } from 'react-bootstrap';
import { CirclePicker } from 'react-color';
import api from '../../api';

import './EditView.scss';
import Edit from '../../../../components/views/Edit/Edit';

const EditView = props => {
	const [data, setData] = useState([]);
	const [isSaving, setIsSaving] = useState(false);
	const [isNew, setIsNew] = useState(false);

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
	
	const handleChange = (event) => {
		event.persist();
		setData(data => ({ ...data, [event.target.name]: event.target.value }));
	};

	const handleChangeColor = (color, event) => {
		event.persist();
		setData(data => ({ ...data, color: color.hex }));
	}
	
	useEffect(() => {
		if (props.match.params.id && props.match.params.id !== 'create'){
			(async function fetchData() {
				const response = await api.serviceCategories.getOne(props.match.params.id);
				response.color = response.color.indexOf('#') < 0 ? '#'+response.color : response.color;
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
				color: ''
			};
			setData(newCategory);
		}
		
	}, []);

	const colorOptions = ['#F44E3B', '#FE9200', '#FCDC00', '#DBDF00', '#A4DD00', '#68CCCA', '#73D8FF', '#AEA1FF', '#FDA1FF', '#333333', '#808080', '#cccccc', '#D33115', '#E27300', '#FCC400', '#B0BC00', '#68BC00', '#16A5A5', '#009CE0', '#7B64FF', '#FA28FF', '#000000', '#666666', '#B3B3B3', '#9F0500', '#C45100', '#FB9E00', '#808900', '#194D33', '#0C797D', '#0062B1', '#653294', '#AB149E','#4D4D4D', '#999999', ]

	return (
		<div className='EditView'>
			{ (!data.name && data.id !== 0) && <p>loading...</p> }
			{(!!data.name || data.id === 0) &&
			<Edit title='Service Category' {...props}>
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
						
					<Form.Group controlId='formColor'>
						<Form.Label>Color</Form.Label>
							<Form.Control type='color' className='color-input' name='color' disabled value={data.color}  />
							<CirclePicker width={'100%'} className='circle-picker' colors={colorOptions} onChangeComplete={handleChangeColor} />
					</Form.Group>
					
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