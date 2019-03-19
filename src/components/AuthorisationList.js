import React, { Component } from "react";
import PropTypes from 'prop-types';


import {
	MDBIcon,
	MDBTable,
	MDBTableBody,
	MDBTableHead,
} from 'mdbreact';


class AuthorisationList extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {
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
		console.log(pendingAuthorisations)
	}


	reject(request)
	{
		console.log(request)
		this.props.services.sdk.denyRequest(request.key, this.props.services.wallet.proxy)
		.then(console.log)
		.catch(console.error);
	}

	render()
	{
		return (
			<>
				<span>GOT {this.state.pendingAuthorisations.length} requests</span>

				{
					!!this.state.pendingAuthorisations.length &&


<MDBTable btn fixed hover scrollY maxHeight="30vh">
<MDBTableHead color="blue-gradient" textWhite>
	<tr>
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
				<td>{request.deviceInfo.browser}</td>
				<td>{request.deviceInfo.os}</td>
				<td>{request.deviceInfo.city}</td>
				<td>
					<a href="#!">
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

				}

			</>
		);
	}
}

AuthorisationList.propTypes =
{
	services: PropTypes.object
};

export default AuthorisationList;
