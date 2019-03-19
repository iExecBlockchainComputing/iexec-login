import React, { Component } from "react";
import PropTypes from 'prop-types';

import {
	MDBCard,
	MDBCardBody,
	MDBCardHeader,
} from 'mdbreact';

import SignatureModal             from "./SignatureModal";
import SignatureVerificationModal from "./SignatureVerificationModal";

class SignatureCard extends Component
{
	render()
	{
		return (
			<MDBCard>
				<MDBCardHeader>
					Message signatures
				</MDBCardHeader>
				<MDBCardBody>
					<SignatureModal services={this.props.services}/>
					<SignatureVerificationModal services={this.props.services}/>
				</MDBCardBody>
			</MDBCard>
		);
	}
}


SignatureCard.propTypes =
{
	services: PropTypes.object,
};

export default SignatureCard;
