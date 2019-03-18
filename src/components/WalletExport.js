import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
	MDBBtn,
	MDBIcon,
	MDBModal,
	MDBModalBody,
	MDBModalHeader,
} from 'mdbreact';

class WalletExport extends Component
{

	constructor(props)
	{
		super(props);
		this.state =
		{
			modal:     false,
			encrypted: null,
		};
	}

	toggle()
	{
		this.setState({ modal: !this.state.modal });
	}

	async export(event)
	{
		event.preventDefault()
		this.props.services.identity.export(event.target.password.value)
		.then(encrypted => this.setState({ modal: true, encrypted }))
		.catch(console.error);
	}

	render()
	{
		return (
			<>
				<form className="md-form input-group" onSubmit={this.export.bind(this)}>
					<input type="password" name="password" className="form-control" placeholder="password"/>
					<div className="input-group-append">
						<MDBBtn gradient="blue" className="m-0 py-2" type="submit">
							<MDBIcon icon="file-export" className="ml-1" />
						</MDBBtn>
					</div>
				</form>
				<MDBModal id="wallet-export-modal" isOpen={this.state.modal} toggle={this.toggle.bind(this)} centered>
					<MDBModalHeader toggle={this.toggle.bind(this)}>
						Wallet export
					</MDBModalHeader>
					<MDBModalBody>
						<code className="address">{this.state.encrypted}</code>
					</MDBModalBody>
				</MDBModal>
			</>
		);
	}
}

WalletExport.propTypes =
{
	services: PropTypes.object,
};

export default WalletExport;
