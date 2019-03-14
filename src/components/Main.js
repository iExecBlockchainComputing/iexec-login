import React, { Component } from "react";
import PropTypes from 'prop-types';

import { ethers } from 'ethers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faTimes, faArrowCircleUp   } from '@fortawesome/free-solid-svg-icons'

import Header from './Header';

import "../css/Main.css";



const abi = [
	"function UUID() view returns(bytes32)",
	"function delegate() view returns(address)",
	"function updateDelegate(address,bytes)",
	"function getData(bytes32) view returns(bytes32)",
	"function setData(bytes32,bytes32)",
];



class Main extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {};

		this.loadBalance   = this.loadBalance.bind(this);
		this.checkDelegate = this.checkDelegate.bind(this);
		this.upgrade       = this.upgrade.bind(this);
		this.export        = this.export.bind(this);
		this.disconnect    = this.disconnect.bind(this);
		this.execute       = this.execute.bind(this);

		this.loadBalance();
		this.checkDelegate();
	}


	async execute(tx)
	{
		this.props.setView('Main', { loading: true });
		tx.from     = tx.from     || this.props.services.wallet.contractAddress;
		tx.gasToken = tx.gasToken || this.props.services.config.gasToken;
		tx.gasPrice = tx.gasPrice || 1000000000;
		tx.gasLimit = tx.gasLimit || 1000000;
		return new Promise((resolve, reject) => {
			this.props.services.sdk.execute(tx, this.props.services.wallet.privateKey)
			.then(() => {
				this.props.setView('Main', { loading: false });
				resolve();
			})
			.catch(e => {
				this.props.setView('Main', { loading: false });
				reject(e);
			})
		});
	}


	async loadBalance()
	{
		this.props.services.provider.getBalance(this.props.services.wallet.contractAddress).then(balance => this.setState({balance : (balance/(Math.pow(10,18))).toString()}));
	}

	async checkDelegate()
	{
		(new ethers.Contract(this.props.services.wallet.contractAddress, abi, this.props.services.provider))
			.UUID()
			.then(uuid => this.setState({
				delegate_valid: uuid === process.env.REACT_APP_DELEGATEUUID
			}))
			.catch(e => this.setState({
				delegate_valid: false
			}));
		(new ethers.Contract(this.props.services.wallet.contractAddress, abi, this.props.services.provider))
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
			const initData   = new ethers.utils.Interface(["fakeinitialize()"]).functions.fakeinitialize.encode([]);
			const updateData = new ethers.utils.Interface(["updateDelegate(address,bytes)"]).functions.updateDelegate.encode([ process.env.REACT_APP_DELEGATEADDR, initData ]);
			this.execute({
				to:       this.props.services.wallet.contractAddress,
				data:     updateData,
				value:    "0",
			})
			.then(this.checkDelegate)
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
		this.execute({
			to:       event.target.to.value,
			data:     event.target.data.value,
			value:    Math.floor(parseFloat(event.target.value.value)*10**18).toString(),
		})
		.then(this.loadBalance)
		.catch(console.error);
	}

	async sign(event)
	{
		event.preventDefault();
		console.log("address:", (new ethers.Wallet(this.props.services.wallet.privateKey)).address);
		(new ethers.Wallet(this.props.services.wallet.privateKey))
			.signMessage(event.target.content.value)
			.then(signature => console.log("signature:", signature));
	}

	async export(event)
	{
		event.preventDefault()
		this.props.setView('Main', { loading: true });
		(new ethers.Wallet(this.props.services.wallet.privateKey))
			.encrypt(event.target.password.value)
			.then(console.log)
			.catch(console.error)
			.finally(() => this.props.setView('Main', { loading: false }));
	}

	async disconnect(event)
	{
		this.props.services.storageService.clearStorage().then(() => this.props.setView('Login'));
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
								<div className="col-3 text-right">Proxy:</div>
								<div className="col-7 text-left"><code>{this.props.services.wallet.contractAddress}</code></div>
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
									? <FontAwesomeIcon className="text-warning clickable" icon={faArrowCircleUp} onClick={this.upgrade}/>
									: <FontAwesomeIcon className="text-success" icon={faCheck} />
								}
								</div>
							</div>
							<div className="row">
								<div className="col-3 text-right">Balance:</div>
								<div className="col-9 text-left"><code>{this.state.balance} ETH</code></div>
							</div>
							<br/>
							<form className="row col-10 offset-1" onSubmit={this.export}>
								<div className="input-group">
									<input type="password" className="form-control" placeholder="Password" name="password" />
									<div className="input-group-append">
										<button className="btn btn-sm btn-outline-secondary" type="submit">Export wallet</button>
										<button className="btn btn-sm btn-outline-danger" onClick={this.disconnect}>Disconnect</button>
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
	setView:  PropTypes.func,
};

export default Main;
