import { expect } from 'chai';
import {ApiPromise, Keyring} from "@polkadot/api";
import testConfiguration from './test_configuration.json';
import { sendAndWaitForSuccess } from '@composable/utils/polkadotjs';
import {KeyringPair} from "@polkadot/keyring/types";
import { mintAssetsToWallet } from '@composable/utils/mintingHelper';
import { send } from 'process';
import {
    CommonMosaicRemoteAssetId,
    OrmlTokensAccountData,
    PalletMosaicDecayBudgetPenaltyDecayer,
    PalletMosaicNetworkInfo
} from "@composable/types/interfaces";
import {start} from "repl";
import {AccountId} from "@polkadot/types/interfaces/runtime";

/**
 * Mosaic Pallet Tests
 *  Checked functionalities are as follows;
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
 *
 * This suite consists of happy path tests. Additionally, we started implementing suites for later references such as regression, smoke etc.
 *
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
        networkId: number;
    let pNetworkId;

    describe('tx.mosaic Success Tests', function() {
        this.timeout(4*60*1000);
        if (!testConfiguration.enabledTests.query.account__success.enabled)
            return;
        before('Initialize variables',async function() {
            this.timeout(4 * 60 * 1000);
            sudoKey = walletAlice;
            startRelayerWallet = walletEve.derive("/tests/mosaicPallets/wallet1");
            newRelayerWallet = walletAlice.derive("/tests/mosaicPallets/wallet2");
            userWallet = walletFerdie.derive("/tests/mosaicPallets/wallet3");
            assetId = 4;
            transferAmount = 100000000000;
            networkId = 1;
            pNetworkId = api.createType('u128', 1);
            remoteAssetId = api.createType('CommonMosaicRemoteAssetId', {
                EthereumTokenAddress: api.createType('[u8;20]', "0x")
            });
        });
        before('Mint available assets into wallets', async function(){
            this.timeout(2*60*1000);
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
            const {data:[retNetworkId, retNetworkInfo]} = await TxMosaicTests.testSetNetwork(startRelayerWallet, pNetworkId, networkInfo);
            //Verifies the newly created networkId
            expect(retNetworkId.toNumber()).to.be.equal(networkId);
        });
        /**
         * Setting the budget.
         * A sudo call therefore result is verified by isOk.
         */
        it('Should be able set the budget', async function () {
            // Check if this test is enabled.
            if (!testConfiguration.enabledTests.query.account__success.balanceGTZero1)
                this.skip();
            const transAmount = 800000000000000;
            const pDecay = api.createType('PalletMosaicDecayBudgetPenaltyDecayer', {
                Linear:
                    api.createType('PalletMosaicDecayLinearDecay', {factor: api.createType('u128', 5)})
            });
            const {data:[result]} = await TxMosaicTests.testSetBudget(sudoKey, assetId, transAmount, pDecay);
            expect(result.isOk).to.be.true;
        });

        it('Should be able to update asset mapping', async function(){
            const pAssetId = api.createType('u128', assetId);
            const{data: [result]} = await TxMosaicTests.testUpdateAssetMaping(sudoKey, pAssetId, pNetworkId, remoteAssetId);
            expect(result.isOk).to.be.true;
        });
        it('Should be able to send transfers to another network, creating an outgoing transaction', async function(){
            const pAssetId = api.createType('u128', assetId);
            const pRemoteTokenContAdd = api.createType('[u8;20]', "0x");
            const pAmount = api.createType('u128', transferAmount);
            const pKeepAlive = api.createType('bool', false);
            const {data: [result]} = await TxMosaicTests.testTransferTo(startRelayerWallet,
                pNetworkId,
                pAssetId,
                pRemoteTokenContAdd,
                pAmount,
                pKeepAlive
            );
            const lockedAmount = await api.query.mosaic.outgoingTransactions(startRelayerWallet.address, assetId);
            //verify that the amount sent is locked in the outgoing pool.
            expect(lockedAmount.unwrap()[0].toNumber()).to.be.equal(transferAmount);
        });

        it('Should be able to mint assets into pallet wallet with timelock//simulates incoming transfer from pair network', async function(){
            const toTransfer = userWallet.address;
            const pAmount = api.createType('u128', transferAmount);
            const pLockTime = api.createType('u32', 10);
            await TxMosaicTests.lockFunds(startRelayerWallet, pNetworkId, remoteAssetId, toTransfer, pAmount, pLockTime);
            const lockedAmount = await api.query.mosaic.incomingTransactions(toTransfer, assetId);
            //verify that the incoming transaction is locked in the incoming transaction pool.
            expect(lockedAmount.unwrap()[0].toNumber()).to.be.equal(transferAmount);
        });

        it('Other users should be able to mint assets into pallet wallet with timelock//simulates incoming transfer from pair network', async function(){
            const toTransfer = newRelayerWallet.address;
            const pAmount = api.createType('u128', transferAmount);
            const pLockTime = api.createType('u32', 10);
            await TxMosaicTests.lockFunds(startRelayerWallet, pNetworkId, remoteAssetId, toTransfer, pAmount, pLockTime);
            const lockedAmount = await api.query.mosaic.incomingTransactions(toTransfer, assetId);
            //verify that the incoming transaction is locked in the incoming transaction pool.
            expect(lockedAmount.unwrap()[0].toNumber()).to.be.equal(transferAmount);
        });
        it('Only relayer should mint assets into pallet wallet with timelock/incoming transactions', async function(){
            const toTransfer = newRelayerWallet.address;
            const pAmount = api.createType('u128', transferAmount);
            const pLockTime = api.createType('u32', 10);
            //verify that the transaction fails with BadOrigin message
            await TxMosaicTests.lockFunds(userWallet, pNetworkId, remoteAssetId, toTransfer, pAmount, pLockTime).catch(error =>
                expect(error.message).to.contain("BadOrigin"));
        });
        /**
         * Rotating the relayer.
         * Sudo call therefore result is checked by `.isOk`.
         */
        it('Should be able to rotate relayer', async function () {
            if (!testConfiguration.enabledTests.query.account__success.balanceGTZero1)
               this.skip();
            const {data:[result]} = await TxMosaicTests.testRotateRelayer(startRelayerWallet, newRelayerWallet.address, 90);
            const relayerInfo = await api.query.mosaic.relayer();
            //verify that the relayer records information about the next relayer wallet
            expect(relayerInfo.unwrap().relayer.next.toJSON().account).to.be.equal(api.createType('AccountId32', newRelayerWallet.address).toString());
        });

        it('Should the finality issues occur, relayer can burn untrusted amounts from tx', async function(){
            const wallet = startRelayerWallet;
            const returnWallet = newRelayerWallet;
            const untrustedAmount = api.createType('u128', transferAmount-3000);
            const {data : [result]} = await TxMosaicTests.testRescindTimeLockedFunds(wallet, returnWallet, pNetworkId, remoteAssetId, untrustedAmount);
            //We can change the assertion, get the info from chain from incoming pool and verify that the amount locked is reduced from the amount total
            expect(result.toString()).to.be.equal(api.createType('AccountId32', newRelayerWallet.address).toString());
        })

        it('Only relayer should be able to burn untrusted amounts from incoming tx', async function() {
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
            const {data: [result]} = await TxMosaicTests.testTransferTo(userWallet, pNetworkId, paramAssetId, paramRemoteTokenContAdd, paramAmount, paramKeepAlive);
            const lockedAmount = await api.query.mosaic.outgoingTransactions(userWallet.address, assetId);
            //Verify that the transferred amount is locked in the outgoing transaction pool.
            expect(lockedAmount.unwrap()[0].toNumber()).to.be.equal(transferAmount);
        });

        it('Relayer should be able to accept outgoing transfer', async function(){
            this.timeout(2*60*1000);
            const senderWallet = userWallet;
            const amount = api.createType('u128', transferAmount);
            const {data: [result]} = await TxMosaicTests.testAcceptTransfer(startRelayerWallet, senderWallet, pNetworkId, remoteAssetId, amount);
            //verify that the relayer address is returned.
            expect(result.toString()).to.be.equal(api.createType('AccountId32', senderWallet.address).toString());
        });

        it('Only receivee should be able to claim incoming transfers', async function() {
            this.timeout(2 * 60 * 1000);
            const receiverWallet = walletBob;
            const pAssetId = api.createType('u128', assetId);
            await TxMosaicTests.testClaimTransactions(receiverWallet, receiverWallet, pAssetId).catch(error => {
                expect(error.message).to.contain("NoClaimable");
            });
        });
        it('Receivee should be able to claim incoming transfers', async function(){
            this.timeout(2*60*1000);
            const receiverWallet = userWallet;
            const paramAssetId = api.createType('u128', assetId);
            const initialTokens = await api.query.tokens.accounts(userWallet.address, assetId);
            const{data: [result]} = await TxMosaicTests.testClaimTransactions(userWallet, receiverWallet, paramAssetId);
            const afterTokens = await api.query.tokens.accounts(userWallet.address, assetId);
            expect(initialTokens.free.toNumber()).to.be.equal((afterTokens.free.toNumber())-transferAmount);
        });

        it('User should be able to reclaim the stale funds not accepted by the relayer and locked in outgoing transactions pool', async function(){
            this.timeout(2*60*1000);
            const wallet = startRelayerWallet;
            const pAssetId = api.createType('u128', assetId);
            const initialTokens = await api.query.tokens.accounts(wallet.address, assetId);
            const {data: [result]} = await TxMosaicTests.testClaimStaleFunds(startRelayerWallet, pAssetId);
            const afterTokens = await api.query.tokens.accounts(wallet.address, assetId);
            //verify that the reclaimed tokens are transferred into user balance.
            expect(initialTokens.free.toNumber()).to.be.equal((afterTokens.free.toNumber())-transferAmount);
        });
    });
});

