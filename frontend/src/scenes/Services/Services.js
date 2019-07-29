import React from 'react';
import { useTranslation } from "react-i18next";
import i18n from '../../shared/i18n';
import languages from './languages.json';
import ListView from './views/ListView/ListView';
import EditView from './views/EditView/EditView';

import './Services.scss';

const NS = 'Services';

const Services = props => {
	i18n.customLoad(languages, NS);
	const { t } = useTranslation(NS);

	return (
		<div className={NS}>
			{!props.match.params.id && <ListView {...props} t={t} />}
			{props.match.params.id && <EditView {...props} t={t} />}
		</div>
	)
}

export default Services;
