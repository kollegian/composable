"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOwnerFee = exports.getUserTokens = exports.swapTokenPairs = exports.removeLiquidityFromPool = exports.sellToPool = exports.buyFromPool = exports.addFundstoThePool = exports.createPool = void 0;
const polkadotjs_1 = require("@composable/utils/polkadotjs");
/**
 *Contains handler methods for the constantProductDex Tests.
 */
let poolId;
let constantProductk;
let baseAmountTotal;
let quoteAmountTotal;
let mintedLPTokens;
baseAmountTotal = 0;
quoteAmountTotal = 0;
mintedLPTokens = 0;
async function createPool(walletId, baseAssetId, quoteAssetId, ownerFee) {
    const pair = api.createType('ComposableTraitsDefiCurrencyPair', {
        base: api.createType('u128', baseAssetId),
        quote: api.createType('u128', quoteAssetId)
    });
    const fee = api.createType('Permill', 0);
    const ownerFees = api.createType('Permill', ownerFee);
    const { data: [resultPoolId], } = await (0, polkadotjs_1.sendAndWaitForSuccess)(api, walletId, api.events.constantProductDex.PoolCreated.is, api.tx.constantProductDex.create(pair, fee, ownerFees));
    poolId = resultPoolId.toNumber();
    return poolId;
}
exports.createPool = createPool;
async function addFundstoThePool(walletId, baseAmount, quoteAmount) {
    const baseAmountParam = api.createType('u128', baseAmount);
    const quoteAmountParam = api.createType('u128', quoteAmount);
    const keepAliveParam = api.createType('bool', true);
    const minMintAmountParam = api.createType('u128', 0);
    const { data: [, walletIdResult, baseAdded, quoteAdded, returnedLPTokens] } = await (0, polkadotjs_1.sendAndWaitForSuccess)(api, walletId, api.events.constantProductDex.LiquidityAdded.is, api.tx.constantProductDex.addLiquidity(poolId, baseAmountParam, quoteAmountParam, minMintAmountParam, keepAliveParam));
    mintedLPTokens += returnedLPTokens.toNumber();
    baseAmountTotal += baseAdded.toNumber();
    quoteAmountTotal += quoteAdded.toNumber();
    return { walletIdResult, baseAdded, quoteAdded, returnedLPTokens };
}
exports.addFundstoThePool = addFundstoThePool;
async function buyFromPool(walletId, assetId, amountToBuy) {
    const poolIdParam = api.createType('u128', poolId);
    const assetIdParam = api.createType('u128', assetId);
    const amountParam = api.createType('u128', amountToBuy);
    const keepAlive = api.createType('bool', true);
    constantProductk = baseAmountTotal * quoteAmountTotal;
    let expectedConversion = Math.floor((constantProductk / (baseAmountTotal - amountToBuy))) - quoteAmountTotal;
    const { data: [accountId, poolArg, quoteArg, swapArg, amountgathered, quoteAmount, ownerFee] } = await (0, polkadotjs_1.sendAndWaitForSuccess)(api, walletId, api.events.constantProductDex.Swapped.is, api.tx.constantProductDex.buy(poolIdParam, assetIdParam, amountParam, keepAlive));
    return { accountId, quoteAmount, expectedConversion, ownerFee };
}
exports.buyFromPool = buyFromPool;
async function sellToPool(walletId, assetId, amount) {
    const poolIdParam = api.createType('u128', poolId);
    const assetIdParam = api.createType('u128', assetId);
    const amountParam = api.createType('u128', amount);
    const keepAliveParam = api.createType('bool', false);
    const { data: [result, ...rest] } = await (0, polkadotjs_1.sendAndWaitForSuccess)(api, walletId, api.events.constantProductDex.Swapped.is, api.tx.constantProductDex.sell(poolIdParam, assetIdParam, amountParam, keepAliveParam));
    return result.toString();
}
exports.sellToPool = sellToPool;
async function removeLiquidityFromPool(walletId, lpTokens) {
    const expectedLPTokens = mintedLPTokens - lpTokens;
    const poolIdParam = api.createType('u128', poolId);
    const lpTokenParam = api.createType('u128', lpTokens);
    const minBaseParam = api.createType('u128', 0);
    const minQuoteAmountParam = api.createType('u128', 0);
    const { data: [resultPoolId, resultWallet, resultBase, resultQuote, remainingLpTokens] } = await (0, polkadotjs_1.sendAndWaitForSuccess)(api, walletId, api.events.constantProductDex.LiquidityRemoved.is, api.tx.constantProductDex.removeLiquidity(poolIdParam, lpTokenParam, minBaseParam, minQuoteAmountParam));
    return { remainingLpTokens, expectedLPTokens };
}
exports.removeLiquidityFromPool = removeLiquidityFromPool;
async function swapTokenPairs(wallet, baseAssetId, quoteAssetId, quoteAmount, minReceiveAmount = 0) {
    const poolIdParam = api.createType('u128', poolId);
    const currencyPair = api.createType('ComposableTraitsDefiCurrencyPair', {
        base: api.createType('u128', baseAssetId),
        quote: api.createType('u128', quoteAssetId)
    });
    const quoteAmountParam = api.createType('u128', quoteAmount);
    const minReceiveParam = api.createType('u128', minReceiveAmount);
    const keepAliveParam = api.createType('bool', true);
    const { data: [resultPoolId, resultWallet, resultQuote, resultBase, resultBaseAmount, returnedQuoteAmount,] } = await (0, polkadotjs_1.sendAndWaitForSuccess)(api, wallet, api.events.constantProductDex.Swapped.is, api.tx.constantProductDex.swap(poolIdParam, currencyPair, quoteAmountParam, minReceiveParam, keepAliveParam));
    return { returnedQuoteAmount };
}
exports.swapTokenPairs = swapTokenPairs;
async function getUserTokens(walletId, assetId) {
    const { free, reserved, frozen } = await api.query.tokens.accounts(walletId.address, assetId);
    return free.toNumber();
}
exports.getUserTokens = getUserTokens;
async function getOwnerFee(poolId) {
    const result = await api.query.constantProductDex.pools(api.createType('u128', poolId));
    return result.unwrap().ownerFee.toNumber();
}
exports.getOwnerFee = getOwnerFee;
