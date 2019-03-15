import {Wallet} from 'ethers';


class IdentityService
{
	constructor(sdk, emitter, storageService, config)
	{
		this.sdk            = sdk;
		this.emitter        = emitter;
		this.storageService = storageService;
		this.config         = config;
		this.address        = () => (new Wallet(this.wallet.privateKey)).address;
	}

	async loadIdentity()
	{
		this.storageService.getIdentity().then(wallet => {
			if (wallet)
			{
				this.wallet = wallet;
				this.emitter.emit('setView', 'Main', { loading: false });
				return true;
			}
			return false;
		});
	}

	async storeIdentity(wallet)
	{
		this.storageService.storeIdentity(wallet);
	}

	async create(name)
	{
		this.emitter.emit('setView', null, { loading: true });
		this.sdk.create(name).then(([privateKey, proxy]) => {
			this.wallet = { name, privateKey, proxy };
			this.storeIdentity(this.wallet);
			this.emitter.emit('setView', 'Main', { loading: false });
		});
	}
	async connect(proxy)
	{
		console.log("Not implemented yet.", proxy);
		this.sdk.connect(proxy).then(privateKey => {
			console.log("LOGIN");
			// this.login.bind(this)({privateKey, proxy})
		})
	}

	async disconnect()
	{
		return this.storageService.clearStorage();
	}

	async import(encrypted, password)
	{
		// TODO: setView is late
		this.emitter.emit('setView', 'null', { loading: true })
		return new Promise((resolve, reject) => {
			Wallet.fromEncryptedJson(encrypted, password)
			.then(wallet => {
				const { name, proxy } = JSON.parse(encrypted);
				const { privateKey  } = wallet;
				this.wallet = { name, privateKey, proxy };
				this.storeIdentity(this.wallet);
				this.emitter.emit('setView', 'Main', { loading: false });
				resolve();
			})
			.catch(reject)
			.finally(() => {
				this.emitter.emit('setView', null, { loading: false })
			});
		});
	}

	async export(password)
	{
		this.emitter.emit('setView', null, { loading: true })
		return new Promise((resolve, reject) => {
			(new Wallet(this.wallet.privateKey)).encrypt(password)
			.then(encrypted => {
				resolve(JSON.stringify({ name: this.wallet.name, proxy: this.wallet.proxy, ...JSON.parse(encrypted) }));
			})
			.catch(reject)
			.finally(() => {
				this.emitter.emit('setView', null, { loading: false })
			});
		});
	}

	async execute(tx)
	{
		tx.from     = tx.from     || this.wallet.proxy;
		tx.gasToken = tx.gasToken || this.config.gasToken;
		tx.gasPrice = tx.gasPrice || 1000000000;
		tx.gasLimit = tx.gasLimit || 1000000;
		this.emitter.emit('setView', null, { loading: true })

		return new Promise((resolve, reject) => {
			this.sdk.execute(tx, this.wallet.privateKey)
			.then(resolve)
			.catch(reject)
			.finally(() => {
				this.emitter.emit('tx');
				this.emitter.emit('setView', null, { loading: false })
			});
		});
	}

	async signMessage(msg)
	{
		return (new Wallet(this.wallet.privateKey)).signMessage(msg);
	}
}

export default IdentityService;
