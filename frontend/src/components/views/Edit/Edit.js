import React from 'react';
import { useTranslation } from "react-i18next";
import './Edit.scss';

const Edit = props => {
	const { t, i18n } = useTranslation();

	return (
		<div className='Edit'>
			{ props.data &&
				<section>
					<h3>{props.data.name}</h3>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse iaculis auctor arcu sit amet auctor. Suspendisse at pellentesque turpis, ut convallis ligula. Fusce fermentum lectus in enim sollicitudin, imperdiet finibus nunc pretium. Etiam placerat ex non hendrerit tempus. Maecenas eu nisi eu sapien aliquet viverra
				</section>
			}
		</div>
	);
}

export default Edit;
