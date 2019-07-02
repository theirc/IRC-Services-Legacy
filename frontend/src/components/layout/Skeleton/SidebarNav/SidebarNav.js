import React from 'react';
import { useTranslation } from "react-i18next";
import Button from 'react-bootstrap/Button';
import actions from '../actions';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import './SidebarNav.scss';

const SidebarNav = props => {
	const { t, i18n } = useTranslation();

	return (
		<nav className={`SidebarNav ${props.isOpen ? 'open' : 'closed'}`}>
			<ul>
				<li className={props.location.pathname.includes('services') && 'active'}>
					<Link to='/services'><img src={process.env.PUBLIC_URL + '/static/assets/Skeleton/SidebarNav/nav-services.png'} />Services</Link>
				</li>
				<li>
					<a target='_blank' href='https://www.refugee.info/'><img src={process.env.PUBLIC_URL + '/static/assets/Skeleton/SidebarNav/nav-service-map.png'} />Service map</a>
				</li>
				<hr /> {/* Separator */}
				<li className={props.location.pathname.includes('providers') && 'active'}>
					<Link to='/providers'><img src={process.env.PUBLIC_URL + '/static/assets/Skeleton/SidebarNav/nav-providers.png'} />Service providers</Link>
				</li>
				<li className={props.location.pathname.includes('regions') && 'active'}>
					<Link to='/regions'><img src={process.env.PUBLIC_URL + '/static/assets/Skeleton/SidebarNav/nav-regions.png'} />Regions</Link>
				</li>
				<li className={props.location.pathname.includes('service-categories') && 'active'}>
					<Link to='service-categories'><img src={process.env.PUBLIC_URL + '/static/assets/Skeleton/SidebarNav/nav-service-categories.png'} />Service categories</Link>
				</li>
				<li className={props.location.pathname.includes('provider-types') && 'active'}>
					<Link to='provider-types'><img src={process.env.PUBLIC_URL + '/static/assets/Skeleton/SidebarNav/nav-provider-types.png'} />Provider types</Link>
				</li>
				<hr /> {/* Separator */}
				<li className={props.location.pathname.includes('settings') && 'active'}>
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
		setUser: user => dispatch(actions.setUser(user)),
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(SidebarNav);
