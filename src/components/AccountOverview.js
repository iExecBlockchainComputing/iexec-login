import React, { Component } from "react";
import PropTypes from 'prop-types';

import { MDBCard, MDBCardHeader, MDBCardBody, MDBRow, MDBCol, MDBIcon } from 'mdbreact';

import { utils, Contract } from 'ethers';
import ERC1836 from 'erc1836/build/contracts/ERC1836DelegateBase.json'

class AccountOverview extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {};
	}

	componentDidMount()
	{
		this.subscription = this.props.services.emitter.addListener('tx', this.refresh.bind(this));
		this.refresh();
	}

	componentWillUnmount()
	{
		this.subscription.remove();
	}

	async refresh()
	{
		this.props.services.provider.getBalance(this.props.services.identity.wallet.proxy)
			.then(balance => this.setState({balance : (balance/(Math.pow(10,18))).toString()}))
			.catch(console.error);

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
			.catch(console.error);
		}
		catch (e)
		{
			console.error(e);
		}
	}

	render()
	{
		return (
			<MDBCard>
				<MDBCardHeader>
					Your universaly upgradable account proxy
				</MDBCardHeader>
				<MDBCardBody>
					<MDBRow>
						<MDBCol size="3" className="text-right">Name:</MDBCol>
						<MDBCol size="9" className="text-left">{ this.props.services.identity.wallet.name }</MDBCol>
					</MDBRow>
					<MDBRow>
						<MDBCol size="3" className="text-right">Proxy:</MDBCol>
						<MDBCol size="7" className="text-left"><code>{ this.props.services.identity.wallet.proxy }</code></MDBCol>
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
						<MDBCol size="7" className="text-left"><code>{ this.state.delegate_current }</code></MDBCol>
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
						<MDBCol size="3" className="text-right">Balance:</MDBCol>
						<MDBCol size="7" className="text-left">{ this.state.balance }</MDBCol>
					</MDBRow>
				</MDBCardBody>
			</MDBCard>
		);
	}
}

AccountOverview.propTypes =
{
	services: PropTypes.object,
};

export default AccountOverview;
