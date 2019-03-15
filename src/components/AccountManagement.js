import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { MDBContainer, MDBRow, MDBCol, MDBInput, MDBIcon, MDBBtn, MDBModal, MDBModalBody, MDBModalHeader, MDBModalFooter } from 'mdbreact';
import { utils, Contract } from 'ethers';
import ERC1836 from 'erc1836/build/contracts/ERC1836DelegateBase.json'
import copy from 'copy-to-clipboard';

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
		(new Contract(this.props.services.identity.wallet.proxy, ERC1836.abi, this.props.services.provider))
			.UUID()
			.then(uuid => this.setState({
				delegate_valid: uuid === process.env.REACT_APP_DELEGATEUUID
			}))
			.catch(e => this.setState({
				delegate_valid: false
			}));

		(new Contract(this.props.services.identity.wallet.proxy, ERC1836.abi, this.props.services.provider))
			.delegate()
			.then(delegate => this.setState({
				delegate_current: delegate,
				delegate_upgrade: delegate !== process.env.REACT_APP_DELEGATEADDR
			}))
			.catch(e => this.setState({
				delegate_upgrade: false
			}));
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
			.then(this.refresh.bind(this))
			.catch(console.error);
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
		this.props.services.identity.disconnect().then(() => this.props.services.emitter.emit('setView', 'Login'));
	}

	render()
	{
		return (
			<MDBContainer className="accountmanagement-view">
				<MDBIcon icon="user-circle" className="toggle clickable" onClick={this.toggle.bind(this)}>
					{ this.state.delegate_upgrade ? <MDBIcon icon="circle" className="notification text-warning"/> : null }
				</MDBIcon>


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
