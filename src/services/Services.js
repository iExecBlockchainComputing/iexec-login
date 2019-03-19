import baseConfig from '../config/config';
import {EventEmitter} from 'fbemitter';
import EthereumIdentitySDK from 'universal-login-sdk';
import {providers} from 'ethers';

import StorageService from './StorageService';
import EnsService     from './EnsService';
import Wallet         from './Wallet';
import WalletManager  from './WalletManager';
// import ListeningService from './ListeningService';

class Services
{
	constructor(config = baseConfig, overrides = {})
	{
		this.config         = config;
		this.emitter        = new EventEmitter();
		this.provider       = overrides.provider       || new providers.JsonRpcProvider(this.config.jsonRpcUrl);
		this.storageService = overrides.storageService || new StorageService();
		this.sdk            = new EthereumIdentitySDK(this.config.relayerUrl, this.provider);
		this.ensService     = new EnsService(this.sdk, this.provider, this.config);
		this.wallet         = new Wallet(this.sdk, this.emitter, this.config);
		this.walletManager  = new WalletManager(this.wallet, this.sdk, this.emitter, this.storageService);
		// this.listening      = new ListeningService(this.sdk, console.log);
	}

	start()
	{
		this.sdk.start();
		return this.walletManager.loadFromStorage();
	}

	stop()
	{
		this.sdk.stop();
	}

}

export default Services;
