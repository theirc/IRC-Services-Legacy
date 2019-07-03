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
				<li className={props.location.pathname.includes('services') && 'active'} onClick={() => props.history.push('/services')}>
					<img src={'/public/static/assets/Skeleton/SidebarNav/nav-services.png'} />
					Services
				</li>
				<li>
					<a target='_blank' href='https://www.refugee.info/'><img src={'/public/static/assets/Skeleton/SidebarNav/nav-service-map.png'} />Service map</a>
				</li>
				<hr /> {/* Separator */}
				<li className={props.location.pathname.includes('providers') && 'active'} onClick={() => props.history.push('/providers')}>
					<img src={'/public/static/assets/Skeleton/SidebarNav/nav-providers.png'} />
					Service providers
				</li>
				<li className={props.location.pathname.includes('regions') && 'active'} onClick={() => props.history.push('/regions')}>
					<img src={'/public/static/assets/Skeleton/SidebarNav/nav-regions.png'} />
					Regions
				</li>
				<li className={props.location.pathname.includes('service-categories') && 'active'} onClick={() => props.history.push('/service-categories')}>
					<img src={'/public/static/assets/Skeleton/SidebarNav/nav-service-categories.png'} />
					Service categories
				</li>
				<li className={props.location.pathname.includes('provider-types') && 'active'} onClick={() => props.history.push('/provider-types')}>
					<img src={'/public/static/assets/Skeleton/SidebarNav/nav-provider-types.png'} />
					Provider types
				</li>
				<li className={props.location.pathname.includes('users') && 'active'} onClick={() => props.history.push('/users')}>
					<img src={'/public/static/assets/Skeleton/SidebarNav/nav-users.png'} />
					Users
				</li>
				<hr /> {/* Separator */}
				<li className={props.location.pathname.includes('settings') && 'active'} onClick={() => props.history.push('/settings')}>
					<img src={'/public/static/assets/Skeleton/SidebarNav/nav-settings.png'} />
					Settings
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
