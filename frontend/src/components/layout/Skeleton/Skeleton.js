import React from 'react';
import Header from './Header/Header';
import SidebarNav from './SidebarNav/SidebarNav';
import Canvas from './Canvas/Canvas';
import SidePanel from './SidePanel/SidePanel';
import Footer from './Footer/Footer';
import { useTranslation } from "react-i18next";
import { connect } from 'react-redux';
import actions from './actions'

import './Skeleton.scss';

const Skeleton = props => {
	const { t, i18n } = useTranslation();

	return (
		<div className='Skeleton'>
			<Header {...props} />
			<SidebarNav {...props} />
			<Canvas {...props} />
			{/* <SidePanel {...props} /> */}
			{/* <Footer {...props} /> */}
		</div>
	)
}

const mapStateToProps = state => ({
	darkMode: state.skeleton.darkMode,
	sidebarnav: {
		isOpen: state.skeleton.sidebarnav.isOpen
	}
});

export default connect(mapStateToProps)(Skeleton);
