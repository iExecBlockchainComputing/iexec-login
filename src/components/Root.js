import React, { Component } from "react";
import PropTypes from 'prop-types';

import Notifications from './Notifications';
import Loading       from './Loading';
import Login         from './Login';
import Main          from './Main';

import { scrollTo } from '../utils';

class Root extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			view: 'Login',
			viewParameters: {}
		};
	}

	componentDidMount()
	{
		this.subscription = this.props.services.emitter.addListener('setView', this.setView.bind(this));
	}

	componentWillUnmount()
	{
		this.subscription.remove();
	}

	setView(view, viewParameters = {})
	{
		this.setState({view: view || this.state.view, viewParameters: viewParameters});
		scrollTo(0, 0);
	}

	render()
	{
		return (
			<>
			<Notifications emitter={this.props.services.emitter}/>
			{ this.state.viewParameters.loading && <Loading/> }
			{
			  (this.state.view === 'Login')
			? <Login services={this.props.services}/>
			: (this.state.view === 'Main')
			? <Main services={this.props.services}/>
			: <div>Oups, nothing to render</div>
			}
			</>
		);
	}
}

Root.propTypes =
{
	services: PropTypes.object
};

export default Root;
