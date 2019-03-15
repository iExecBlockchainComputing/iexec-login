import {utils, Contract} from 'ethers';
import ENS            from '@ensdomains/ens/build/contracts/ENS.json';
import PublicResolver from '@ensdomains/resolver/build/contracts/PublicResolver.json';

class EnsService
{
	constructor(sdk, provider, config)
	{
		this.provider = provider;
		this.sdk      = sdk;
		this.config   = config;
		this.ens      = new Contract(this.config.ensAddress, ENS.abi, this.provider);
	}

	async getPublicResolverAddress()
	{
		this.publicResolverAddress = this.publicResolverAddress || await this.ens.resolver(utils.namehash(this.config.ensDomains[0]));
		return this.publicResolverAddress;
	}

	async getEnsName(address)
	{
		const node = utils.namehash(`${address.slice(2)}.addr.reverse`.toLowerCase());
		this.resolverContract = this.resolverContract || new Contract(await this.getPublicResolverAddress(), PublicResolver.abi, this.provider);
		return this.resolverContract.name(node);
	}
}

export default EnsService;
