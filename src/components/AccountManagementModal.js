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
			master_current: null,
			master_valid:   false,
			master_upgrade: false,
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
			(new Contract(this.props.services.wallet.proxy, IMaster.abi, this.props.services.provider)).master(),
			(new Contract(this.props.services.wallet.proxy, IMaster.abi, this.props.services.provider)).masterId(),
		])
		.then(([master, masterId]) => {
			let master_current = master;
			let master_valid   = masterId === this.props.services.config.masterId;
			let master_upgrade = master   !== this.props.services.config.masterAddr;
			this.setState({ master_current, master_valid, master_upgrade });
			if      (!master_valid ) { this.props.services.emitter.emit('notification', 'error',   'Invalid master' ); }
			else if (master_upgrade) { this.props.services.emitter.emit('notification', 'warning', 'Upgrade available'); }
		})
		.catch(e => {
			this.setState({
				master_current: null,
				master_valid:   false,
				master_upgrade: false,
			});
			console.error(e);
		});
	}

	async upgrade(event)
	{
		event.preventDefault()
		try
		{
			const initData   = new utils.Interface(["initialize()"]).functions.initialize.encode([]);
			const updateData = new utils.Interface(["updateMaster(address,bytes)"]).functions.updateMaster.encode([ this.props.services.config.masterAddr, initData, false ]);
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
					{ this.state.master_upgrade && <MDBIcon icon="circle" size="1x" className="corner text-warning"/> }
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
									! this.state.master_valid
									? <MDBIcon className="text-danger" icon="times" />
									: <MDBIcon className="text-success" icon="check" />
								}
							</MDBCol>
						</MDBRow>
						<MDBRow>
							<MDBCol size="3" className="text-right">Delegate:</MDBCol>
							<MDBCol size="7" className="text-left overflow-scrool"><code>{ this.state.master_current }</code></MDBCol>
							<MDBCol size="2" className="text-left">
								{
									! this.state.master_valid
									? <MDBIcon className="text-danger" icon="times" />
									: this.state.master_upgrade
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
