import { expect } from 'chai';
import {ApiPromise} from "@polkadot/api";
import testConfiguration from './test_configuration.json';
import { sendAndWaitForSuccess } from '@composable/utils/polkadotjs';
import {KeyringPair} from "@polkadot/keyring/types";
import { mintAssetsToWallet } from '@composable/utils/mintingHelper';
import { send } from 'process';

/**
 * Mosaic Pallet Tests
 *
 *  1. setRelayer
 *  2. rotateRelayer
 *  3. setNetwork
 *  4. setBudget
 *  5. transferTo
 *  6. acceptTransfer
 *  7. claimStaleTo
 *  8. timelockedMint
 *  9. setTimelockDuration
 * 10. rescindTimelockedMint
 * 11. claimTo
 * 12. updateAssetMapping
 */
describe('tx.mosaic Tests', function () {
    // Check if group of tests are enabled.
    if (!testConfiguration.enabledTests.query.enabled)
        return;

    let sudoKey: KeyringPair,
        startRelayerWallet: KeyringPair,
        newRelayerWallet: KeyringPair;

    describe('tx.mosaic.setRelayer Success Tests', function() {
        // Check if group of tests are enabled.
        if (!testConfiguration.enabledTests.query.account__success.enabled)
            return;

        before(async function() {
            this.timeout(4*60*1000);
            sudoKey = walletAlice;
            startRelayerWallet = walletEve;
            newRelayerWallet = walletAlice;
            /*await mintAssetsToWallet(startRelayerWallet, sudoKey, [2], 25000);
            await mintAssetsToWallet(newRelayerWallet, sudoKey, [2], 25000);*/
        });

        /**
         * Setting the first relayer.
         * Sudo call therefore result is checked by `.isOk`.
         */
        it('Should be able to set relayer', async function () {
            // Check if this test is enabled.
            if (!testConfiguration.enabledTests.query.account__success.balanceGTZero1)
                this.skip();
            // Setting timeout to 2 minutes.
            this.timeout(2 * 60 * 1000);
            const {data:[result]} = await TxMosaicTests.testSetRelayer(sudoKey, startRelayerWallet.address);
            expect(result.isOk).to.be.true;
        });

        /**
         * Rotating the relayer.
         * Sudo call therefore result is checked by `.isOk`.
         */
        it('Should be able to rotate relayer', async function () {
            // if (!testConfiguration.enabledTests.query.account__success.balanceGTZero1)
            //   this.skip();
            // Setting timeout to 2 minutes.
            this.skip();
            this.timeout(2 * 60 * 1000);
            const {data:[result]} = await TxMosaicTests.testRotateRelayer(startRelayerWallet, newRelayerWallet.address, 90);
            const relayerInfo = await api.query.mosaic.relayer();
            expect(relayerInfo.unwrap().relayer.next.toJSON().account).to.be.equal(api.createType('AccountId32', newRelayerWallet.address).toString());
        });

        /**
         * Setting the network.
         */
        it('Should be able to set the network', async function () {
            // Check if this test is enabled.
            if (!testConfiguration.enabledTests.query.account__success.balanceGTZero1)
                this.skip();
            // Setting timeout to 2 minutes.
            this.timeout(2 * 60 * 1000);
            const networkId = api.createType('u32', 1);
            const networkInfo = api.createType('PalletMosaicNetworkInfo', {
                enabled: api.createType('bool', true),
                maxTransferSize: api.createType('u128', 20000)
            });
            const {data:[retNetworkId, retNetworkInfo]} = await TxMosaicTests.testSetNetwork(startRelayerWallet, networkId, networkInfo);
            //Later to be changed to !!Yasin
            expect(networkId.toNumber()).to.be.equal(1);
        });

        /**
         * Setting the budget.
         */
        it('Should be able set the budget', async function () {
            // Check if this test is enabled.
            if (!testConfiguration.enabledTests.query.account__success.balanceGTZero1)
                this.skip();
            // Setting timeout to 2 minutes.
            this.timeout(2 * 60 * 1000);
            const assetId = api.createType('u128', 2);
            const amount = api.createType('u128', 10000);
            const decay = api.createType('PalletMosaicDecayBudgetPenaltyDecayer', {
                Linear:
                    api.createType('PalletMosaicDecayLinearDecay', {factor: api.createType('u128', 5)})
            });
            const {data:[result]} = await TxMosaicTests.testSetBudget(sudoKey, assetId, amount, decay);
            expect(result.isOk).to.be.true;
        });

        it('Should be able to update asset mapping', async function(){
            this.timeout(2*60*1000);
            const assetId = api.createType('u128', 2);
            const networkId = api.createType('u128', 1);
            const remoteAssetId = api.createType('CommonMosaicRemoteAssetId', {
                EthereumTokenAddress: api.createType('[u8;20]', "0x0423276a1da214B094D54386a1Fb8489A9d32730")
            });
            const{data: [result]} = await TxMosaicTests.testUpdateAssetMaping(sudoKey, assetId, networkId, remoteAssetId);
            expect(result.isOk).to.be.true;
        });

        it('Should be able to send transfers to another network', async function(){
            this.timeout(2*60*1000);
            const paramNetworkId = api.createType('u32', 1);
            const paramAssetId = api.createType('u128', 2);
            const paramRemoteTokenContAdd = api.createType('[u8;20]', "0x0423276a1da214B094D54386a1Fb8489A9d32730");
            const paramAmount = api.createType('u128', 350);
            const paramKeepAlive = api.createType('bool', false);
            const {data: [result]} = await TxMosaicTests.testTransferTo(newRelayerWallet, paramNetworkId, paramAssetId, paramRemoteTokenContAdd, paramAmount, paramKeepAlive);
            const lockedAmount = await api.query.mosaic.outgoingTransactions(startRelayerWallet.address, 2);
            expect(lockedAmount.unwrap()[0].toNumber()).to.be.equal(700);
        });

        it('Should be able to mint assets into pallet wallet with timelock//simulates incoming transfer from pair network', async function(){
            this.timeout(2*60*1000);
            const paramNetworkId = api.createType('u32', 1);
            const remoteAssetId = api.createType('CommonMosaicRemoteAssetId', {
                EthereumTokenAddress: api.createType('[u8;20]', "0x0423276a1da214B094D54386a1Fb8489A9d32730")
            });
            const toTransfer = walletBob.address;
            const amount = api.createType('u128', 200);
            const lockTime = api.createType('u32', 11);
            await TxMosaicTests.lockFunds(newRelayerWallet, paramNetworkId, remoteAssetId, toTransfer, amount, lockTime);
        });

        it('Relayer accepts outgoing transfer', async function(){
            this.timeout(2*60*1000);
            const senderWallet = newRelayerWallet;
            const remoteAssetId = api.createType('CommonMosaicRemoteAssetId', {
                EthereumTokenAddress: api.createType('[u8;20]', "0x0423276a1da214B094D54386a1Fb8489A9d32730")
            });
            const amount = api.createType('u128', 200);
            const {data: [result]} = await TxMosaicTests.testAcceptTransfer(newRelayerWallet, newRelayerWallet, 1, remoteAssetId, 200);
            expect(result.toString()).to.be.equal(api.createType('AccountId32', newRelayerWallet.address).toString());
        });

        it('Receivee can claim incoming transfers once accepted by the relayer', async function(){
            this.timeout(2*60*1000);
            const receiverWallet = walletBob;
            const assetId = api.createType('u128', 2);
            const{data: [result]} = await TxMosaicTests.testClaimTransactions(receiverWallet, assetId);
            expect(result.toString()).to.be.equal(api.createType('AccountId32', receiverWallet.address).toString());
        })
        it('User can claim the funds not accepted by the relayer in the pair network', async function(){
            this.timeout(2*60*1000);
            const wallet = newRelayerWallet;
            const assetId = api.createType('u128', 2);
            const {data: [result]} = await TxMosaicTests.testClaimStaleFunds(newRelayerWallet, assetId);
            expect(result.toString()).to.be.equal(api.createType('AccountId32', newRelayerWallet.address).toString());
        })
        it.only('If the finality issues occur, relayer can burn untrusted amounts from tx', async function(){
            this.timeout(2*60*1000);
            const wallet = newRelayerWallet;
            const networkId = api.createType('u32', 1);
            const remoteAssetId = api.createType('CommonMosaicRemoteAssetId', {
                EthereumTokenAddress: api.createType('[u8;20]', "0x0423276a1da214B094D54386a1Fb8489A9d32730")
            });
            const returnWallet = newRelayerWallet;
            const untrustedAmount = api.createType('u128', 250);
            const {data : [result]} = await TxMosaicTests.testRescindTimeLockedFunds(wallet, networkId, remoteAssetId, untrustedAmount);
            expect(result.toString()).to.be.equal(api.createType('AccountId32', newRelayerWallet.address).toString());
        })
    });
});

