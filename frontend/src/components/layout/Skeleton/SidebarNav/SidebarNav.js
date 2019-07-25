import React from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../../shared/i18n';
import languages from './languages.json'

import './SidebarNav.scss';

const NS = 'SidebarNav';

const SidebarNav = props => {
	i18n.customLoad(languages, NS);
	const { t } = useTranslation(NS);

	return (
		<nav className={`SidebarNav ${props.sidebarnav.isOpen ? 'open' : 'closed'} ${props.darkMode ? 'bg-dark' : ''}`}>
			<ul>
				<li title={t('services')} className={props.location.pathname.includes('services') && 'active'} onClick={() => props.history.push('/services')}>
					<img src={'/public/static/assets/Skeleton/SidebarNav/nav-services.png'} />
					{t('services')}
				</li>
				<li title={t('serviceMap')}>
					<a target='_blank' href='https://www.refugee.info/'><img src={'/public/static/assets/Skeleton/SidebarNav/nav-service-map.png'} />{t('serviceMap')}</a>
				</li>
				<hr /> {/* Separator */}
				<li title={t('serviceProviders')} className={props.location.pathname.includes('providers') && 'active'} onClick={() => props.history.push('/providers')}>
					<img src={'/public/static/assets/Skeleton/SidebarNav/nav-providers.png'} />
					{t('serviceProviders')}
				</li>
				<li title={t('regions')} className={props.location.pathname.includes('regions') && 'active'} onClick={() => props.history.push('/regions')}>
					<img src={'/public/static/assets/Skeleton/SidebarNav/nav-regions.png'} />
					{t('regions')}
				</li>
				<li title={t('serviceCategories')} className={props.location.pathname.includes('service-categories') && 'active'} onClick={() => props.history.push('/service-categories')}>
					<img src={'/public/static/assets/Skeleton/SidebarNav/nav-service-categories.png'} />
					{t('serviceCategories')}
				</li>
				<li title={t('providerTypes')} className={props.location.pathname.includes('provider-types') && 'active'} onClick={() => props.history.push('/provider-types')}>
					<img src={'/public/static/assets/Skeleton/SidebarNav/nav-provider-types.png'} />
					{t('providerTypes')}
				</li>
				<li title={t('users')} className={props.location.pathname.includes('users') && 'active'} onClick={() => props.history.push('/users')}>
					<img src={'/public/static/assets/Skeleton/SidebarNav/nav-users.png'} />
					{t('users')}
				</li>
				<hr /> {/* Separator */}
				<li title={t('settings')} className={props.location.pathname.includes('settings') && 'active'} onClick={() => props.history.push('/settings')}>
					<img src={'/public/static/assets/Skeleton/SidebarNav/nav-settings.png'} />
					{t('settings')}
				</li>
			</ul>
		</nav>
	)
}


export default SidebarNav;
