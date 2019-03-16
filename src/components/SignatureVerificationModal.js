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

import { utils, Contract } from 'ethers';
import ERC1271 from 'erc1836/build/contracts/IERC1271.json'

class SignatureVerificationModal extends Component
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

	verify(event)
	{
		event.preventDefault();
		let from      = event.target.from.value;
		let message   = event.target.message.value;
		let signature = event.target.signature.value;
		this.toAddress(from).then(resolved => {
			if (resolved === false)
			{
				this.props.services.emitter.emit('notification', 'warning', 'Failled to resolve signer address');
				return;
			}
			try
			{
				if (resolved === utils.verifyMessage(message, signature))
				{
					this.props.services.emitter.emit('notification', 'success', 'Signature is valid');
					return;
				}
			}
			catch (e)
			{ /* let finally handle other cases */ }
			finally
			{
				((new Contract(this.props.services.identity.wallet.proxy, ERC1271.abi, this.props.services.provider))
				.isValidSignature(utils.hashMessage(message), signature))
				.then(result => {
					if (result)
					{
						this.props.services.emitter.emit('notification', 'success', 'Signature is valid per ERC1271');
					}
					else
					{
						this.props.services.emitter.emit('notification', 'error', 'Signature is invalid');
					}
				})
				.catch(e => {
					this.props.services.emitter.emit('notification', 'error', 'Signature invalid');
				});
			}
		});
	}

	render()
	{
		return (
			<>
				<MDBBtn gradient="blue" className="m-3 py-2" onClick={this.toggle.bind(this)}>
					Verify
					<MDBIcon icon="eye" className="ml-1" />
				</MDBBtn>
				<MDBModal id="verifiy-signature-modal" isOpen={this.state.modal} toggle={this.toggle.bind(this)} centered>
					<MDBModalHeader toggle={this.toggle.bind(this)}>
						Signature verification
					</MDBModalHeader>
					<MDBModalBody>
						<form onSubmit={this.verify.bind(this)}>
							<MDBInput label="From"  name="from"/>
							<MDBInput label="Message" name="message" type="textarea" />
							<MDBInput label="Signature" name="signature"/>
							<MDBBtn gradient="blue" className="m-0 py-2" type="submit">
								Verify signature
								<MDBIcon icon="eye" className="ml-1" />
							</MDBBtn>
						</form>

					</MDBModalBody>
				</MDBModal>
			</>
		);
	}
}

SignatureVerificationModal.propTypes =
{
	services: PropTypes.object,
};

export default SignatureVerificationModal;
