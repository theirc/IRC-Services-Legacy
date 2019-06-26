import React from 'react';
import Header from './Header/Header';
import SidebarNav from './SidebarNav/SidebarNav';
import Canvas from './Canvas/Canvas';
import SidePanel from './SidePanel/SidePanel';
import Footer from './Footer/Footer';
import { useTranslation } from "react-i18next";

import './Skeleton.scss';

const Skeleton = props => {
	const { t, i18n } = useTranslation();

	return (
		<div className='Skeleton'>
			<Header />
			<SidebarNav />
			<Canvas {...props} />
			<SidePanel />
			<Footer />
		</div>
	)
}

export default Skeleton;
