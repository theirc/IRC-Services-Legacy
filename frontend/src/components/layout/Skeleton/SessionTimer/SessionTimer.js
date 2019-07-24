import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import './SessionTimer.scss';

const SessionTimer = props => {
	const { t, i18n } = useTranslation();

	let [count, setCount] = useState(props.timeout);

	useEffect(() => {
		const interval = setInterval(() => setCount(--count), 1000);
		return () => clearInterval(interval);
	}, []);

	if (count === 0) props.setTimedOut(true);

	return (
		<Modal {...props} className='SessionTimer' size='sm' aria-labelledby='contained-modal-title-vcenter' centered>
			<Modal.Header closeButton>
				<Modal.Title id='contained-modal-title-vcenter'>
					Session timeout
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p>You will be logged out in {count} secs</p>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={props.onHide}>Stay</Button>
				<Button variant='secondary' onClick={() => props.setTimedOut(true)}>Log out</Button>
			</Modal.Footer>
		</Modal>
	);
}

export default SessionTimer;
