import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
	MDBBtn,
	MDBIcon,
	MDBInput,
	MDBModal,
	MDBModalBody,
	MDBModalHeader,
} from 'mdbreact';

class SignatureModal extends Component
{
	constructor(props)
	{
		super(props);
		this.state =
		{
			modal: false,
		}
	}

	toggle()
	{
		this.setState({ modal: !this.state.modal });
	}

	signMessage(event)
	{
		event.preventDefault();

		this.props.services.identity.signMessage(event.target.message.value)
		.then(signature => {
			console.log("public:",    this.props.services.identity.address());
			console.log("signature:", signature);
		})
		.catch(console.error);

	}

	render()
	{
		return (
			<>
				<MDBBtn gradient="blue" className="m-3 py-2" onClick={this.toggle.bind(this)}>
					Sign
					<MDBIcon icon="signature" className="ml-1" />
				</MDBBtn>
				<MDBModal id="verifiy-signature-modal" isOpen={this.state.modal} toggle={this.toggle.bind(this)} centered>
					<MDBModalHeader toggle={this.toggle.bind(this)}>
						Signature verification
					</MDBModalHeader>
					<MDBModalBody>
						<form onSubmit={this.signMessage.bind(this)}>
							<MDBInput type="textarea" label="Message" name="message"/>
							<MDBBtn gradient="blue" className="m-3 py-2" type="submit">
								Sign message
								<MDBIcon icon="signature" className="ml-1" />
							</MDBBtn>
						</form>
					</MDBModalBody>
				</MDBModal>
			</>
		);
	}
}

SignatureModal.propTypes =
{
	services: PropTypes.object,
};

export default SignatureModal;
