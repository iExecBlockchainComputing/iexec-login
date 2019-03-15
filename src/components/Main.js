import React, { Component } from "react";
import PropTypes from 'prop-types';

import AccountManagement    from './AccountManagement';
import AssetsOverview       from './AssetsOverview';
import TransactionInterface from './TransactionInterface';
import SignatureInterface   from './SignatureInterface';
import "../css/Main.css";

class Main extends Component
{
	render()
	{
		return (
			<div className="main-view">
				<div className="container">
					<AccountManagement    services={this.props.services}/>
					<AssetsOverview       services={this.props.services}/>
					<TransactionInterface services={this.props.services}/>
					<SignatureInterface   services={this.props.services}/>
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
