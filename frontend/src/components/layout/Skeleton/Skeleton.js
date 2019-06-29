import React from 'react';
import Header from './Header/Header';
import SidebarNav from './SidebarNav/SidebarNav';
import Canvas from './Canvas/Canvas';
import SidePanel from './SidePanel/SidePanel';
import Footer from './Footer/Footer';
import { useTranslation } from "react-i18next";
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom'

import './Skeleton.scss';

const Skeleton = props => {
	const { t, i18n } = useTranslation();

	// Redirect to login
	!props.user && document.location.replace('/');
	
	return (
		<div className='Skeleton'>
			<Header {...props} />
			<SidebarNav {...props} />
			<Canvas {...props} />
			<SidePanel {...props} />
			{props.sidebarnav.isOpen}
			<Footer {...props} />
		</div>
	)
}

const mapStateToProps = state => ({
	user: state.login.user,
	sidebarnav: {
		isOpen: state.skeleton.sidebarnav.isOpen
	}
});

export default connect(mapStateToProps)(Skeleton);
