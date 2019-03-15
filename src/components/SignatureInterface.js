import React, { Component } from "react";
import PropTypes from 'prop-types';

import { MDBCard, MDBCardHeader, MDBCardBody, MDBBtn, MDBIcon, MDBInput } from 'mdbreact';

class SignatureInterface extends Component
{
	signMessage(event)
	{
		event.preventDefault();
		this.props.services.identity.signMessage(event.target.msg.value)
		.then(signature => {
			console.log("public:",    this.props.services.identity.address());
			console.log("signature:", signature);
		})
		.catch(console.error);
	}

	render()
	{
		return (
			<MDBCard>
				<MDBCardHeader>
					Sign message
				</MDBCardHeader>
				<MDBCardBody>
					<form className="col-8 offset-2" onSubmit={this.signMessage.bind(this)}>
						<MDBInput type="textarea" label="Message" name="msg"/>
						<MDBBtn color="primary" className="m-0 py-2" type="submit">
							Sign message<MDBIcon icon="signature" className="ml-1" />
						</MDBBtn>
					</form>
				</MDBCardBody>
			</MDBCard>
		);
	}
}

SignatureInterface.propTypes =
{
	services: PropTypes.object,
};

export default SignatureInterface;
