import React from 'react';
import { useTranslation } from "react-i18next";
import i18n from '../../shared/i18n';
import languages from './languages.json';
import ListView from './views/ListView/ListView';
import EditView from './views/EditView/EditView';

import './Providers.scss';

const NS = 'Providers';

const Providers = props => {
	i18n.customLoad(languages, NS);
	const { t } = useTranslation(NS);

	return (
		<div className={NS}>
			{!props.match.params.id && <ListView {...props} />}
			{props.match.params.id && <EditView {...props} />}
		</div>
	)
}

export default Providers;
