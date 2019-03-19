import React, { Component } from "react";
import PropTypes from 'prop-types';

import Identity from 'universal-login-contracts/build/Identity'

import {
	MDBBtn,
	MDBIcon,
	MDBModal,
	MDBModalBody,
	MDBModalHeader,
	MDBTable,
	MDBTableBody,
	MDBTableHead,
} from 'mdbreact';

import "../css/AuthorisationListModal.css";

class AuthorisationListModal extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			modal: false,
			pendingAuthorisations: []
		};
	}

	componentDidMount()
	{
		this.subscription = this.props.services.emitter.addListener('AuthorisationsChanged', this.handleAuthorisations.bind(this));
	}

	componentWillUnmount()
	{
		this.subscription.remove();
	}

	handleAuthorisations(pendingAuthorisations)
	{
		this.setState({ pendingAuthorisations });
		if (!pendingAuthorisations)
		{
			this.setState({ modal: false });
		}
	}

	toggle()
	{
		this.setState({ modal: !this.state.modal });
	}

	accept(request)
	{
		// console.log(request)
		// console.log(Identity)

		const filter = {
			contractAddress: this.props.services.wallet.proxy,
			key: request.key
		};
		const subscription = this.props.services.sdk.subscribe(
			'KeyAdded',
			filter,
			(keyInfo) => {
				console.log("KeyAdded", keyInfo);
				subscription.remove();
			}
		);


		this.props.services.sdk.addKey(
			this.props.services.wallet.proxy,
			request.key,
			this.props.services.wallet.privateKey,
			{
				// transactionDetails,
				gasToken: this.props.services.config.gasToken,
				gasPrice: 1000000000,
				gasLimit: 1000000,
			},
		)
		.then(console.log)
		.catch(console.error);
	}

	reject(request)
	{
		this.props.services.sdk.denyRequest(
			this.props.services.wallet.proxy,
			request.key,
		);
	}

	render()
	{
		return (
			!!this.state.pendingAuthorisations.length &&
			<>
				<MDBBtn id="pending-authorisations-modal-toggle" size="sm" gradient="peach" className="p-2" onClick={this.toggle.bind(this)} floating rounded>
					{this.state.pendingAuthorisations.length} request(s)
				</MDBBtn>
				<MDBModal id="pending-authorisations-modal" isOpen={this.state.modal} toggle={this.toggle.bind(this)} centered>
					<MDBTable btn fixed>
						<MDBTableHead color="blue-gradient" textWhite>
							<tr>
								<th>Time</th>
								<th>Browser</th>
								<th>OS</th>
								<th>City</th>
								<th></th>
							</tr>
						</MDBTableHead>
						<MDBTableBody>
							{
								this.state.pendingAuthorisations.map(request =>
									<tr key={request.key}>
										<td>{request.deviceInfo.time}</td>
										<td>{request.deviceInfo.browser}</td>
										<td>{request.deviceInfo.os}</td>
										<td>{request.deviceInfo.city}</td>
										<td>
											<a href="#!" onClick={this.accept.bind(this, request)}>
												<MDBIcon className="ml-2 text-success" icon="check"/>
												</a>
											<a href="#!" onClick={this.reject.bind(this, request)}>
												<MDBIcon className="ml-2 text-danger"  icon="times"/>
												</a>
										</td>
									</tr>
								)
							}
						</MDBTableBody>
					</MDBTable>
				</MDBModal>
			</>
		);
	}
}

AuthorisationListModal.propTypes =
{
	services: PropTypes.object
};

export default AuthorisationListModal;
