import React, { Component } from "react";
import "./App.css";
import Loading from './Loading';
import Header  from './Header';

import UniversalLoginSDK from "universal-login-sdk";
import { ethers } from 'ethers';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';

var Registrar = require('ethers-ens');





const domains = [
	"mylogin.eth",
	"universal-id.eth",
	"popularapp.eth",
	"users.iexec.eth",
];
const abi = [
	"function UUID() view returns(bytes32)",
	"function delegate() view returns(address)",
	"function updateDelegate(address,bytes)",
	"function getData(bytes32) view returns(bytes32)",
	"function setData(bytes32,bytes32)",
];
const erc1836uuid    = "0xa1e3d116360d73112f374a2ed4cd95388cd39eaf5a7986eb95efa60ae0ffda4d";
const latestDelegate = "0x915fB4bF4C23a3DEC36C140a7E73dCF85C6D9e22";
const gasToken       = "0x0E2365e86A50377c567E1a62CA473656f0029F1e";






class App extends Component
{
	static propTypes =
	{
		cookies: instanceOf(Cookies).isRequired
	};

	constructor(props)
	{
		super(props);

		const { cookies } = props;
		this.state = {
			loading:         true,
			upgrade:         false,
			usernameList:    [],
			privateKey:      cookies.get('privateKey'     ) || "",
			contractAddress: cookies.get('contractAddress') || "",
			balance:         0,
		};

		this.loadBalance   = this.loadBalance.bind(this);
		this.checkDelegate = this.checkDelegate.bind(this);

		this.sdk                         = new UniversalLoginSDK('http://localhost:3311', 'http://localhost:18545');
		this.provider                    = new ethers.providers.JsonRpcProvider('http://localhost:18545');
		this.registrar                   = new Registrar(this.provider);
		this.registrar.config.ensAddress = '0x67AC97e1088C332cBc7a7a9bAd8a4f7196D5a1Ce';

		this.loadBalance();
		this.checkDelegate();
		this.state.loading = false;
	}

	async disconnect(event)
	{
		const { cookies } = this.props;
		cookies.set('privateKey',      "", { path: '/' });
		cookies.set('contractAddress', "", { path: '/' });
		this.setState({
			privateKey:      "",
			contractAddress: "",
			balance:         0,
		});
	}

	async loadBalance()
	{
		this.sdk.provider.getBalance(this.state.contractAddress).then(balance => this.setState({balance : (balance/(Math.pow(10,18))).toString()}));
	}

	async checkDelegate()
	{
		(new ethers.Contract(this.state.contractAddress, abi, this.provider))
			.UUID()
			.then(uuid => this.setState({ delegate_invalid: uuid !== erc1836uuid }))
			.catch(e => this.setState({ delegate_invalid: false }));

		(new ethers.Contract(this.state.contractAddress, abi, this.provider))
			.delegate()
			.then(delegate => this.setState({ delegate_upgrade: delegate !== latestDelegate }))
			.catch(e => this.setState({ delegate_upgrade: false }));
	}

	// LOGIN
	handleChange(event)
	{
		let [label, node] = event.target.value.split(".")
		Promise.all(
			domains
			.filter(domain => domain.startsWith(node?node:""))
			.map(domain => [label, domain].join('.'))
			.map(username => this.registrar.getAddress(username).then(wallet => [username, wallet]))
		)
		.then(results => {
			let usernameList = (label) ? (
				<ul>
				{
					results.map(([ username, wallet ]) => (
						<li key={username} className={wallet?"connect":"create"} onClick={wallet?this.login.bind(this, wallet):this.register.bind(this, username)}>{username}</li>
					))
				}
				</ul>
			) : null;
			this.setState({ usernameList });
		})
		.catch(e => {
			console.error(e);
		})
	}

