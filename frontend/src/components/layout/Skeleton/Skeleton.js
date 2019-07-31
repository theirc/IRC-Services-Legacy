import React, { useState } from 'react';
import IdleTimer from 'react-idle-timer';
import { connect } from 'react-redux';
import Canvas from './Canvas/Canvas';
import Header from './Header/Header';
import SessionTimer from './SessionTimer/SessionTimer';
import SidebarNav from './SidebarNav/SidebarNav';
// import Footer from './Footer/Footer';
import loginActions from '../../../scenes/Login/actions';

import './Skeleton.scss';




const Skeleton = props => {
	const [show, setShow] = useState(false);

	let idleTimer = null;

	return (
		<div className='Skeleton'>
			<IdleTimer ref={ref => idleTimer = ref} onIdle={() => setShow(true)} timeout={1000 * 60 * props.logoutTimeout} />
			<Header {...props} />
			<SidebarNav {...props} />
			<Canvas {...props} />
			{show && <SessionTimer {...props} show={show} timeout={60} onHide={() => setShow(false)} />}
			{/* <Footer {...props} /> */}
		</div>
	)
}

const mapStateToProps = state => ({
	darkMode: state.skeleton.darkMode,
	sidebarnav: {
		isOpen: state.skeleton.sidebarnav.isOpen
	},
	logoutTimeout: state.settings.logoutTimeout
});

const mapDispatchToProps = dispatch => {
	return {
		logOut: () => dispatch(loginActions.setUser(null))
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(Skeleton);