export class TxMosaicTests {
    /**
     * Tests by checking the balance of the supplied account is >0
     * @param sudoKey
     * @param relayerWallet
     */
    public static async testSetRelayer(sudoKey:KeyringPair, relayerWallet) {
        return await sendAndWaitForSuccess(
            api,
            sudoKey,
            api.events.sudo.Sudid.is,
            api.tx.sudo.sudo(api.tx.mosaic.setRelayer(relayerWallet))
        );
    }

    public static async testRotateRelayer(startWallet, newRelayerWallet, validatedTtl) {
        const paramTtl = api.createType('u32', 16);
        return await sendAndWaitForSuccess(
            api,
            startWallet,
            api.events.mosaic.RelayerRotated.is,
            api.tx.mosaic.rotateRelayer(newRelayerWallet, paramTtl)
        );
    }

    public static async testSetNetwork(walletId:KeyringPair, networkId, networkInfo) {
        return await sendAndWaitForSuccess(
            api,
            walletId,
            api.events.mosaic.NetworksUpdated.is,
            api.tx.mosaic.setNetwork(networkId, networkInfo)
        );
    }

    public static async testSetBudget(sudoKey:KeyringPair, assetId, amount, decay) {
        return await sendAndWaitForSuccess(
            api,
            sudoKey,
            api.events.sudo.Sudid.is,
            api.tx.sudo.sudo(api.tx.mosaic.setBudget(assetId, amount, decay))
        );
    }

