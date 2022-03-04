import { sendAndWaitForSuccess } from '@composable/utils/polkadotjs';
import testConfiguration from './test_configuration.json';
import {expect} from "chai";
import {KeyringPair} from "@polkadot/keyring/types";


describe('tx.constantProductDex Tests', function () {
  if (!testConfiguration.enabledTests.enabled)
    return;

  let poolId:number;
  let wallet:KeyringPair;

  describe('tx.constantProductDex.create Success Tests', function() {
    before('Setting Variables', function() {
      wallet = walletAlice;
    })
    it('Can create constantProduct pool', async function() {
      // Setting timeout to 2 minutes.
      this.timeout(2 * 60 * 1000);

      // Defining Parameters
      const pair = api.createType('ComposableTraitsDefiCurrencyPair', {
        base: api.createType('u128', 1),
        quote: api.createType('u128', 2)
      });
      const fee = api.createType('Permill', 1);
      const ownerFee = api.createType('Permill', 1);

      // Sending Transaction
      const {data: [resultPooldId, resultAccountId],} = await sendAndWaitForSuccess(
        api,
        wallet,
        api.events.constantProductDex.PoolCreated.is,
        api.tx.constantProductDex.create(pair, fee, ownerFee)
      );

      // Checking Results
      expect(resultAccountId).to.be.equal(api.createType('AccountId32', wallet.publicKey));
      expect(resultPooldId).to.be.a('BigNumber');
      poolId = resultPooldId.toNumber();
    })
  });

  describe('tx.constantProductDex.buy Success Tests', ()=>{
    it('Can buy from pool', async function() {
      // Setting timeout to 2 minutes.
      this.timeout(2 * 60 * 1000);
      const parameterPoolId = api.createType('u128', poolId);
      const assetId = api.createType('u128', 1);
      const amount = api.createType('u128', 1000);
      const keepAlive = api.createType('bool', true);

      const {data: [result], } = await sendAndWaitForSuccess(
        api,
        wallet,
        api.events.constantProductDex.Swapped.is,
        api.tx.constantProductDex.buy(
          parameterPoolId,
          assetId,
          amount,
          keepAlive
        )
      );
      console.debug(result);
    });
  })

  describe('tx.constantProductDex.sell Success Tests', ()=>{return;})

  describe('tx.constantProductDex.swap Success Tests', ()=>{return;})
});