	async register(username)
	{
		try
		{
			this.setState({ loading: true });

			const [ privateKey, contractAddress ] = await this.sdk.create(username);

			const { cookies } = this.props;
			cookies.set('privateKey',      privateKey,      { path: '/' });
			cookies.set('contractAddress', contractAddress, { path: '/' });
			this.setState({ privateKey, contractAddress });
			this.loadBalance();
			this.checkDelegate();
		}
		catch (e)
		{
			console.log(e);
		}
		finally
		{
			this.setState({
				usernameList: [],
				loading: false,
			});
		}
	}

	async login(contractAddress)
	{
		try
		{
			this.setState({ loading: true });

			console.log("login to", contractAddress)
			const privateKey = await this.sdk.connect(contractAddress);

			const { cookies } = this.props;
			cookies.set('privateKey',      privateKey,      { path: '/' });
			cookies.set('contractAddress', contractAddress, { path: '/' });
			this.setState({ privateKey, contractAddress });
			this.loadBalance();
			this.checkDelegate();
		}
		catch (e)
		{
			console.log(e);
		}
		finally
		{
			this.setState({
				usernameList: [],
				loading: false,
			});
		}
	}

	// USERPANEL
	async upgrade()
	{
		try
		{
			this.setState({ loading: true });

			const initData   = new ethers.utils.Interface(["fakeinitialize()"]).functions.fakeinitialize.encode([]);
			const updateData = new ethers.utils.Interface(["updateDelegate(address,bytes)"]).functions.updateDelegate.encode([ latestDelegate, initData ]);

			const message = {
				from:     this.state.contractAddress,
				to:       this.state.contractAddress,
				data:     updateData,
				value:    "0",
				gasToken: gasToken,
				gasPrice: 1000000000,
				gasLimit: 1000000
			};

			this.sdk.execute(message, this.state.privateKey).then(this.checkDelegate);
		}
		catch (e)
		{
			console.log(e);
		}
		finally
		{
			this.setState({ loading: false });
		}
	}

	async execute(event)
	{
		event.preventDefault()

		const message = {
			from:     this.state.contractAddress,
			to:       event.target.recipient.value,
			data:     "0x0",
			value:    "100000000000000000",
			gasToken: "0x0E2365e86A50377c567E1a62CA473656f0029F1e", // get this address from your terminal
			gasPrice: 1000000000,
			gasLimit: 1000000
		};
		await this.sdk.execute(message, this.state.privateKey);
		this.loadBalance();
	}

	async sign(event)
	{
		event.preventDefault();
		console.log("address:", (new ethers.Wallet(this.state.privateKey)).address);
		(new ethers.Wallet(this.state.privateKey))
			.signMessage(event.target.message.value)
			.then(signature => console.log("signature:", signature));
	}

	// RENDER
	render()
	{
		return this.state.loading ? (
			<Loading/>
		) : (
			<div className="App">
				<Header/>
				<div className="App-wrapper">
					{
						this.state.contractAddress === "" ? (
							<div className="login">
								<h2>UUAP for iExec</h2>
								<input type="text" name="ens-login" placeholder="your username" onChange={this.handleChange.bind(this)}/>
								{this.state.usernameList}
							</div>
						) : (
							<div className="userpanel">
								<div className="disconnect" onClick={this.disconnect.bind(this)}>Disconnect</div>
								{
									this.state.delegate_invalid
									? <div className="footnote error">This account is not a valid proxy</div>
									: this.state.delegate_upgrade
									? <div className="footnote warning clickable" onClick={this.upgrade.bind(this)}>Upgrade available</div>
									: <div className="footnote success">Account is up to date</div>
								}
								<form onSubmit={this.execute.bind(this)}>
									Your contract address: {this.state.contractAddress} <br /> <br />
									Your balance: {this.state.balance} <br /> <br />
									<input type="text" name="recipient" defaultValue="0x1234567890000000000000000000000000000000"/>
									<button type="submit"> Transfer 0.1 ether </button> <br/>
								</form>
								<form onSubmit={this.sign.bind(this)}>
									<textarea name="message"></textarea>
									<button type="submit"> Sign </button> <br/>
								</form>
							</div>
						)
					}
				</div>
			</div>
		)
	}
}

export default withCookies(App);
