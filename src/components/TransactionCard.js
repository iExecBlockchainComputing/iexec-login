import React, { Component } from "react";
import PropTypes from 'prop-types';

import {
	MDBCard,
	MDBCardHeader,
	MDBCardBody,
	MDBBtn,
	MDBIcon,
	MDBInput
} from 'mdbreact';

import { utils } from 'ethers';

class TransactionCard extends Component
{
	async toAddress(address)
	{
		try
		{
			return utils.getAddress(address);
		}
		catch (e)
		{
			return this.props.services.sdk.resolveName(address);
		}
	}

	async transaction(event)
	{
		event.preventDefault();
		let to    = event.target.to.value    || this.props.services.wallet.name;
		let data  = event.target.data.value  || "0x";
		let value = event.target.value.value || '0.1';
		this.toAddress(to).then(resolved => {
			if (resolved === false)
			{
				this.props.services.emitter.emit('notification', 'warning', 'Failled to resolve destination address');
				return;
			}
			this.props.services.wallet.execute({
				to:    resolved,
				data:  data,
				value: Math.floor(parseFloat(value)*10**18).toString(),
			})
			.then ((nonce) => this.props.services.emitter.emit('notification', 'success', 'Transaction succesfull'))
			.catch((e) => this.props.services.emitter.emit('notification', 'error', 'Error during transaction' + e));
		})
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
						<MDBInput label="to"          name="to"    hint={this.props.services.wallet.name}/>
						<MDBInput label="value (ETH)" name="value" hint="0.1"/>
						<MDBInput label="data"        name="data"  hint="0x"/>
						<MDBBtn gradient="blue" className="m-0 py-2" type="submit">
							Send transaction<MDBIcon icon="paper-plane" className="ml-1" />
						</MDBBtn>
					</form>
				</MDBCardBody>
			</MDBCard>
		);
	}
}

TransactionCard.propTypes =
{
	services: PropTypes.object,
};

export default TransactionCard;
