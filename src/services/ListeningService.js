class ListeningService
{
	constructor(sdk)
	{
		this.sdk = sdk;
		this.pendingAuthorisations = [];
	}

	subscribe(contract, callback)
	{
		return this.sdk.subscribe(
			'AuthorisationsChanged',
			{ contract },
			authorisations => {
				this.pendingAuthorisations = authorisations;
				callback(authorisations);
			}
		);
	}
}

export default ListeningService;
