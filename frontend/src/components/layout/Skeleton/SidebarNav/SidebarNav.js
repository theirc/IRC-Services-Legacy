import React from 'react';
import { useTranslation } from "react-i18next";
import Button from 'react-bootstrap/Button';
import actions from '../actions';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import './SidebarNav.scss';

const SidebarNav = props => {
	const { t, i18n } = useTranslation();

	const onClick = (e) => {
		props.setSidebarNavOpen(!props.isOpen);
	};

	return (
		<nav className={`SidebarNav ${props.isOpen ? 'open' : 'closed'}`}>
			<div className='header'>
				<Button variant='outline-secondary' size='sm' onClick={onClick}>x</Button>
			</div>
			<ul>
				<li><img src={process.env.PUBLIC_URL + '/static/assets/Skeleton/SidebarNav/nav-services.png'} /><Link to='/services' >Services</Link></li>
				<li><img src={process.env.PUBLIC_URL + '/static/assets/Skeleton/SidebarNav/nav-service-map.png'} /><a href='https://www.refugee.info/' >Service map</a></li>
				<hr />
				<li><img src={process.env.PUBLIC_URL + '/static/assets/Skeleton/SidebarNav/nav-providers.png'} /><Link to='/providers' >Service providers</Link></li>
				<li><img src={process.env.PUBLIC_URL + '/static/assets/Skeleton/SidebarNav/nav-regions.png'} /><Link to='/regions' >Regions</Link></li>
				<li><img src={process.env.PUBLIC_URL + '/static/assets/Skeleton/SidebarNav/nav-service-categories.png'} /><Link to='service-categories' >Service categories</Link></li>
				<li><img src={process.env.PUBLIC_URL + '/static/assets/Skeleton/SidebarNav/nav-provider-types.png'} /><Link to='provider-types' >Provider types</Link></li>
				<hr />
				<li><img src={process.env.PUBLIC_URL + '/static/assets/Skeleton/SidebarNav/nav-settings.png'} /><Link to='/settings' >Settings</Link></li>
			</ul>
		</nav>
	)
}

const mapStateToProps = (state, props) => ({
	isOpen: state.skeleton.sidebarnav.isOpen
});

const mapDispatchToProps = dispatch => {
	return {
		setSidebarNavOpen: isOpen => dispatch(actions.setSidebarNavOpen(isOpen)),
		setUser: user => dispatch(actions.setUser(user)),
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(SidebarNav);
