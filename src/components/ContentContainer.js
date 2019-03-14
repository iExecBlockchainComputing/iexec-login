import React, { Component } from "react";
import PropTypes from 'prop-types';

import Loading from './Loading';
import Login   from './Login';
import Main    from './Main';

import { scrollTo } from '../utils';

class ContentContainer extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			view: 'Login',
			viewParameters: {}
		};
	}

	setView(view, viewParameters = {})
	{
		this.setState({view, viewParameters});
		scrollTo(0, 0);
	}

	render()
	{
		return (
			<div>
			{ this.state.viewParameters.loading ? <Loading/> : null }
			{
				  (this.state.view === 'Login')
				? <Login services={this.props.services} setView={this.setView.bind(this)}/>
				: (this.state.view === 'Main')
				? <Main services={this.props.services} setView={this.setView.bind(this)}/>
				: <div>Oups, nothing to render</div>
			}
			</div>
		);
	}
}

ContentContainer.propTypes =
{
	services: PropTypes.object
};

export default ContentContainer;
