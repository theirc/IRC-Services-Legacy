
import React, { Component } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Login from "../scenes/Login/Login";
import Skeleton from '../components/layout/Skeleton/Skeleton';
import Providers from '../scenes/Providers/Providers';
import ProviderTypes from '../scenes/ProviderTypes/ProviderTypes';
import Regions from '../scenes/Regions/Regions';
import ServiceCategories from '../scenes/ServiceCategories/ServiceCategories';
import Services from '../scenes/Services/Services';
import Settings from '../scenes/Settings/Settings';
import Users from '../scenes/Users/Users';
import { connect } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { history } from '../shared/store';

const AppRouter = props => {
	const initialCsrf = props.initialCsrf;
	sessionStorage.setItem("csrf", initialCsrf);

	console.log('approuter', props);
	return (
		<ConnectedRouter history={history}>
			<Switch>
				{props.user &&
				<div className='AppRouter'>
					<Route exact path='/providers' component={props => <Skeleton {...props}><Providers {...props} /></Skeleton>} />
					<Route exact path='/providers/:id' component={props => <Skeleton {...props}><Providers {...props} /></Skeleton>} />
					<Route exact path='/provider-types' component={props => <Skeleton {...props}><ProviderTypes {...props} /></Skeleton>} />
					<Route exact path='/provider-types/:id' component={props => <Skeleton {...props}><ProviderTypes {...props} /></Skeleton>} />
					<Route exact path='/regions' component={props => <Skeleton {...props}><Regions {...props} /></Skeleton>} />
					<Route exact path='/regions/:id' component={props => <Skeleton {...props}><Regions {...props} /></Skeleton>} />
					<Route exact path='/service-categories' component={props => <Skeleton {...props}><ServiceCategories {...props} /></Skeleton>} />
					<Route exact path='/service-categories/:id' component={props => <Skeleton {...props}><ServiceCategories {...props} /></Skeleton>} />
					<Route exact path='/services' component={props => <Skeleton {...props}><Services {...props} /></Skeleton>} />
					<Route exact path='/services/:id' component={props => <Skeleton {...props}><Services {...props} /></Skeleton>} />
					<Route exact path='/users' component={props => <Skeleton {...props}><Users {...props} /></Skeleton>} />
					<Route exact path='/users/:id' component={props => <Skeleton {...props}><Users {...props} /></Skeleton>} />
					<Route exact path='/settings' component={props => <Skeleton {...props}><Settings {...props} /></Skeleton>} />
					<Route exact path='/' component={props => <Skeleton {...props}><Regions {...props} /></Skeleton>} />{ /*Default scene*/ }
				</div>
				}
				{!props.user &&
					<div className='AppRouter'>
						<Redirect to='/' />
						<Route path='/' component={props => <Login {...props} />} />
					</div>
				}
			</Switch>
		</ConnectedRouter>
	)
}
const mapStateToProps = state => ({
	user: state.login.user,
});

export default connect(mapStateToProps)(AppRouter);
