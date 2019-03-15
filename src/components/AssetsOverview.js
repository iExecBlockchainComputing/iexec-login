import React, { Component } from "react";
import PropTypes from 'prop-types';

import { MDBCard, MDBCardHeader, MDBCardBody } from 'mdbreact';

class AssetsOverview extends Component
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
	}

	render()
	{
		return (
			<MDBCard>
				<MDBCardHeader>
					Account balance
				</MDBCardHeader>
				<MDBCardBody>
				{ this.state.balance }
				</MDBCardBody>
			</MDBCard>
		);
	}
}

AssetsOverview.propTypes =
{
	services: PropTypes.object,
};

export default AssetsOverview;
