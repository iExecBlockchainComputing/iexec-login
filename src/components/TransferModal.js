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

import { utils } from 'ethers';
import IERC20 from 'openzeppelin-solidity/build/contracts/IERC20.json'

class TransferModal extends Component
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

	toAddress(address)
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

	transfer(event)
	{
		event.preventDefault();

		let dest  = event.target.dest.value;
		let value = event.target.value.value;

		this.toAddress(dest).then(resolved => {
			if (resolved === false)
			{
				this.props.services.emitter.emit('notification', 'error', 'Failled to resolve destination address');
				return;
			}
			if (value === "")
			{
				this.props.services.emitter.emit('notification', 'error', 'Missing arguments');
				return;
			}
			let amount = Math.floor(parseFloat(value)*10**this.props.asset[4]).toString();
			this.props.services.wallet.execute(this.props.asset[0] ? {
				to:    this.props.asset[0],
				value: 0,
				data:  new utils.Interface(IERC20.abi).functions.transfer.encode([ resolved, amount ]),
			} : {
				to:    resolved,
				value: amount,
				data:  "",
			})
			.then ((nonce) => {
				this.setState({ modal: false });
				this.props.services.emitter.emit('notification', 'success', 'Transaction succesfull');
			})
			.catch((e) => this.props.services.emitter.emit('notification', 'error', 'Error during transaction' + e));
		});
	}

	render()
	{
		return (
			<>
				<a href="#!" onClick={this.toggle.bind(this)}>
					<MDBIcon icon="paper-plane" className="ml-1" />
				</a>
				<MDBModal isOpen={this.state.modal} toggle={this.toggle.bind(this)} centered>
					<MDBModalHeader toggle={this.toggle.bind(this)}>
						Send {this.props.asset[1]}
					</MDBModalHeader>
					<MDBModalBody>
						<form onSubmit={this.transfer.bind(this)}>
							<MDBInput label="to"  name="dest"/>
							<MDBInput label={"value ("+this.props.asset[2]+")"} name="value"/>
							<MDBBtn gradient="blue" className="m-3 py-2" type="submit">
								Send
								<MDBIcon icon="paper-plane" className="ml-1" />
							</MDBBtn>
						</form>
					</MDBModalBody>
				</MDBModal>
			</>
		);
	}
}

TransferModal.propTypes =
{
	services: PropTypes.object,
};

export default TransferModal;
