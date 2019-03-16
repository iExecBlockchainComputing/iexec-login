import React, { Component } from "react";
import PropTypes from 'prop-types';

import {
	MDBBtn,
	MDBCard,
	MDBCardBody,
	MDBCardHeader,
	MDBIcon,
	MDBTable,
	MDBTableBody,
	MDBTableHead,
} from 'mdbreact';

import { Contract } from 'ethers';
import ERC20 from 'openzeppelin-solidity/build/contracts/ERC20Detailed.json'

class AssetsOverviewCard extends Component
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

	async refresh(event)
	{
		this.props.services.provider.getBalance(this.props.services.identity.wallet.proxy)
		.then(balance => this.setState({balance : (balance/(Math.pow(10,18))).toString()}))
		.catch(console.error);

		Promise.all(
			this.props.services.config.assets
			.map(address => new Contract(address, ERC20.abi, this.props.services.provider))
			.map(contract => Promise.all([
				contract.address,
				contract.name(),
				contract.symbol(),
				contract.balanceOf(this.props.services.identity.wallet.proxy),
				contract.decimals(),
			]))
		)
		.then(assets => this.setState({ assets }))
		.catch(console.error);
	}

	render()
	{
		return (
			<MDBCard>
				<MDBCardHeader>
					Account balance
				</MDBCardHeader>
				<MDBCardBody>
					<MDBTable btn fixed hover scrollY maxHeight="30vh">
						<MDBTableHead color="blue-gradient" textWhite>
							<tr>
								<th>Name</th>
								<th>Symbol</th>
								<th>Balance</th>
								<th>Address</th>
							</tr>
						</MDBTableHead>
						<MDBTableBody>
						<tr key="0">
							<th>Ether</th>
							<th>ETH</th>
							<th>{ this.state.balance }</th>
							<th></th>
						</tr>
						{
							this.state.assets
							? this.state.assets.map(asset =>
								<tr key={asset[0]}>
									<th>{ asset[1] }</th>
									<th>{ asset[2] }</th>
									<th>{ (asset[3]/(Math.pow(10,asset[4]))).toString() }</th>
									<th><code className="address">{ asset[0] }</code></th>
								</tr>
							)
							: null
						}
						</MDBTableBody>
					</MDBTable>
					<MDBBtn gradient="ripe-malinka" className="m-3 py-2">
						Buy tokens
						<MDBIcon icon="shopping-cart" className="ml-1" />
					</MDBBtn>
				</MDBCardBody>
			</MDBCard>
		);
	}
}

AssetsOverviewCard.propTypes =
{
	services: PropTypes.object,
};

export default AssetsOverviewCard;
