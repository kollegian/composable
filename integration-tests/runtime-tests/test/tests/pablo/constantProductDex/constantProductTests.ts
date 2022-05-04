import testConfiguration from './test_configuration.json';
import { expect } from 'chai';
import {bignumber} from 'chai-bignumber';
import {KeyringPair} from "@polkadot/keyring/types";
import { addFundstoThePool, buyFromPool, createPool, getOwnerFee, getUserTokens, removeLiquidityFromPool, sellToPool, swapTokenPairs } from './testHandlers/constantProductDexHelper';
import {mintAssetsToWallet, Pica} from '@composable/utils/mintingHelper';
import BN from "bn.js";

/**
   * This suite includes tests for the constantProductDex Pallet. 
   * Tested functionalities are:
   * Create - AddLiquidity - Buy - Sell - Swap - RemoveLiquidity with basic calculations with constantProductFormula and OwnerFee.  
   * Mainly consists of happy path testing.
*/
describe('tx.constantProductDex Tests', function () {
  let walletId1: KeyringPair,
  walletId2: KeyringPair;
  let poolId: number, poolId2: number,
  baseAssetId: number, baseAsset2: number,
  quoteAssetId: number, quoteAsset2: number,
  wallet1LpTokens: bigint,
  baseAmount: bigint,
  quoteAmount: bigint,
  fee: number,
  ownerFee: number,
  walletId1Account: string,
  walletId2Account: string;
    
  before('Initialize variables', function() {
    walletId1 = walletEve.derive("/test/constantProductDex/walletId1");
    walletId2 = walletBob.derive("/test/constantProductDex/walletId2");
    walletId1Account = api.createType('AccountId32', walletId1.address).toString();
    walletId2Account = api.createType('AccountId32', walletId2.address).toString();
    baseAssetId = 2;
    quoteAssetId = 3;
    baseAsset2 = 7;
    quoteAsset2 = 23;
    baseAmount = Pica(2500);
    quoteAmount = Pica(2500);
    fee = 10000;
    //sets the owner fee to 1.00%/Type Permill
    ownerFee = 50000;
  });   
  
  before('Minting assets', async function() {
    this.timeout(8*60*1000);
    await mintAssetsToWallet(walletId1, walletAlice, [1, baseAssetId, quoteAssetId, baseAsset2, quoteAsset2]);
    await mintAssetsToWallet(walletId2, walletAlice, [1, baseAssetId, quoteAssetId, baseAsset2, quoteAsset2]);
  });
  
  describe('tx.constantProductDex Success Tests', function() {
    if(!testConfiguration.enabledTests.successTests.enabled){
      return;
    }

    it('Users can create a constantProduct pool', async function() {
      if(!testConfiguration.enabledTests.successTests.createPool.enabled){
        this.skip();
      }
      this.timeout(2*60*1000);
      poolId = await createPool(walletId1,
        walletId1,
        baseAssetId,
        quoteAssetId,
        fee,
        ownerFee
      );
      const returnedOwnerFee = await getOwnerFee("constantProduct", poolId);
      //verify if the pool is created
      expect(poolId).to.be.a('number');
      //Verify if the pool is created with specified owner Fee
      expect(returnedOwnerFee).to.be.equal(ownerFee);              
    });

    it("Users can create another pool with different assetIds", async function(){
      if(!testConfiguration.enabledTests.successTests.createPool.enabled){
        this.skip();
      }
      this.timeout(2*60*1000);
      poolId2 = await createPool(walletId2,
          walletId2,
          baseAssetId,
          quoteAsset2,
          fee,
          ownerFee
      );
      const returnedOwnerFee = await getOwnerFee("constantProduct", poolId2);
      //verify if the pool is created
      expect(poolId2).to.be.a('number');
      //Verify if the pool is created with specified owner Fee
      expect(returnedOwnerFee).to.be.equal(ownerFee);
    })
        
    it('Given that users has sufficient balance, User1 can send funds to pool', async function(){
      if(!testConfiguration.enabledTests.successTests.addLiquidityTests.enabled){
        this.skip();
      }
      this.timeout(2*60*1000);
      const result = await addFundstoThePool(poolId,
        walletId1,
        baseAmount,
        quoteAmount
      );
      //Once funds added to the pool, User is deposited with LP Tokens. 
      wallet1LpTokens = BigInt(result.returnedLPTokens.toString());
      expect(BigInt(result.baseAdded.toString(10))).to.be.equal(baseAmount);
      expect(BigInt(result.quoteAdded.toString(10))).to.be.equal(quoteAmount);
      expect(result.walletIdResult.toString()).to.be.equal(walletId1Account);
    });
    it('Given that users has sufficient balance, User2 can send funds to pool2', async function(){
      if(!testConfiguration.enabledTests.successTests.addLiquidityTests.enabled){
        this.skip();
      }
      this.timeout(2*60*1000);
      const result = await addFundstoThePool(poolId2,
          walletId2,
          baseAmount,
          quoteAmount
      );
      //Once funds added to the pool, User is deposited with LP Tokens.
      wallet1LpTokens = BigInt(result.returnedLPTokens.toString());
      expect(BigInt(result.baseAdded.toString(10))).to.be.equal(baseAmount);
      expect(BigInt(result.quoteAdded.toString(10))).to.be.equal(quoteAmount);
      expect(result.walletIdResult.toString()).to.be.equal(walletId2Account);
    });

    it('User2 can send funds to pool and router adjusts deposited amounts based on constantProductFormula to prevent arbitrage//Removed?', async function(){
      if(!testConfiguration.enabledTests.successTests.addLiquidityTests.enabled){
        this.skip();
      }
      this.timeout(2*60*1000);
      const assetAmount = Pica(30);
      const quoteAmount = Pica(100);
      const result = await addFundstoThePool(poolId, walletId2, assetAmount, quoteAmount);
      //The deposited amount should be maintained by the dex router hence should maintain 1:1. 
      expect(BigInt(result.quoteAdded.toString(10))).to.be.equal(assetAmount);
      expect(result.walletIdResult.toString()).to.be.equal(walletId2Account);
    });

    it("Given the pool has the sufficient funds, User1 can't completely drain the funds", async function(){
      if(!testConfiguration.enabledTests.successTests.poolDrainTest.enabled){
        this.skip();
      }
      this.timeout(2*60*1000);
      await buyFromPool(poolId, walletId1, baseAssetId, Pica(2530)).catch(error=>{
        expect(error.message).to.contain('arithmetic');
      });
    });

    it('User1 can buy from the pool and router respects the constantProductFormula', async function() {
      if(!testConfiguration.enabledTests.successTests.buyTest.enabled){
        this.skip();
      }
      this.timeout(2 * 60 * 1000);
      const result = await buyFromPool(poolId, walletId1, baseAssetId, Pica(30));
      expect(result.accountId.toString()).to.be.equal(walletId1Account);
      //Expected amount is calculated based on the constantProductFormula which is 1:1 for this case. 
      expect(result.quoteAmount.toString(10)).to.be.bignumber.closeTo(result.expectedConversion.toString(), Pica(1).toString());
    });
    
    it('User1 can sell on the pool', async function(){
      if(!testConfiguration.enabledTests.successTests.sellTest.enabled){
        this.skip();
      }
      this.timeout(2*60*1000);
      const accountIdSeller = await sellToPool(poolId, walletId1, baseAssetId, 20);
      expect(accountIdSeller).to.be.equal(walletId1Account);
    });

    it('User2 can swap from the pool', async function(){
      if(!testConfiguration.enabledTests.successTests.swapTest.enabled){
        this.skip();
      }
      this.timeout(2*60*1000);
      const quotedAmount = Pica(12);
      const result = await swapTokenPairs(poolId, walletId2,
        baseAssetId,
        quoteAssetId,
        quotedAmount,
      );
      expect(result.returnedQuoteAmount.toBigInt()).to.be.equal(quotedAmount);
    });

    it('Owner of the pool receives owner fee on the transactions happened in the pool', async function(){
      if(!testConfiguration.enabledTests.successTests.ownerFeeTest.enabled){
        this.skip();
      }
      this.timeout(2*60*1000);
      const ownerInitialTokens = await getUserTokens(walletId1, quoteAssetId);
      const result = await buyFromPool(poolId, walletId2, baseAssetId, Pica(500));
      const ownerAfterTokens = await getUserTokens(walletId1, quoteAssetId);
      //verifies the ownerFee to be added in the owner account.
      expect((ownerAfterTokens.toString(10))).to.be.bignumber.greaterThan(ownerInitialTokens.toString(10));
    });

    it('User1 can remove liquidity from the pool by using LP Tokens', async function(){
      if(!testConfiguration.enabledTests.successTests.removeLiquidityTest.enabled){
        this.skip();
      }
      this.timeout(2*60*1000);
      const result = await removeLiquidityFromPool(poolId, walletId1, Pica(1));
      expect(result.resultBase.toBn()).to.be.bignumber.closeTo(result.resultQuote.toBn(), Pica(10).toString());
    });
    it(" Verify that users can swap token pairs with the use of dex router", async function(){
      if(!testConfiguration.enabledTests.successTests.swapTest.enabled){
        this.skip();
      }
      this.timeout(2*60*1000);
      const quotedAmount = Pica(12);
      const result = await swapTokenPairs(poolId, walletId2,
          baseAssetId,
          baseAsset2,
          quotedAmount,
      );
      expect(result.returnedQuoteAmount.toBigInt()).to.be.equal(quotedAmount);
    })
  });
})
