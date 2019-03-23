import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
	MDBBtn,
	MDBCol,
	MDBIcon,
	MDBModal,
	MDBModalBody,
	MDBModalFooter,
	MDBModalHeader,
	MDBRow,
} from 'mdbreact';

import WalletExport from './WalletExport';
import { utils, Contract } from 'ethers';

import IMaster from 'erc1836/build/contracts/IMaster.json'
import "../css/AccountManagementModal.css";

class AccountManagementModal extends Component
{
	constructor(props)
	{
		super(props);
		this.state =
		{
			modal:            false,
			delegate_current: null,
			delegate_valid:   false,
			delegate_upgrade: false,
		}
	}

	toggle()
	{
		this.setState({ modal: !this.state.modal });
	}

	componentDidMount()
	{
		this.refresh();
	}

	async refresh()
	{
		Promise.all([
			(new Contract(this.props.services.wallet.proxy, IMaster.abi, this.props.services.provider)).UUID(),
			(new Contract(this.props.services.wallet.proxy, IMaster.abi, this.props.services.provider)).master(),
		])
		.then(([uuid, delegate]) => {
			let delegate_current = delegate;
			let delegate_valid   = uuid     === this.props.services.config.delegateUUID;
			let delegate_upgrade = delegate !== this.props.services.config.delegateAddr;
			this.setState({ delegate_current, delegate_valid, delegate_upgrade });
			if      (!delegate_valid ) { this.props.services.emitter.emit('notification', 'error',   'Invalid delegate' ); }
			else if (delegate_upgrade) { this.props.services.emitter.emit('notification', 'warning', 'Upgrade available'); }
		})
		.catch(e => {
			this.setState({
				delegate_current: null,
				delegate_valid:   false,
				delegate_upgrade: false,
			});
			console.error(e);
		});
	}

	async upgrade(event)
	{
		event.preventDefault()
		try
		{
			const initData   = new utils.Interface(["initializeQAD()"]).functions.initializeQAD.encode([]);
			const updateData = new utils.Interface(["updateDelegateQAD(address,bytes)"]).functions.updateDelegateQAD.encode([ this.props.services.config.delegateAddr, initData ]);
			this.props.services.wallet.execute({
				to:    this.props.services.wallet.proxy,
				data:  updateData,
				value: "0",
			})
			.then(() => {
				this.props.services.emitter.emit('notification', 'success', 'Upgrade successful');
				this.refresh();
			})
			.catch(e => {
				this.props.services.emitter.emit('notification', 'error', 'Upgrade failled');
				console.error(e);
			});
		}
		catch (e)
		{
			console.error(e);
		}
	}

	async disconnect(event)
	{
		this.props.services.walletManager.disconnect();
	}

	render()
	{
		return (
			<>
				<MDBBtn id="account-management-modal-trigger" floating size="lg" gradient="blue" className="align-middle toggle" onClick={this.toggle.bind(this)}>
					<MDBIcon icon="fingerprint" size="3x"/>
					{ this.state.delegate_upgrade && <MDBIcon icon="circle" size="1x" className="corner text-warning"/> }
					{ this.state.pending          && <MDBIcon icon="circle" size="1x" className="corner text-danger"/> }
				</MDBBtn>

				<MDBModal id="account-management-modal" isOpen={this.state.modal} toggle={this.toggle.bind(this)} fullHeight position="right">
					<MDBModalHeader toggle={this.toggle.bind(this)}>
						Account management
					</MDBModalHeader>
					<MDBModalBody>

						<MDBRow className="blue-gradient rounded shadow m-2 p-1 text-white">
							<MDBCol>Account details</MDBCol>
						</MDBRow>
						<MDBRow>
							<MDBCol size="3" className="text-right">Name:</MDBCol>
							<MDBCol size="9" className="text-left">{ this.props.services.wallet.name }</MDBCol>
						</MDBRow>
						<MDBRow>
							<MDBCol size="3" className="text-right">Proxy:</MDBCol>
							<MDBCol size="7" className="text-left overflow-scrool"><code>{ this.props.services.wallet.proxy }</code></MDBCol>
							<MDBCol size="2" className="text-left">
								{
									! this.state.delegate_valid
									? <MDBIcon className="text-danger" icon="times" />
									: <MDBIcon className="text-success" icon="check" />
								}
							</MDBCol>
						</MDBRow>
						<MDBRow>
							<MDBCol size="3" className="text-right">Delegate:</MDBCol>
							<MDBCol size="7" className="text-left overflow-scrool"><code>{ this.state.delegate_current }</code></MDBCol>
							<MDBCol size="2" className="text-left">
								{
									! this.state.delegate_valid
									? <MDBIcon className="text-danger" icon="times" />
									: this.state.delegate_upgrade
									? <MDBIcon className="text-warning clickable" icon="sync" onClick={this.upgrade.bind(this)}/>
									: <MDBIcon className="text-success" icon="check" />
								}
							</MDBCol>
						</MDBRow>
						<hr/>

						<MDBRow className="blue-gradient rounded shadow m-2 p-1 text-white">
							<MDBCol>Export wallet</MDBCol>
						</MDBRow>
						<MDBRow>
							<MDBCol>
								<WalletExport services={this.props.services}/>
							</MDBCol>
						</MDBRow>

					</MDBModalBody>
					<MDBModalFooter>
						<MDBBtn color="danger" onClick={this.disconnect.bind(this)}>Disconnect</MDBBtn>
					</MDBModalFooter>
				</MDBModal>

			</>
		);
	}
}

AccountManagementModal.propTypes =
{
	services: PropTypes.object,
};

export default AccountManagementModal;
