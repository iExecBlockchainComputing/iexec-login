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
	}

	async update(event)
	{
		let [label, node] = event.target.value.split(".");
		Promise.all(
			this.props.services.config.ensDomains
			.filter(domain => label && domain.startsWith(node ? node : ""))
			.map(domain => [label, domain].join('.'))
			.map(name => this.props.services.sdk.identityExist(name).then(address => [name, address]))
		)
		.then(results => {
			this.setState({
				connections: results.filter(([name, address]) =>  address),
				creations:   results.filter(([name, address]) => !address),
			})
		})
		.catch(console.error);
	}

	async creation(name, event)
	{
		this.props.services.identity.create(name);
	}

	async connection(address, event)
	{
		this.props.services.identity.connection(address);
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
								this.state.connections.map(([ name, address ]) =>
									<li className="connection" onClick={this.connection.bind(this, address )} key={name}>{name}</li>
								)
							}
							{
								this.state.creations.map(([ name, address ]) =>
									<li className="creation" onClick={this.creation.bind(this, name)} key={name}>{name}</li>
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
};

export default Login;
