import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { ToastContainer, toast } from 'mdbreact';

class Notifications extends Component
{
	componentDidMount()
	{
		this.subscription = this.props.emitter.addListener('notification', this.notify.bind(this));
	}

	componentWillUnmount()
	{
		this.subscription.remove();
	}

	notify(type, message, options = {})
	{
		switch (type)
		{
			case 'info':    toast.info   (message, options); break;
			case 'success': toast.success(message, options); break;
			case 'warning': toast.warn   (message, options); break;
			case 'error':   toast.error  (message, options); break;
			default: break;
		}
	};

	render()
	{
		return <ToastContainer
				hideProgressBar={true}
				newestOnTop={true}
				autoClose={5000}
			/>
	}
}

Notifications.propTypes =
{
	emitter: PropTypes.object,
};

export default Notifications;
