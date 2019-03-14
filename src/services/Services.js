import baseConfig from '../config/config';

import {providers} from 'ethers';
import EthereumIdentitySDK from 'universal-login-sdk';

import StorageService from './StorageService';





const abi = [
	"function UUID() view returns(bytes32)",
	"function delegate() view returns(address)",
	"function updateDelegate(address,bytes)",
	"function getData(bytes32) view returns(bytes32)",
	"function setData(bytes32,bytes32)",
];

class Services
{
	constructor(config = baseConfig, overrides = {})
	{
		this.config         = config;
		this.provider       = overrides.provider       || new providers.JsonRpcProvider(this.config.jsonRpcUrl);
		this.storageService = overrides.storageService || new StorageService();
		this.sdk            = new EthereumIdentitySDK(this.config.relayerUrl, this.provider);
	}

	start()
	{
		this.sdk.start();
	}

	stop()
	{
		this.sdk.stop();
	}

}

export default Services;
