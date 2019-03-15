import baseConfig from '../config/config';
import {EventEmitter} from 'fbemitter';
import EthereumIdentitySDK from 'universal-login-sdk';
import {providers} from 'ethers';

import StorageService  from './StorageService';
import EnsService      from './EnsService';
import IdentityService from './IdentityService';

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
		this.identity       = new IdentityService(this.sdk, this.emitter, this.storageService, this.config);

	}

	start()
	{
		this.sdk.start();
		return this.identity.loadIdentity();
	}

	stop()
	{
		this.sdk.stop();
	}

}

export default Services;