export class TxMosaicTests {

    public static async testSetRelayer(sudoKey:KeyringPair, relayerWalletAddress: string) {
        return await sendAndWaitForSuccess(
            api,
            sudoKey,
            api.events.sudo.Sudid.is,
            api.tx.sudo.sudo(api.tx.mosaic.setRelayer(relayerWalletAddress))
        );
    }

    public static async testRotateRelayer(startRelayerWallet: KeyringPair, newRelayerWalletAddress: string, validatedTtl: number) {
        const paramTtl = api.createType('u32', validatedTtl);
        return await sendAndWaitForSuccess(
            api,
            startRelayerWallet,
            api.events.mosaic.RelayerRotated.is,
            api.tx.mosaic.rotateRelayer(newRelayerWalletAddress, paramTtl)
        );
    }

    public static async testSetNetwork(walletId:KeyringPair, networkId: number, networkInfo: PalletMosaicNetworkInfo) {
        return await sendAndWaitForSuccess(
            api,
            walletId,
            api.events.mosaic.NetworksUpdated.is,
            api.tx.mosaic.setNetwork(networkId, networkInfo)
        );
    }

    public static async testSetBudget(sudoKey:KeyringPair, assetId: number, amount: number, decay: PalletMosaicDecayBudgetPenaltyDecayer) {
        const pAssetId = api.createType('u128', assetId);
        const pAmount = api.createType('u128', 800000000000000);
        return await sendAndWaitForSuccess(
            api,
            sudoKey,
            api.events.sudo.Sudid.is,
            api.tx.sudo.sudo(api.tx.mosaic.setBudget(pAssetId, pAmount, decay))
        );
    }

    public static async testUpdateAssetMaping(sudoKey: KeyringPair, assetId: , networkId, remoteAssetId){
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