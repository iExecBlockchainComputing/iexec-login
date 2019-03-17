import React, { Component } from "react";
import PropTypes from 'prop-types';

import AccountManagementModal from './AccountManagementModal';
import AssetsOverviewCard     from './AssetsOverviewCard';
import TransactionCard        from './TransactionCard';
import SignatureCard          from './SignatureCard';
import "../css/Main.css";

class Main extends Component
{
	render()
	{
		return (
			<div id="main">
				<AccountManagementModal services={this.props.services}/>
				<div className="container">
					<AssetsOverviewCard services={this.props.services}/>
					<TransactionCard    services={this.props.services}/>
					<SignatureCard      services={this.props.services}/>
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
