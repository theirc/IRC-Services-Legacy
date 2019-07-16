import React from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
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
		<div className='Header'>
			<Navbar fixed='top' collapseOnSelect expand='sm' bg={props.darkMode ? 'dark' : 'light'} variant={props.darkMode ? 'dark' : 'light'}>
				<span onClick={onClick} className={`navbar-toggler-icon toggler ${props.sidebarnav.isOpen ? 'expanded' : ''}`}></span>
				<Navbar.Toggle aria-controls='responsive-navbar-nav' />
				<Navbar.Collapse id='responsive-navbar-nav'>
					<Nav className='mr-auto'>
					</Nav>
					<Nav>
						<NavDropdown alignRight title={title} id='collasible-nav-dropdown'>
							<NavDropdown.Item disabled>Profile</NavDropdown.Item>
							<NavDropdown.Divider />
							<NavDropdown.Item><Link to='/' onClick={props.logOut}>Log out</Link></NavDropdown.Item>
						</NavDropdown>
					</Nav>
				</Navbar.Collapse>
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
