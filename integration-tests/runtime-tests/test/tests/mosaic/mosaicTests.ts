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
      //await mintAssetsToWallet(startRelayerWallet, sudoKey, [1,2]);
      //await mintAssetsToWallet(newRelayerWallet, sudoKey, [1,2]);
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
      this.timeout(2 * 60 * 1000);
      const {data:[result]} = await TxMosaicTests.testRotateRelayer(startRelayerWallet, newRelayerWallet.address, 16);
      let relayerInfo = await api.query.mosaic.relayer();
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
      const networkId = api.createType('u32', 2);
      const networkInfo = api.createType('PalletMosaicNetworkInfo', {
        enabled: api.createType('bool', true),
        maxTransferSize: api.createType('u128', 100000000000)
      });
      const {data:[retNetworkId, retNetworkInfo]} = await TxMosaicTests.testSetNetwork(startRelayerWallet, networkId, networkInfo);
      //Later to be changed to !!Yasin
      expect(networkId.toNumber()).to.be.equal(2);
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
      const networkId = api.createType('u128', 2);
      const remoteAssetId = api.createType('CommonMosaicRemoteAssetId', {
        EthereumTokenAddress: api.createType('[u8;20]', "0x0000000000000000000000000000000000000000") 
      });
      const{data: [result]} = await TxMosaicTests.testUpdateAssetMaping(sudoKey, 2, 2, remoteAssetId);
      expect(result.isOk).to.be.true;
    });

    it('Should be able to send transfers to another network', async function(){
      this.timeout(2*60*1000);
      const paramNetworkId = api.createType('u32', 2);
      const paramAssetId = api.createType('u128', 2);
      const paramRemoteTokenContAdd = api.createType('[u8;20]', "0x0000000000000000000000000000000000000000");
      const paramAmount = api.createType('u128', 250);
      const paramKeepAlive = api.createType('bool', false);
      const {data: [result]} = await TxMosaicTests.testTransferTo(startRelayerWallet, paramNetworkId, paramAssetId, paramRemoteTokenContAdd, paramAmount, paramKeepAlive); 
      const lockedAmount = await api.query.mosaic.outgoingTransactions(startRelayerWallet.address, 2);
      expect(lockedAmount.unwrap()[0].toNumber()).to.be.equal(paramAmount);
    });

    it.only('Should be able to mint assets into pallet wallet with timelock', async function(){
      this.timeout(2*60*1000);
      const paramNetworkId = api.createType('u32', 2);
      const remoteAssetId = api.createType('CommonMosaicRemoteAssetId', {
        EthereumTokenAddress: api.createType('[u8;20]', "0x0000000000000000000000000000000000000000") 
      });
      const toTransfer = walletBob.address;
      const amount = api.createType('u128', 200);
      const lockTime = api.createType('u32', 22);
      await TxMosaicTests.lockFunds(walletAlice, paramNetworkId, remoteAssetId, toTransfer, amount, lockTime);

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
      api.events.mosaic.TransferIntoRescined.is,
      api.tx.mosaic.timelockedMint(network, remoteAsset, sentWallet, amount, lockTime, paramId) 
    )
  } 
}
