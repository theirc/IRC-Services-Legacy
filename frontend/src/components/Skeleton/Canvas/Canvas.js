import React from 'react';
import { useTranslation } from "react-i18next";
import './Canvas.scss';

const Canvas = props => {
	const { t, i18n } = useTranslation();

	return <div className='Canvas'>{props.children}</div>
}

export default Canvas;
