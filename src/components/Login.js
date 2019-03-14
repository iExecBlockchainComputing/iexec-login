import React, { Component } from "react";
import PropTypes from 'prop-types';

import logo from '../assets/logo.svg';
import "../css/Login.css";

class Login extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			connections: [],
			creations:   [],
		};
		this.props.services.storageService.getIdentity().then(this.login.bind(this));
	}

	async login(credentials)
	{
		if (credentials)
		{
			this.props.services.wallet = credentials;
			this.props.services.storageService.storeIdentity(credentials);
			this.props.setView('Main', { loading: false });
		}
	}

	async update(event)
	{
		let [label, node] = event.target.value.split(".");
		Promise.all(
			this.props.services.config.ensDomains
			.filter(domain => label && domain.startsWith(node ? node : ""))
			.map(domain => [label, domain].join('.'))
			.map(username => this.props.services.sdk.identityExist(username).then(wallet => [username, wallet]))
		)
		.then(results => {
			this.setState({
				connections: results.filter(([username, wallet]) =>  wallet),
				creations:   results.filter(([username, wallet]) => !wallet),
			})
		})
		.catch(console.error);
	}

	async creation(username, event)
	{
		this.props.setView('Login', { loading: true });

		this.props.services.sdk.create(username)
		.then(([privateKey, contractAddress]) => this.login.bind(this)({privateKey, contractAddress}))
		.catch(e => {
			console.error(e);
			this.props.setView('Login', { loading: false });
		})
	}

	async connection(contractAddress, event)
	{
		console.log("Not implemented yet.");
		// this.sdk.connect(contractAddress).then(privateKey => {
		//	this.login.bind(this)({privateKey, contractAddress})
		// })

	}

	render()
	{
		return (
			<div className="login-view">
				<div className="login-card">
					<div className="login-header">
						<img src={logo} className="logo" alt="logo" />
						<span className="title">iExec Login</span>
					</div>
					<div className="login-body">
						<input type="text" className="form-control" placeholder="your username" onChange={this.update.bind(this)}/>
						<ul className="shadow">
							{
								this.state.connections.map(([ username, wallet ]) =>
									<li className="connection" onClick={this.connection.bind(this, wallet )} key={username}>{username}</li>
								)
							}
							{
								this.state.creations.map(([ username, wallet ]) =>
									<li className="creation" onClick={this.creation.bind(this, username)} key={username}>{username}</li>
								)
							}
						</ul>
					</div>
				</div>
			</div>
		);
	}
}
				// <ul className="shadow table-dark">
				// 	{ this.state.connections.map(([ username, wallet ]) => <li className="connection" onClick={this.connection.bind(this, wallet )} key={username}>{username}</li>) }
				// 	{ this.state.creations.map(([ username, wallet ]) => <li className="creation" onClick={this.creation.bind(this, username)} key={username}>{username}</li>) }
				// </ul>

Login.propTypes =
{
	services: PropTypes.object,
	setView:  PropTypes.func,
};

export default Login;
