import React from 'react';
import { useTranslation } from "react-i18next";
import Button from 'react-bootstrap/Button';
import actions from '../actions';
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
				<li><img src={process.env.PUBLIC_URL + '/static/assets/Skeleton/SidebarNav/nav-services.png'} /><a href='#'>Services</a></li>
				<li><img src={process.env.PUBLIC_URL + '/static/assets/Skeleton/SidebarNav/nav-service-map.png'} /><a>Service map</a></li>
				<hr />
				<li><img src={process.env.PUBLIC_URL + '/static/assets/Skeleton/SidebarNav/nav-providers.png'} /><a>Service providers</a></li>
				<li><img src={process.env.PUBLIC_URL + '/static/assets/Skeleton/SidebarNav/nav-regions.png'} /><a>Regions</a></li>
				<li><img src={process.env.PUBLIC_URL + '/static/assets/Skeleton/SidebarNav/nav-service-categories.png'} /><a>Service categories</a></li>
				<li><img src={process.env.PUBLIC_URL + '/static/assets/Skeleton/SidebarNav/nav-provider-types.png'} /><a>Provider types</a></li>
				<hr />
				<li><img src={process.env.PUBLIC_URL + '/static/assets/Skeleton/SidebarNav/nav-settings.png'} /><a>Settings</a></li>
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
