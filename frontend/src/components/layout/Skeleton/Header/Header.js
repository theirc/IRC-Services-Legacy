import React from 'react';
import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import loginActions from '../../../../scenes/Login/actions';
import skeletonActions from '../actions';

import './Header.scss';

const Header = props => {
	const { t, i18n } = useTranslation();

	const title = props.user ? `${props.user.name} ${props.user.surname}` : 'Not Logged In';

	const onClick = e => {
		props.setSidebarNavOpen(!props.sidebarnav.isOpen);
	};

	return (
		<div className={`Header ${props.darkMode ? 'bg-dark' : ''}`}>
			<Navbar fixed='top' collapseOnSelect expand='sm' variant={props.darkMode ? 'dark' : 'light'}>
				<span onClick={onClick} className={`navbar-toggler-icon toggler ${props.sidebarnav.isOpen ? 'expanded' : ''}`}></span>
				<Nav className='mr-auto'>
				</Nav>
				<Nav>
					<NavDropdown alignRight title={title} id='collasible-nav-dropdown'>
						<NavDropdown.Item><Link to={`/users/${props.user.id}`}>Profile</Link></NavDropdown.Item>
						<NavDropdown.Divider />
						<NavDropdown.Item><Link to='/' onClick={props.logOut}>Log out</Link></NavDropdown.Item>
					</NavDropdown>
				</Nav>
			</Navbar>
		</div>
	)
}

const mapStateToProps = state => ({
	user: state.login.user
});

const mapDispatchToProps = dispatch => {
	return {
		logOut: () => dispatch(loginActions.setUser(null)),
		setSidebarNavOpen: isOpen => dispatch(skeletonActions.setSidebarNavOpen(isOpen)),
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
