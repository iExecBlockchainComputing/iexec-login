import { Wallet as ethersWallet} from 'ethers';

class Wallet
{
	constructor(sdk, emitter, config)
	{
		this.sdk     = sdk;
		this.config  = config;
		this.emitter = emitter;

		this.name       = null;
		this.proxy      = null;
		this.privateKey = null;
		this.address    = () => (new ethersWallet(this.privateKey)).address;
		this.execute    = this.execute.bind(this);
		this.sign       = this.sign.bind(this);
	}

	configure(wallet)
	{
		this.name       = wallet.name;
		this.proxy      = wallet.proxy;
		this.privateKey = wallet.privateKey;
		this.emitter.emit('setView', 'Main', { loading: false });

		this.subscription = this.sdk.subscribe(
			'AuthorisationsChanged',
			{ contractAddress: this.proxy },
			(authorisations) => this.emitter.emit('AuthorisationsChanged', authorisations),
		);
	}

	reset()
	{
		this.name       = null;
		this.proxy      = null;
		this.privateKey = null;
		this.emitter.emit('setView', 'Login', { loading: false });

		if (this.subscription)
		{
			this.subscription.remove();
			this.subscription = null;
		}
	}

	execute(tx)
	{
		tx.from     = tx.from     || this.proxy;
		tx.value    = tx.value    || 0;
		tx.data     = tx.data     || "0x";
		tx.gasToken = tx.gasToken || this.config.gasToken;
		tx.gasPrice = tx.gasPrice || 1000000000;
		tx.gasLimit = tx.gasLimit || 1000000;

		this.emitter.emit('setView', null, { loading: true })
		return new Promise((resolve, reject) => {
			this.sdk.execute(tx, this.privateKey)
			.then(resolve)
			.catch(reject)
			.finally(() => {
				this.emitter.emit('tx');
				this.emitter.emit('setView', null, { loading: false })
			});
		});
	}

	sign(msg)
	{
		return (new ethersWallet(this.privateKey)).signMessage(msg);
	}
}

export default Wallet;
