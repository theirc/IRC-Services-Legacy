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
		<div className={`SidebarNav ${props.isOpen ? 'open' : 'closed'}`}>
			<div className='header'>
				<Button variant='outline-secondary' size='sm' onClick={onClick}>x</Button>
			</div>
		</div>
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
