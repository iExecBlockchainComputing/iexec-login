import React, { Component } from "react";
import PropTypes from 'prop-types';

import {
	MDBInput,
	MDBBtn,
	MDBIcon,
	MDBModal,
	MDBModalBody,
	MDBModalHeader,
} from 'mdbreact';

import logo from '../assets/logo.svg';
import "../css/Login.css";

class Login extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			modal: false,
			connections: [],
			creations:   [],
		};
	}

	toggle()
	{
		this.setState({ modal: !this.state.modal });
	}

	async update(event)
	{
		let [label, node] = event.target.value.split(/\.(.+)/);
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

	async import(event)
	{
		event.preventDefault()
		this.props.services.walletManager.loadFromJSON(event.target.wallet.value, event.target.password.value);
	}

	async creation(name)
	{
		this.props.services.walletManager.create(name);
	}

	async connection(address)
	{
		this.props.services.walletManager.connect(address);
	}

	render()
	{
		return (
			<>
				<div id="login">
					<div className="login-card">
						<div className="login-header">
							<img src={logo} className="logo" alt="logo" />
							<span className="title">iExec Login</span>
						</div>
						<div className="login-body">
							<MDBInput label="Username" className="input" onChange={this.update.bind(this)}/>
							{
								this.state.creations.length === 0 && this.state.connections.length === 0 &&
								<p className="font-small grey-text d-flex justify-content-end">
									Import <a href="#!" className="dark-grey-text font-weight-bold ml-1" onClick={this.toggle.bind(this)}>wallet</a>
								</p>
							}
							<ul className="shadow">
							{
								this.state.connections.map(([ name, address ]) =>
									<li className="connection" onClick={this.connection.bind(this, name)} key={name}>{name}</li>
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
				<MDBModal isOpen={this.state.modal} toggle={this.toggle.bind(this)} centered>
					<MDBModalHeader toggle={this.toggle.bind(this)}>
						Import an encrypted wallet
					</MDBModalHeader>
					<MDBModalBody>
						<form className="text-center" onSubmit={this.import.bind(this)}>
							<MDBInput type="password" label="Password" name="password"/>
							<MDBInput type="textarea" label="Wallet" name="wallet"/>
							<MDBBtn gradient="blue" className="m-3 py-2" type="submit">
								Import wallet
								<MDBIcon icon="file-import" className="ml-1" />
							</MDBBtn>
						</form>
					</MDBModalBody>
				</MDBModal>
			</>
		);
	}
}

Login.propTypes =
{
	services: PropTypes.object,
};

export default Login;
