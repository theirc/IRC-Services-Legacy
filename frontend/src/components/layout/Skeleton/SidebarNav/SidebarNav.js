import React, {useState} from 'react';
import { useTranslation } from "react-i18next";
import Button from 'react-bootstrap/Button';
import './SidebarNav.scss';

const SidebarNav = props => {
	const { t, i18n } = useTranslation();

	const [isOpen, setOpen] = useState(true);

	const onClick = (e) => {
		setOpen(!isOpen); // toggle
	};

	return (
		<div className={`SidebarNav ${isOpen ? 'open' : 'closed'}`}>
			<Button variant='outline-info' size='sm' onClick={onClick}>x</Button>
		</div>
	)
}

export default SidebarNav;
