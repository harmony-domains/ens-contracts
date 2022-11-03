# Developer Notes

## Prerequisites

## Compile

`npx hardhat compile`

## Test
`yarn test`

## Local Deployment

There are three options for local deployment
1. Deploy everything at once using `npx hardhat deploy` which spins up a local hardhat instance just for the deployment
    * Problems/TODO
        * Eror with resolver.eth deployment

            ```
            resolver.eth is not owned by the owner address, not setting resolver
            An unexpected error occurred:

            Error: ERROR processing /Users/john/one-wallet/ens/ens-contracts/deploy/utils/00_deploy_universal_resolver.ts:
            Error: UniversalResolver: No batch gateway URLs provided
            ```
2. Deploy Components individually using `npx hardhat deploy --tags registry --network hardhat`. Here we change `registry` with the component being deployed. As we are deploying many components we need a persistent chain hence we run a local version of hardhat in a separate terminal window using `npx hardhat node --no-deploy` note we use the `--no-deploy` option as we are manually testing the deployment of these components. When all components can be deployed successfully then `npx hardhat node` would run a local hardhat node and deploy all components.
    * Registry
        `npx hardhat deploy --tags registry --network localhost`
    * Resolver
    * Regsitrar
    * TODO Probems encountered and resolutions
         * `npx hardhat deploy --tags registry --network localhost` fails in `00_deploy_registry.ts` when trying to `const contract = await deploy('LegacyENSRegistry', `


3. We deploy all components using a script built for this purpose `npx hardhat run scripts/harmony-deploy.js --network localhost`. This is copied and modified from the documentation [Deploying ENS on a Private Chain](https://docs.ens.domains/deploying-ens-on-a-private-chain).

At the time of writing option 1 is failing. So our process is to get and end to end deploy using inidividual components (Option 2) then validate this works using Option 1. 

For Now we have Option 3 working to deploy the smart contracts.


## Publish NPM Packages