import React, { Component } from "react";
import PropTypes from 'prop-types';

import { MDBInput } from 'mdbreact';

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
		this.props.services.identity.connect(address);
	}

	async import(encrypted, password)
	{
		this.props.services.identity.import(null, null).catch(console.error);
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
						<MDBInput label="Username" className="input" onChange={this.update.bind(this)}/>
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

Login.propTypes =
{
	services: PropTypes.object,
};

export default Login;
