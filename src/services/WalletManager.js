import { Wallet as ethersWallet} from 'ethers';

class WalletManager
{
	constructor(wallet, sdk, emitter, storage)
	{
		this.wallet  = wallet;
		this.sdk     = sdk;
		this.emitter = emitter;
		this.storage = storage;

		this.create     = this.create.bind(this);
		this.connect    = this.connect.bind(this);
		this.disconnect = this.disconnect.bind(this);
	}

	loadFromStorage()
	{
		this.storage.getIdentity()
		.then(wallet => {
			if (wallet)
			{
				this.emitter.emit('setView', null, { loading: true });
				this.wallet.configure(wallet);
				return true;
			}
			return false;
		});
	}

	saveToStorage()
	{
		this.storage.storeIdentity({
			name:       this.wallet.name,
			proxy:      this.wallet.proxy,
			privateKey: this.wallet.privateKey,
		});
	}

	async loadFromJSON(encrypted, password)
	{
		return new Promise((resolve, reject) => {
			this.emitter.emit('setView', null, { loading: true });
			ethersWallet.fromEncryptedJson(encrypted, password)
			.then(decrypted => {
				const { name, proxy } = JSON.parse(encrypted);
				const { privateKey  } = decrypted;
				this.wallet.configure({ name, privateKey, proxy });
				this.saveToStorage();
				resolve();
			})
			.catch(reject);
		});
	}

	async saveToJSON(password)
	{
		return new Promise((resolve, reject) => {
			this.emitter.emit('setView', null, { loading: true });
			(new ethersWallet(this.wallet.privateKey)).encrypt(password)
			.then(encrypted => {
				resolve(JSON.stringify({ name: this.wallet.name, proxy: this.wallet.proxy, ...JSON.parse(encrypted) }));
			})
			.catch(reject)
			.finally(() => {
				this.emitter.emit('setView', null, { loading: false });
			});
		});
	}

	create(name)
	{
		this.emitter.emit('setView', null, { loading: true });
		this.sdk.create(name)
		.then(([privateKey, proxy]) => {
			this.wallet.configure({ name, privateKey, proxy });
			this.saveToStorage();
		})
		.catch(console.error);
	}

	connect(name)
	{
		this.emitter.emit('setView', null, { loading: true });
		this.sdk.identityExist(name).then(proxy => {
			this.sdk.connect(proxy).then(privateKey => {
				this.wallet.configure({ name, privateKey, proxy });
				this.saveToStorage();
			})
			.catch(console.error);
		})
		.catch(console.error);
	}

	disconnect()
	{
		this.wallet.reset();
		this.storage.clearStorage();
	}


}

export default WalletManager;
