import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import i18n from '../../../../shared/i18n';
import languages from './languages.json'

import './SessionTimer.scss';

const NS = 'SessionTimer';

const SessionTimer = props => {
	i18n.customLoad(languages, NS);
	const { t } = useTranslation(NS);

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
					{t('title')}
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p>{t('message', { secs: count })}</p>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={props.onHide}>{t('stay')}</Button>
				<Button variant='secondary' onClick={() => props.setTimedOut(true)}>{t('logout')}</Button>
			</Modal.Footer>
		</Modal>
	);
}

export default SessionTimer;
