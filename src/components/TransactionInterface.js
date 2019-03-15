import React, { Component } from "react";
import PropTypes from 'prop-types';

import { MDBCard, MDBCardHeader, MDBCardBody, MDBBtn, MDBIcon, MDBInput } from 'mdbreact';

class TransactionInterface extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {};
	}

	async transaction(event)
	{
		event.preventDefault()
		this.props.services.identity.execute({
			to:    event.target.to.value,
			data:  event.target.data.value,
			value: Math.floor(parseFloat(event.target.value.value)*10**18).toString(),
		})
		.then(/*this.loadBalance.bind(this)*/)
		.catch(console.error);
	}

	render()
	{
		return (
			<MDBCard>
				<MDBCardHeader>
					Send transaction
				</MDBCardHeader>
				<MDBCardBody>
					<form className="col-8 offset-2" onSubmit={this.transaction.bind(this)}>
						<MDBInput label="to"          name="to"    value="0x1234567890000000000000000000000000000000"/>
						<MDBInput label="value (ETH)" name="value" value="0.1"/>
						<MDBInput label="data"        name="data"  value="0x"/>
						<MDBBtn color="primary" className="m-0 py-2" type="submit">
							Send transaction<MDBIcon icon="paper-plane" className="ml-1" />
						</MDBBtn>
					</form>
				</MDBCardBody>
			</MDBCard>
		);
	}
}

TransactionInterface.propTypes =
{
	services: PropTypes.object,
};

export default TransactionInterface;
