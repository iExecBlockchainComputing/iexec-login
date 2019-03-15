import React, { Component } from "react";
import PropTypes from 'prop-types';

import logo from '../assets/logo.svg';
import "../css/Header.css";

class Header extends Component
{
	render()
	{
		return (
			<header>
				<img src={logo} className="logo" alt="logo" />
				<span className="title">iExec Login</span>
			</header>
		);
	}
}

Header.propTypes =
{
	services: PropTypes.object,
	setView:  PropTypes.func,
};

export default Header;
