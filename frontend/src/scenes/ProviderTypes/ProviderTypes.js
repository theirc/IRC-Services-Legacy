import React from 'react';
import { useTranslation } from "react-i18next";
import i18n from '../../shared/i18n';
import languages from './languages.json';
import './ProviderTypes.scss';

const NS = 'ProviderTypes';

const ProviderTypes = props => {
	const { t } = useTranslation(NS);
	i18n.customLoad(languages, NS);
	
	return <div className={NS}>{t('title')}</div>
}

export default ProviderTypes;
