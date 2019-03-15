import React, { Component } from "react";
import PropTypes from 'prop-types';

import { utils, Contract, Wallet } from 'ethers';
import ERC1836 from 'erc1836/build/contracts/ERC1836DelegateBase.json'



import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faTimes, faArrowCircleUp   } from '@fortawesome/free-solid-svg-icons'

import Header from './Header';
import "../css/Main.css";


class Main extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {};

		this.loadBalance();
		this.checkDelegate();
	}

	async loadBalance()
	{
		this.props.services.provider.getBalance(this.props.services.identity.wallet.address)
			.then(balance => this.setState({balance : (balance/(Math.pow(10,18))).toString()}))
			.catch(console.error);
	}

	async checkDelegate()
	{
		(new Contract(this.props.services.identity.wallet.address, ERC1836.abi, this.props.services.provider))
			.UUID()
			.then(uuid => this.setState({
				delegate_valid: uuid === process.env.REACT_APP_DELEGATEUUID
			}))
			.catch(e => this.setState({
				delegate_valid: false
			}));
		(new Contract(this.props.services.identity.wallet.address, ERC1836.abi, this.props.services.provider))
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
				to:    this.props.services.identity.wallet.address,
				data:  updateData,
				value: "0",
			})
			.then(this.checkDelegate.bind(this))
			.catch(console.error);
		}
		catch (e)
		{
			console.error(e);
		}
	}

	async transaction(event)
	{
		event.preventDefault()

		this.props.services.identity.execute({
			to:    event.target.to.value,
			data:  event.target.data.value,
			value: Math.floor(parseFloat(event.target.value.value)*10**18).toString(),
		})
		.then(this.loadBalance.bind(this))
		.catch(console.error);
	}

	async sign(event)
	{
		event.preventDefault();
		this.props.services.identity.sign(event.target.content.value)
			.then(signature => {

				console.log("public:", (new Wallet(this.props.services.identity.wallet.privateKey)).address);
				console.log("signature:", signature);
			})
			.catch(console.error);
	}

	async export(event)
	{
		event.preventDefault()
		this.props.services.identity.export(event.target.password.value)
			.then(console.log)
			.catch(console.error);
	}

	async disconnect(event)
	{
		this.props.services.identity.disconnect().then(() => this.props.services.emitter.emit('setView', 'Login'));
	}

	render()
	{
				// <Header services={this.props.services} setView={this.props.setView}/>
		return (
			<div className="main-view">
				<div className="container">
					<div className="card bg-light shadow">
						<h5 className="card-header">Your universaly upgradable account proxy</h5>
						<div className="card-body">
							<div className="row">
								<div className="col-3 text-right">Name:</div>
								<div className="col-9 text-left">{ this.props.services.identity.wallet.name }</div>
							</div>
							<div className="row">
								<div className="col-3 text-right">Proxy:</div>
								<div className="col-7 text-left"><code>{this.props.services.identity.wallet.address}</code></div>
								<div className="col-2 text-left">
								{
									! this.state.delegate_valid
									? <FontAwesomeIcon className="text-danger" icon={faTimes} />
									: <FontAwesomeIcon className="text-success" icon={faCheck} />
								}
								</div>
							</div>
							<div className="row">
								<div className="col-3 text-right">Delegate:</div>
								<div className="col-7 text-left"><code>{this.state.delegate_current}</code></div>
								<div className="col-2 text-left">
								{
									! this.state.delegate_valid
									? <FontAwesomeIcon className="text-danger" icon={faTimes} />
									: this.state.delegate_upgrade
									? <FontAwesomeIcon className="text-warning clickable" icon={faArrowCircleUp} onClick={this.upgrade.bind(this)}/>
									: <FontAwesomeIcon className="text-success" icon={faCheck} />
								}
								</div>
							</div>
							<div className="row">
								<div className="col-3 text-right">Balance:</div>
								<div className="col-9 text-left"><code>{this.state.balance} ETH</code></div>
							</div>
							<br/>
							<form className="row col-10 offset-1" onSubmit={this.export.bind(this)}>
								<div className="input-group">
									<input type="password" className="form-control" placeholder="Password" name="password" />
									<div className="input-group-append">
										<button className="btn btn-sm btn-outline-secondary" type="submit">Export wallet</button>
										<button className="btn btn-sm btn-outline-danger" onClick={this.disconnect.bind(this)}>Disconnect</button>
									</div>
								</div>
							</form>
						</div>
					</div>
					<div className="card bg-light shadow">
						<h5 className="card-header">Send transaction</h5>
						<div className="card-body">
							<form onSubmit={this.transaction.bind(this)}>
								<div className="input-group mb-3 no-gutters">
													<div className="input-group-prepend col-2"><span className="input-group-text col-12">Value</span></div>
									<input type="text" name="value" className="form-control" defaultValue="0.1"/>
									<div className="input-group-append"><span className="input-group-text">ETH</span></div>
								</div>
								<div className="input-group mb-3 no-gutters">
									<div className="input-group-prepend col-2"><span className="input-group-text col-12">To</span></div>
									<input type="text" name="to" className="form-control" defaultValue="0x1234567890000000000000000000000000000000"/>
								</div>
								<div className="input-group mb-3 no-gutters">
									<div className="input-group-prepend col-2"><span className="input-group-text col-12">Data</span></div>
									<input type="text" name="data" className="form-control" defaultValue="0x"/>
								</div>
								<button type="submit" className="btn btn-secondary btn-block">Send transaction</button>
							</form>
						</div>
					</div>
					<div className="card bg-light shadow">
						<h5 className="card-header">Sign message</h5>
						<div className="card-body">
							<form onSubmit={this.sign.bind(this)}>
								<div className="input-group mb-3 no-gutters">
									<textarea name="content" className="form-control" rows="3"></textarea>
								</div>
								<button type="submit" className="btn btn-secondary btn-block">Sign</button>
							</form>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

Main.propTypes =
{
	services: PropTypes.object,
};

export default Main;
