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
				<li>
					<Link to='/services'><img src={process.env.PUBLIC_URL + '/static/assets/Skeleton/SidebarNav/nav-services.png'} />Services</Link>
				</li>
				<li>
					<a target='_blank' href='https://www.refugee.info/'><img src={process.env.PUBLIC_URL + '/static/assets/Skeleton/SidebarNav/nav-service-map.png'} />Service map</a>
				</li>
				<hr /> {/* Separator */}
				<li>
					<Link to='/providers'><img src={process.env.PUBLIC_URL + '/static/assets/Skeleton/SidebarNav/nav-providers.png'} />Service providers</Link>
				</li>
				<li>
					<Link to='/regions'><img src={process.env.PUBLIC_URL + '/static/assets/Skeleton/SidebarNav/nav-regions.png'} />Regions</Link>
				</li>
				<li>
					<Link to='service-categories'><img src={process.env.PUBLIC_URL + '/static/assets/Skeleton/SidebarNav/nav-service-categories.png'} />Service categories</Link>
				</li>
				<li>
					<Link to='provider-types'><img src={process.env.PUBLIC_URL + '/static/assets/Skeleton/SidebarNav/nav-provider-types.png'} />Provider types</Link>
				</li>
				<hr /> {/* Separator */}
				<li>
					<Link to='/settings'><img src={process.env.PUBLIC_URL + '/static/assets/Skeleton/SidebarNav/nav-settings.png'} />Settings</Link>
				</li>
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
