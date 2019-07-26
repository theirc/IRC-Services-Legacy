import React from 'react';
import { useTranslation } from "react-i18next";
import List from '../../../../components/views/List/List';

import './ListView.scss';

const ListView = props => {
	const { t, i18n } = useTranslation();

	return <List {...props} />;
}

export default ListView;