import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { MDBContainer, MDBBtn, MDBModal, MDBModalHeader, MDBModalBody, MDBModalFooter, MDBRow, MDBCol, MDBIcon } from 'mdbreact';
import { utils, Contract } from 'ethers';
import copy from 'copy-to-clipboard';

import ERC1836 from 'erc1836/build/contracts/ERC1836DelegateBase.json'

import "../css/AccountManagement.css";

class AccountManagement extends Component
{
	constructor(props)
	{
		super(props);
		this.state = { modal: false }
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
			(new Contract(this.props.services.identity.wallet.proxy, ERC1836.abi, this.props.services.provider)).UUID(),
			(new Contract(this.props.services.identity.wallet.proxy, ERC1836.abi, this.props.services.provider)).delegate(),
		])
		.then(([uuid, delegate]) => {
			let delegate_current = delegate;
			let delegate_valid   = uuid === process.env.REACT_APP_DELEGATEUUID;
			let delegate_upgrade = delegate !== process.env.REACT_APP_DELEGATEADDR;
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
			const initData   = new utils.Interface(["fakeinitialize()"]).functions.fakeinitialize.encode([]);
			const updateData = new utils.Interface(["updateDelegate(address,bytes)"]).functions.updateDelegate.encode([ process.env.REACT_APP_DELEGATEADDR, initData ]);
			this.props.services.identity.execute({
				to:    this.props.services.identity.wallet.proxy,
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

	async export(event)
	{
		event.preventDefault()
		this.props.services.identity.export(event.target.password.value)
		.then(encrypted => {
			copy(encrypted, {  message: 'Press #{key} to copy' })
		})
		.catch(console.error);
	}

	async disconnect(event)
	{
		this.props.services.identity.disconnect().then(() => {
			this.props.services.emitter.emit('notification', 'error', 'Disconnected');
			this.props.services.emitter.emit('setView', 'Login');
		});
	}

	render()
	{
		return (
			<MDBContainer className="accountmanagement-view">
				<MDBIcon icon="user-circle" className="fa-3x toggle clickable" onClick={this.toggle.bind(this)}></MDBIcon>
				{ this.state.delegate_upgrade ? <MDBIcon icon="circle" className="fa-1x notification text-warning"/> : null }


				<MDBModal isOpen={this.state.modal} toggle={this.toggle.bind(this)} fullHeight position="right">
					<MDBModalHeader toggle={this.toggle.bind(this)}>
						Account management
					</MDBModalHeader>
					<MDBModalBody>

<MDBRow>
	<MDBCol size="3" className="text-right">Name:</MDBCol>
	<MDBCol size="9" className="text-left">{ this.props.services.identity.wallet.name }</MDBCol>
</MDBRow>
<MDBRow>
	<MDBCol size="3" className="text-right">Proxy:</MDBCol>
	<MDBCol size="7" className="text-left"><code className="address">{ this.props.services.identity.wallet.proxy }</code></MDBCol>
	<MDBCol size="2" className="text-left">
		{
			! this.state.delegate_valid
			? <MDBIcon className="text-danger" icon="times" />
			: <MDBIcon className="text-success" icon="check" />
		}
	</MDBCol>
</MDBRow>
<MDBRow>
	<MDBCol size="3" className="text-right">Deleate:</MDBCol>
	<MDBCol size="7" className="text-left"><code className="address">{ this.state.delegate_current }</code></MDBCol>
	<MDBCol size="2" className="text-left">
		{
			! this.state.delegate_valid
			? <MDBIcon className="text-danger" icon="times" />
			: this.state.delegate_upgrade
			? <MDBIcon className="text-warning clickable" icon="arrow-circle-up" onClick={this.upgrade.bind(this)}/>
			: <MDBIcon className="text-success" icon="check" />
		}
	</MDBCol>
</MDBRow>

						<MDBRow>
							<MDBCol>
								<span>Export wallet</span>
								<form className="md-form input-group" onSubmit={this.export.bind(this)}>
									<input type="password" name="password" className="form-control" placeholder="password"/>
									<div className="input-group-append">
										<MDBBtn color="primary" className="m-0 py-2" type="submit">
											<MDBIcon icon="file-export" className="ml-1" />
										</MDBBtn>
									</div>
								</form>
							</MDBCol>
						</MDBRow>

					</MDBModalBody>
					<MDBModalFooter>
						<MDBBtn color="danger" onClick={this.disconnect.bind(this)}>Disconnect</MDBBtn>
					</MDBModalFooter>
				</MDBModal>
			</MDBContainer>
		);
	}
}

AccountManagement.propTypes =
{
	services: PropTypes.object,
};

export default AccountManagement;
