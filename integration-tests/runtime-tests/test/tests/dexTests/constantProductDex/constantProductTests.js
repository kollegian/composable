"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_configuration_json_1 = __importDefault(require("./test_configuration.json"));
const chai_1 = require("chai");
const constantProductDexHelper_1 = require("./testHandlers/constantProductDexHelper");
const mintingHelper_1 = require("@composable/utils/mintingHelper");
/**
   * This suite includes tests for the constantProductDex Pallet.
   * Tested functionalities are:
   * Create - AddLiquidity - Buy - Sell - Swap - RemoveLiquidity with basic calculations with constantProductFormula and OwnerFee.
   * Mainly consists of happy path testing.
*/
describe('tx.constantProductDex Tests', function () {
    let walletId1, walletId2;
    let poolId, baseAssetId, quoteAssetId, wallet1LpTokens, baseAmount, quoteAmount, ownerFee, walletId1Account, walletId2Account;
    before('Initialize variables', function () {
        walletId1 = walletEve.derive("/test/constantProductDex/walletId1");
        walletId2 = walletBob.derive("/test/constantProductDex/walletId2");
        walletId1Account = api.createType('AccountId32', walletId1.address).toString();
        walletId2Account = api.createType('AccountId32', walletId2.address).toString();
        baseAssetId = 2;
        quoteAssetId = 3;
        baseAmount = 2500;
        quoteAmount = 2500;
        //sets the owner fee to 1.00%/Type Permill
        ownerFee = 10000;
    });
    before('Minting assets', async function () {
        this.timeout(8 * 60 * 1000);
        await (0, mintingHelper_1.mintAssetsToWallet)(walletId1, walletAlice, [1, baseAssetId, quoteAssetId]);
        await (0, mintingHelper_1.mintAssetsToWallet)(walletId2, walletAlice, [1, baseAssetId, quoteAssetId]);
    });
    describe('tx.constantProductDex Success Tests', function () {
        if (!test_configuration_json_1.default.enabledTests.successTests.enabled) {
            return;
        }
        it('Users can create a constantProduct pool', async function () {
            if (!test_configuration_json_1.default.enabledTests.successTests.createPool.enabled) {
                return;
            }
            this.timeout(2 * 60 * 1000);
            poolId = await (0, constantProductDexHelper_1.createPool)(walletId1, baseAssetId, quoteAssetId, ownerFee);
            let returnedOwnerFee = await (0, constantProductDexHelper_1.getOwnerFee)(poolId);
            //verify if the pool is created
            (0, chai_1.expect)(poolId).to.be.a('number');
            //Verify if the pool is created with specified owner Fee
            (0, chai_1.expect)(returnedOwnerFee).to.be.equal(ownerFee);
        });
        it('Given that users has sufficient balance, User1 can send funds to pool', async function () {
            if (!test_configuration_json_1.default.enabledTests.successTests.addLiquidityTests.enabled) {
                return;
            }
            this.timeout(2 * 60 * 1000);
            const result = await (0, constantProductDexHelper_1.addFundstoThePool)(walletId1, baseAmount, quoteAmount);
            //Once funds added to the pool, User is deposited with LP Tokens. 
            wallet1LpTokens = result.returnedLPTokens.toNumber();
            (0, chai_1.expect)(result.baseAdded.toNumber()).to.be.equal(baseAmount);
            (0, chai_1.expect)(result.quoteAdded.toNumber()).to.be.equal(quoteAmount);
            (0, chai_1.expect)(result.walletIdResult.toString()).to.be.equal(walletId1Account);
        });
        it('User2 can send funds to pool and router adjusts deposited amounts based on constantProductFormula to prevent arbitrage', async function () {
            if (!test_configuration_json_1.default.enabledTests.successTests.addLiquidityTests.enabled) {
                return;
            }
            this.timeout(2 * 60 * 1000);
            const assetAmount = 30;
            const quoteAmount = 100;
            const result = await (0, constantProductDexHelper_1.addFundstoThePool)(walletId2, assetAmount, quoteAmount);
            //The deposited amount should be maintained by the dex router hence should maintain 1:1. 
            (0, chai_1.expect)(result.quoteAdded.toNumber()).to.be.equal(assetAmount);
            (0, chai_1.expect)(result.walletIdResult.toString()).to.be.equal(walletId2Account);
        });
        it("Given the pool has the sufficient funds, User1 can't completely drain the funds", async function () {
            if (!test_configuration_json_1.default.enabledTests.successTests.poolDrainTest.enabled) {
                return;
            }
            this.timeout(2 * 60 * 1000);
            await (0, constantProductDexHelper_1.buyFromPool)(walletId1, baseAssetId, 2800).catch(error => {
                (0, chai_1.expect)(error.message).to.contain('arithmetic');
            });
        });
        it('User1 can buy from the pool and router respects the constantProductFormula', async function () {
            if (!test_configuration_json_1.default.enabledTests.successTests.buyTest.enabled) {
                return;
            }
            this.timeout(2 * 60 * 1000);
            const result = await (0, constantProductDexHelper_1.buyFromPool)(walletId1, baseAssetId, 30);
            (0, chai_1.expect)(result.accountId.toString()).to.be.equal(walletId1Account);
            //Expected amount is calculated based on the constantProductFormula which is 1:1 for this case. 
            (0, chai_1.expect)(result.quoteAmount.toNumber()).to.be.equal(result.expectedConversion);
        });
        it('User1 can sell on the pool', async function () {
            if (!test_configuration_json_1.default.enabledTests.successTests.sellTest.enabled) {
                return;
            }
            this.timeout(2 * 60 * 1000);
            const accountIdSeller = await (0, constantProductDexHelper_1.sellToPool)(walletId1, baseAssetId, 20);
            (0, chai_1.expect)(accountIdSeller).to.be.equal(walletId1Account);
        });
        it('User2 can swap from the pool', async function () {
            if (!test_configuration_json_1.default.enabledTests.successTests.swapTest.enabled) {
                return;
            }
            this.timeout(2 * 60 * 1000);
            const quotedAmount = 12;
            const result = await (0, constantProductDexHelper_1.swapTokenPairs)(walletId2, baseAssetId, quoteAssetId, quotedAmount);
            (0, chai_1.expect)(result.returnedQuoteAmount.toNumber()).to.be.equal(quotedAmount);
        });
        it('Owner of the pool receives owner fee on the transactions happened in the pool', async function () {
            if (!test_configuration_json_1.default.enabledTests.successTests.ownerFeeTest.enabled) {
                return;
            }
            this.timeout(2 * 60 * 1000);
            let ownerInitialTokens = await (0, constantProductDexHelper_1.getUserTokens)(walletId1, quoteAssetId);
            const result = await (0, constantProductDexHelper_1.buyFromPool)(walletId2, baseAssetId, 500);
            let ownerAfterTokens = await (0, constantProductDexHelper_1.getUserTokens)(walletId1, quoteAssetId);
            //verifies the ownerFee to be added in the owner account.
            (0, chai_1.expect)(ownerAfterTokens).to.be.equal(ownerInitialTokens + (result.ownerFee.toNumber()));
        });
        it('User1 can remove liquidity from the pool by using LP Tokens', async function () {
            if (!test_configuration_json_1.default.enabledTests.successTests.removeLiquidityTest.enabled) {
                return;
            }
            this.timeout(2 * 60 * 1000);
            //Randomly checks an integer value that is always < mintedLPTokens. 
            const result = await (0, constantProductDexHelper_1.removeLiquidityFromPool)(walletId1, Math.floor(Math.random() * wallet1LpTokens));
            (0, chai_1.expect)(result.remainingLpTokens.toNumber()).to.be.equal(result.expectedLPTokens);
        });
    });
});
