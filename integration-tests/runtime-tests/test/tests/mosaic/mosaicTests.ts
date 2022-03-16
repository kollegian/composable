import { expect } from 'chai';
import {ApiPromise} from "@polkadot/api";
import testConfiguration from './test_configuration.json';
import { sendAndWaitForSuccess } from '@composable/utils/polkadotjs';
import {KeyringPair} from "@polkadot/keyring/types";

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

    before(function() {
      sudoKey = walletAlice;
      startRelayerWallet = walletEve.derive("/test/mosaic/relayerWallet");
      newRelayerWallet = walletEve.derive("/test/mosaic/newRelayerWallet");
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
      this.skip(); // ToDo: Remove when rotateRelayer() works!
      // Check if this test is enabled.
      if (!testConfiguration.enabledTests.query.account__success.balanceGTZero1)
        this.skip();
      // Setting timeout to 2 minutes.
      this.timeout(2 * 60 * 1000);
      const {data:[result]} = await TxMosaicTests.testRotateRelayer(sudoKey, newRelayerWallet.address, 16);
      expect(result.isOk).to.be.true;
    });

    /**
     * Setting the network.
     */
    it('Should be able to rotate relayer', async function () {
      // Check if this test is enabled.
      if (!testConfiguration.enabledTests.query.account__success.balanceGTZero1)
        this.skip();
      // Setting timeout to 2 minutes.
      this.timeout(2 * 60 * 1000);
      const networkId = api.createType('u32', 2)
      const networkInfo = api.createType('PalletMosaicNetworkInfo', {
        enabled: api.createType('bool', false),
        maxTransferSize: api.createType('u128', 100000000000)
      });
      const {data:[result]} = await TxMosaicTests.testSetNetwork(sudoKey, networkId, networkInfo);
      expect(result.isOk).to.be.true;
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
      const amount = api.createType('u128', 1);
      const decay = api.createType('PalletMosaicDecayBudgetPenaltyDecayer', {
        Linear:
          api.createType('PalletMosaicDecayLinearDecayer', {Linear: api.createType('u128', 1), negative: false})

      });
      const {data:[result]} = await TxMosaicTests.testSetBudget(sudoKey, assetId, amount, decay);
      expect(result.isOk).to.be.true;
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

  public static async testRotateRelayer(sudoKey:KeyringPair, newRelayerWallet, validatedTtl) {
    return await sendAndWaitForSuccess(
      api,
      sudoKey,
      api.events.sudo.Sudid.is,
      api.tx.sudo.sudo(api.tx.mosaic.rotateRelayer(newRelayerWallet, validatedTtl))
    );
  }

  public static async testSetNetwork(sudoKey:KeyringPair, networkId, networkInfo) {
    return await sendAndWaitForSuccess(
      api,
      sudoKey,
      api.events.sudo.Sudid.is,
      api.tx.sudo.sudo(api.tx.mosaic.setNetwork(networkId, networkInfo))
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
}