    public static async testUpdateAssetMaping(sudoKey: KeyringPair, assetId, networkId, remoteAssetId){
        return await sendAndWaitForSuccess(
            api,
            sudoKey,
            api.events.sudo.Sudid.is,
            api.tx.sudo.sudo(api.tx.mosaic.updateAssetMapping(assetId, networkId, remoteAssetId))
        );
    }

    public static async testTransferTo(relayerWallet, networkId, assetId, contractAddress, amount, keepAlive){
        return await sendAndWaitForSuccess(
            api,
            relayerWallet,
            api.events.mosaic.TransferOut.is,
            api.tx.mosaic.transferTo(networkId, assetId, contractAddress, amount, keepAlive)
        );
    }

    public static async lockFunds(wallet, network, remoteAsset, sentWallet, amount, lockTime){
        const paramId = api.createType('H256', '0x');
        return await sendAndWaitForSuccess(
            api,
            wallet,
            api.events.mosaic.TransferIntoRescined.is,
            api.tx.mosaic.timelockedMint(network, remoteAsset, sentWallet, amount, lockTime, paramId)
        )
    }

    public static async testAcceptTransfer(wallet, senderWallet, networkId, remoteAssetId, amount) {
        return await sendAndWaitForSuccess(
            api,
            wallet,
            api.events.mosaic.PartialTransferAccepted.is,
            api.tx.mosaic.acceptTransfer(senderWallet.address,
              networkId,
              remoteAssetId,
              amount)
        );
    }
    public static async testClaimTransactions(wallet, assetId){
        return await sendAndWaitForSuccess(
            api,
            wallet,
            api.events.mosaic.TransferClaimed.is,
            api.tx.mosaic.claimTo(assetId, wallet)
        );
    }

    public static async testClaimStaleFunds(wallet, assetId){
        return await sendAndWaitForSuccess(
            api,
            wallet,
            api.events.mosaic.StaleTxClaimed.is,
            api.tx.mosaic.claimStaleTo(assetId, wallet.address)
        )
    }

    public static async testRescindTimeLockedFunds(wallet, networkId, remoteAssetId, amount){
        return await sendAndWaitForSuccess(
            api,
            wallet,
            api.events.mosaic.TransferIntoRescined.is,
            api.tx.mosaic.rescindTimelockedMint(networkId, remoteAssetId, wallet.address, amount)
        );
    }
}