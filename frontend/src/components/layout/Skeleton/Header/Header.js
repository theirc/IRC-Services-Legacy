import React from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { useTranslation } from "react-i18next";
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';
import './Header.scss';

const Header = props => {
	const { t, i18n } = useTranslation();

	const title = props.user ? `${props.user.name} ${props.user.surname}` : 'Not Logged In';

	return (
		<div className='Header'>
			<Navbar collapseOnSelect expand="sm" bg="light" variant="light">
				<Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
				<Navbar.Toggle aria-controls="responsive-navbar-nav" />
				<Navbar.Collapse id="responsive-navbar-nav">
					<Nav className="mr-auto">
					</Nav>
					<Nav>
						<NavDropdown alignRight title={title} id="collasible-nav-dropdown">
							<NavDropdown.Item><Link to='/providers'>Providers</Link></NavDropdown.Item>
							<NavDropdown.Item><Link to='/provider-types'>ProviderTypes</Link></NavDropdown.Item>
							<NavDropdown.Item><Link to='/regions'>Regions</Link></NavDropdown.Item>
							<NavDropdown.Item><Link to='/service-categories'>ServiceCategories</Link></NavDropdown.Item>
							<NavDropdown.Divider />
							<NavDropdown.Item><Link to='/settings'>Settings</Link></NavDropdown.Item>
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

export default connect(mapStateToProps)(Header);
