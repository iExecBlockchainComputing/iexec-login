import {Wallet} from 'ethers';


class IdentityService
{
	constructor(sdk, emitter, storageService, config)
	{
		this.sdk            = sdk;
		this.emitter        = emitter;
		this.storageService = storageService;
		this.config         = config;
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
		this.emitter.emit('setView', 'Login', { loading: true });
		this.sdk.create(name).then(([privateKey, address]) => {
			this.wallet = { name, privateKey, address };
			this.storeIdentity(this.wallet);
			this.emitter.emit('setView', 'Main', { loading: false });
		});
	}
	async connect(username)
	{
		console.log("Not implemented yet.");
		// this.sdk.connect(contractAddress).then(privateKey => {
		//	this.login.bind(this)({privateKey, contractAddress})
		// })
	}

	async disconnect()
	{
		return this.storageService.clearStorage();
	}

	async export(password)
	{
		this.emitter.emit('setView', null, { loading: true })
		return new Promise((resolve, reject) => {
			(new Wallet(this.wallet.privateKey)).encrypt(password)
			.then(resolve)
			.catch(reject)
			.finally(() => this.emitter.emit('setView', null, { loading: false }));
		});
	}

	async execute(tx)
	{
		tx.from     = tx.from     || this.wallet.address;
		tx.gasToken = tx.gasToken || this.config.gasToken;
		tx.gasPrice = tx.gasPrice || 1000000000;
		tx.gasLimit = tx.gasLimit || 1000000;
		this.emitter.emit('setView', null, { loading: true })

		return new Promise((resolve, reject) => {
			this.sdk.execute(tx, this.wallet.privateKey)
			.then(resolve)
			.catch(reject)
			.finally(() => this.emitter.emit('setView', null, { loading: false }));
		});
	}

	async sign(msg)
	{
		return (new Wallet(this.wallet.privateKey)).sign(msg);
	}
}

export default IdentityService;
