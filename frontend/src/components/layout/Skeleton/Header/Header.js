import React from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { useTranslation } from "react-i18next";
import './Header.scss';

const Header = props => {
	const { t, i18n } = useTranslation();

	return (
		<div className='Header'>
			<Navbar collapseOnSelect expand="sm" bg="light" variant="light">
				<Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
				<Navbar.Toggle aria-controls="responsive-navbar-nav" />
				<Navbar.Collapse id="responsive-navbar-nav">
					<Nav className="mr-auto">
					</Nav>
					<Nav>
						<NavDropdown alignRight title="John Foo" id="collasible-nav-dropdown">
							<NavDropdown.Item href="#action/3.1">Profile</NavDropdown.Item>
							<NavDropdown.Item href="#action/3.2">User Settings</NavDropdown.Item>
							<NavDropdown.Divider />
							<NavDropdown.Item href="#action/3.4">Log out</NavDropdown.Item>
						</NavDropdown>
					</Nav>
				</Navbar.Collapse>
			</Navbar>
		</div>
	)
}

export default Header;
