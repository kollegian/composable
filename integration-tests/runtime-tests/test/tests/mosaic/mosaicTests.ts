import { expect } from 'chai';
import {ApiPromise} from "@polkadot/api";
import testConfiguration from './test_configuration.json';
import { sendAndWaitForSuccess } from '@composable/utils/polkadotjs';
import {KeyringPair} from "@polkadot/keyring/types";
import { mintAssetsToWallet } from '@composable/utils/mintingHelper';
import { send } from 'process';
import {CommonMosaicRemoteAssetId, OrmlTokensAccountData} from "@composable/types/interfaces";
import {start} from "repl";

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
        newRelayerWallet: KeyringPair,
        userWallet: KeyringPair,
        remoteAssetId: CommonMosaicRemoteAssetId;
    let transferAmount: number,
        assetId: number,
        networkId: number,
        paramNetworkId;
    describe('tx.mosaic.setRelayer Success Tests', function() {
        this.timeout(4*60*1000);
        if (!testConfiguration.enabledTests.query.account__success.enabled)
            return;
        before(async function() {
            this.timeout(4*60*1000);
            sudoKey = walletAlice;
            startRelayerWallet = walletEve.derive("/tests/mosaicPallets/wallet1");
            newRelayerWallet = walletAlice.derive("/tests/mosaicPallets/wallet2");
            userWallet = walletFerdie.derive("/tests/mosaicPallets/wallet3");
            assetId = 4;
            transferAmount = 100000000000;
            networkId = 1;
            paramNetworkId = api.createType('u128', 1);
            remoteAssetId = api.createType('CommonMosaicRemoteAssetId', {
                EthereumTokenAddress: api.createType('[u8;20]', "0x")
            });
            await mintAssetsToWallet(startRelayerWallet, sudoKey, [1,4]);
            await mintAssetsToWallet(newRelayerWallet, sudoKey, [1,4]);
            await mintAssetsToWallet(userWallet, sudoKey, [1,4]);
        });
        /**
         * Setting the first relayer.
         * Sudo call therefore result is checked by `.isOk`.
         */
        it('Should be able to set relayer @integration', async function () {
            // Check if this test is enabled.
            if (!testConfiguration.enabledTests.query.account__success.balanceGTZero1)
                this.skip();
            const {data:[result]} = await TxMosaicTests.testSetRelayer(sudoKey, startRelayerWallet.address);
            expect(result.isOk).to.be.true;
        });
        /**
         * Setting the network.
         */
        it('Should be able to set the network @integration', async function () {
            // Check if this test is enabled.
            if (!testConfiguration.enabledTests.query.account__success.balanceGTZero1)
                this.skip();
            const networkInfo = api.createType('PalletMosaicNetworkInfo', {
                enabled: api.createType('bool', true),
                minTransferSize: api.createType('u128', 0),
                maxTransferSize: api.createType('u128', 800000000000)
            });
            const {data:[retNetworkId, retNetworkInfo]} = await TxMosaicTests.testSetNetwork(startRelayerWallet, paramNetworkId, networkInfo);
            expect(retNetworkId.toNumber()).to.be.equal(networkId);
        });

        /**
         * Setting the budget.
         */
        it('Should be able set the budget', async function () {
            // Check if this test is enabled.
            if (!testConfiguration.enabledTests.query.account__success.balanceGTZero1)
                this.skip();
            const paramAssetId = api.createType('u128', assetId);
            const amount = api.createType('u128', 800000000000000);
            const decay = api.createType('PalletMosaicDecayBudgetPenaltyDecayer', {
                Linear:
                    api.createType('PalletMosaicDecayLinearDecay', {factor: api.createType('u128', 5)})
            });
            const {data:[result]} = await TxMosaicTests.testSetBudget(sudoKey, paramAssetId, amount, decay);
            expect(result.isOk).to.be.true;
        });

        it('Should be able to update asset mapping', async function(){
            const paramAssetId = api.createType('u128', assetId);
            const{data: [result]} = await TxMosaicTests.testUpdateAssetMaping(sudoKey, paramAssetId, paramNetworkId, remoteAssetId);
            expect(result.isOk).to.be.true;
        });
        it('Should be able to send transfers to another network, creating an outgoing transaction', async function(){
            const paramAssetId = api.createType('u128', assetId);
            const paramRemoteTokenContAdd = api.createType('[u8;20]', "0x");
            const paramAmount = api.createType('u128', transferAmount);
            const paramKeepAlive = api.createType('bool', false);
            const {data: [result]} = await TxMosaicTests.testTransferTo(startRelayerWallet, paramNetworkId, paramAssetId, paramRemoteTokenContAdd, paramAmount, paramKeepAlive);
            const lockedAmount = await api.query.mosaic.outgoingTransactions(startRelayerWallet.address, assetId);
            expect(lockedAmount.unwrap()[0].toNumber()).to.be.equal(transferAmount);
        });

        it('Should be able to mint assets into pallet wallet with timelock//simulates incoming transfer from pair network', async function(){
            const toTransfer = userWallet.address;
            const amount = api.createType('u128', transferAmount);
            const lockTime = api.createType('u32', 10);
            await TxMosaicTests.lockFunds(startRelayerWallet, paramNetworkId, remoteAssetId, toTransfer, amount, lockTime).catch(error => console.log(error));
            const lockedAmount = await api.query.mosaic.incomingTransactions(toTransfer, assetId);
            expect(lockedAmount.unwrap()[0].toNumber()).to.be.equal(transferAmount);
        });

        it('Should be able to mint assets into pallet wallet with timelock//simulates incoming transfer from pair network NEED TO DOUBLE', async function(){
            const toTransfer = newRelayerWallet.address;
            const amount = api.createType('u128', transferAmount);
            const lockTime = api.createType('u32', 10);
            await TxMosaicTests.lockFunds(startRelayerWallet, paramNetworkId, remoteAssetId, toTransfer, amount, lockTime);
            const lockedAmount = await api.query.mosaic.incomingTransactions(toTransfer, assetId);
            expect(lockedAmount.unwrap()[0].toNumber()).to.be.equal(transferAmount);
        });
        it('Only relayer can mint assets into pallet wallet with timelock/incoming transactions', async function(){
            const toTransfer = newRelayerWallet.address;
            const amount = api.createType('u128', transferAmount);
            const lockTime = api.createType('u32', 10);
            await TxMosaicTests.lockFunds(userWallet, paramNetworkId, remoteAssetId, toTransfer, amount, lockTime).catch(error =>
                expect(error.message).to.contain("BadOrigin"));
        });
        /**
         * Rotating the relayer.
         * Sudo call therefore result is checked by `.isOk`.
         */
        it('Should be able to rotate relayer', async function () {
            // if (!testConfiguration.enabledTests.query.account__success.balanceGTZero1)
            //   this.skip();
            // Setting timeout to 2 minutes.
            const {data:[result]} = await TxMosaicTests.testRotateRelayer(startRelayerWallet, newRelayerWallet.address, 90);
            const relayerInfo = await api.query.mosaic.relayer();
            expect(relayerInfo.unwrap().relayer.next.toJSON().account).to.be.equal(api.createType('AccountId32', newRelayerWallet.address).toString());
        });

        it('If the finality issues occur, relayer can burn untrusted amounts from tx', async function(){
            const wallet = startRelayerWallet;
            const networkId = api.createType('u32', 1);
            const returnWallet = newRelayerWallet;
            const untrustedAmount = api.createType('u128', transferAmount-3000);
            const {data : [result]} = await TxMosaicTests.testRescindTimeLockedFunds(wallet, returnWallet, networkId, remoteAssetId, untrustedAmount);
            expect(result.toString()).to.be.equal(api.createType('AccountId32', newRelayerWallet.address).toString());
        })

        it('Only relayer can burn untruested amounts from incoming tx', async function() {
            const wallet = userWallet;
            const networkId = api.createType('u32', 1);
            const returnWallet = newRelayerWallet;
            const untrustedAmount = api.createType('u128', transferAmount - 3000);
            await TxMosaicTests.testRescindTimeLockedFunds(wallet, returnWallet, networkId, remoteAssetId, untrustedAmount).catch(error=>
                expect(error.message).to.contain("BadOrigin"));
        })

        it('Other users should be able to send transfers to another network, creating an outgoing transaction', async function(){
            const paramAssetId = api.createType('u128', assetId);
            const paramRemoteTokenContAdd = api.createType('[u8;20]', "0x0423276a1da214B094D54386a1Fb8489A9d32730");
            const paramAmount = api.createType('u128', transferAmount);
            const paramKeepAlive = api.createType('bool', false);
            const {data: [result]} = await TxMosaicTests.testTransferTo(userWallet, paramNetworkId, paramAssetId, paramRemoteTokenContAdd, paramAmount, paramKeepAlive);
            const lockedAmount = await api.query.mosaic.outgoingTransactions(userWallet.address, assetId);
            expect(lockedAmount.unwrap()[0].toNumber()).to.be.equal(transferAmount);
        });

        it('Relayer accepts outgoing transfer', async function(){
            this.timeout(2*60*1000);
            const senderWallet = userWallet;
            const amount = api.createType('u128', transferAmount);
            const {data: [result]} = await TxMosaicTests.testAcceptTransfer(startRelayerWallet, senderWallet, paramNetworkId, remoteAssetId, amount);
            expect(result.toString()).to.be.equal(api.createType('AccountId32', senderWallet.address).toString());
        });

        it('Only receivee can claim incoming transfers', async function() {
            this.timeout(2 * 60 * 1000);
            const receiverWallet = walletBob;
            const paramAssetId = api.createType('u128', assetId);
            await TxMosaicTests.testClaimTransactions(receiverWallet, receiverWallet, paramAssetId).catch(error => {
                console.log("hello I am in error");
                expect(error.message).to.contain("NoClaimable");
            });
        });
        it('Receivee can claim incoming transfers', async function(){
            this.timeout(2*60*1000);
            const receiverWallet = userWallet;
            const paramAssetId = api.createType('u128', assetId);
            const initialTokens = await api.query.tokens.accounts(userWallet.address, assetId);
            const{data: [result]} = await TxMosaicTests.testClaimTransactions(userWallet, receiverWallet, paramAssetId);
            const afterTokens = await api.query.tokens.accounts(userWallet.address, assetId);
            expect(initialTokens.free.toNumber()).to.be.equal((afterTokens.free.toNumber())-transferAmount);
        });

        it('User can reclaim the stale funds not accepted by the relayer and locked in outgoing transactions pool', async function(){
            this.timeout(2*60*1000);
            const wallet = startRelayerWallet;
            const paramAssetId = api.createType('u128', assetId);
            const initialTokens = await api.query.tokens.accounts(wallet.address, assetId);
            const {data: [result]} = await TxMosaicTests.testClaimStaleFunds(startRelayerWallet, paramAssetId);
            const afterTokens = await api.query.tokens.accounts(wallet.address, assetId);
            expect(initialTokens.free.toNumber()).to.be.equal((afterTokens.free.toNumber())-transferAmount);
        });
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
            api.events.mosaic.TransferInto.is,
            api.tx.mosaic.timelockedMint(network, remoteAsset, sentWallet, amount, lockTime, paramId)
        )
    }

    public static async testAcceptTransfer(wallet, senderWallet, networkId, remoteAssetId, amount) {
        return await sendAndWaitForSuccess(
            api,
            wallet,
            api.events.mosaic.TransferAccepted.is,
            api.tx.mosaic.acceptTransfer(senderWallet.address,
              networkId,
              remoteAssetId,
              amount)
        );
    }
    public static async testClaimTransactions(wallet, receiverWallet, assetId){
        return await sendAndWaitForSuccess(
            api,
            wallet,
            api.events.mosaic.TransferClaimed.is,
            api.tx.mosaic.claimTo(assetId, receiverWallet.address)
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

    public static async testRescindTimeLockedFunds(wallet, returnWallet, networkId, remoteAssetId, amount){
        return await sendAndWaitForSuccess(
            api,
            wallet,
            api.events.mosaic.TransferIntoRescined.is,
            api.tx.mosaic.rescindTimelockedMint(networkId, remoteAssetId, returnWallet.address, amount)
        );
    }
}