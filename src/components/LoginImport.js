import React, { Component } from "react";
import PropTypes from 'prop-types';

// import mdbreact from "mdbreact";

// import FormControl from 'react-bootstrap/FormControl';
// import InputGroup  from 'react-bootstrap/InputGroup';
// import Button      from 'react-bootstrap/Button';

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faFileImport   } from '@fortawesome/free-solid-svg-icons'

import logo from '../assets/logo.svg';
// import "../css/Login.css";

class LoginImport extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {};
	}

	render()
	{
		return (
			<div className="login-view">
				<div className="login-card">
					<div className="login-header">
						<img src={logo} className="logo" alt="logo" />
						<span className="title">iExec Login</span>
					</div>
					<div className="login-body">


					</div>
				</div>
			</div>
		);
	}
}
  // <div class="custom-file">
  // </div>
  // <div class="input-group-append">
    // <span class="input-group-text" id="inputGroupFileAddon02">Upload</span>
  // </div>


						// <form>
						// 	<div className="form-row input-group">
						// 		<input type="password" className="form-control" placeholder="wallet's password" />
						// 		<div className="input-group-append">
						// 			<button className="btn btn-light">Import</button>
						// 		</div>
						// 	</div>
						// </form>

LoginImport.propTypes =
{
	services: PropTypes.object,
};

export default LoginImport;
