import { sendAndWaitForSuccess } from '@composable/utils/polkadotjs';
import {KeyringPair} from "@polkadot/keyring/types";
import { u128 } from '@polkadot/types-codec';

/**
 *Contains handler methods for the constantProductDex Tests. 
 */
let constantProductk: bigint;
let baseAmountTotal: bigint;
let quoteAmountTotal: bigint;
let mintedLPTokens: bigint;
baseAmountTotal = BigInt(0);
quoteAmountTotal = BigInt(0);
mintedLPTokens = BigInt(0);

export async function createPool(walletId: KeyringPair, owner: KeyringPair, baseAssetId: number, quoteAssetId: number, fee: number, ownerFee: number){
  const pool = api.createType("PalletPabloPoolInitConfiguration", {
    ConstantProduct: {
      owner: api.createType("AccountId32", owner.address),
      pair: api.createType('ComposableTraitsDefiCurrencyPairCurrencyId', {
        base: api.createType('u128', baseAssetId),
        quote: api.createType('u128', quoteAssetId)
      }),
      fee: api.createType('Permill', fee),
      ownerFee: api.createType('Permill', ownerFee)
    }
  });
  const {data: [resultPoolId,]} = await sendAndWaitForSuccess(
    api,
    walletId,
    api.events.pablo.PoolCreated.is,
    api.tx.pablo.create(pool)
  );
    return resultPoolId.toNumber();
}
export async function addFundstoThePool(poolId:number, walletId:KeyringPair, baseAmount:bigint, quoteAmount:bigint){
  const pool = api.createType("u128", poolId)
  const baseAmountParam = api.createType('u128', baseAmount);
  const quoteAmountParam = api.createType('u128', quoteAmount);
  const keepAliveParam = api.createType('bool', true);
  const minMintAmountParam = api.createType('u128', 0);
  const {data: [walletIdResult, addedPool, baseAdded, quoteAdded,returnedLPTokens]} =await sendAndWaitForSuccess(
    api,
    walletId,
    api.events.pablo.LiquidityAdded.is,
    api.tx.pablo.addLiquidity(pool,
      baseAmountParam, 
      quoteAmountParam, 
      minMintAmountParam, 
      keepAliveParam
    )
  );
  mintedLPTokens += BigInt(returnedLPTokens.toString(10));
  baseAmountTotal += BigInt(baseAdded.toString(10));
  quoteAmountTotal += BigInt(quoteAdded.toString(10));
  return {walletIdResult, baseAdded, quoteAdded, returnedLPTokens};
}

export async function buyFromPool(poolId: number, walletId: KeyringPair, assetId:number, amountToBuy: bigint){
  const poolIdParam = api.createType('u128', poolId);
  const assetIdParam = api.createType('u128', assetId);
  const amountParam = api.createType('u128', amountToBuy);
  const keepAlive = api.createType('bool', true);
  const minMintAmount = api.createType('u128', 0);
  constantProductk = baseAmountTotal*quoteAmountTotal;
  const expectedConversion = constantProductk/(baseAmountTotal-amountToBuy)-quoteAmountTotal;
  const {data: [retPoolId, accountId, baseArg, quoteArg,returnArg,baseAmount,quoteAmount,ownerFee] } = await sendAndWaitForSuccess(
    api,
    walletId,
    api.events.pablo.Swapped.is,
    api.tx.pablo.buy(
      poolIdParam,
      assetIdParam,
      amountParam,
      minMintAmount,
      keepAlive
    )
  );
  return {accountId, quoteAmount, expectedConversion, ownerFee};
}

export async function sellToPool(poolId: number, walletId: KeyringPair, assetId: number, amount:number){
  const poolIdParam = api.createType('u128', poolId);
  const assetIdParam = api.createType('u128', assetId);
  const amountParam = api.createType('u128', amount);
  const minMintAmount = api.createType('u128', 0);
  const keepAliveParam = api.createType('bool', false);
  const {data: [result, returnedAccount, ...rest]} = await sendAndWaitForSuccess(
    api,
    walletId,
    api.events.pablo.Swapped.is,
    api.tx.pablo.sell(
      poolIdParam,
      assetIdParam,
      amountParam,
      minMintAmount,
      keepAliveParam
    )
  )
  return returnedAccount.toString();
}

export async function removeLiquidityFromPool(poolId: number, walletId: KeyringPair, lpTokens:bigint): Promise<{resultBase: u128, resultQuote: u128}>{
  let expectedLPTokens = mintedLPTokens;
  expectedLPTokens -= lpTokens;
  const poolIdParam = api.createType('u128', poolId);
  const lpTokenParam = api.createType('u128', lpTokens);
  const minBaseParam = api.createType('u128', 0);
  const minQuoteAmountParam = api.createType('u128', 0);
  const {data: [resultPoolId,resultWallet,resultBase,resultQuote,remainingLpTokens]}=await sendAndWaitForSuccess(
    api,
    walletId,
    api.events.pablo.LiquidityRemoved.is,
    api.tx.pablo.removeLiquidity(
      poolIdParam,
      lpTokenParam,
      minBaseParam,
      minQuoteAmountParam
    )
  );   
  return {resultBase, resultQuote}
}

export async function swapTokenPairs(poolId:number, wallet: KeyringPair,
  baseAssetId: number,
  quoteAssetId:number,
  quoteAmount: bigint,
  minReceiveAmount: number = 0
  ){
    const poolIdParam = api.createType('u128', poolId);
    const currencyPair = api.createType('ComposableTraitsDefiCurrencyPairCurrencyId', {
      base: api.createType('CurrencyId', baseAssetId),
      quote: api.createType('CurrencyId',quoteAssetId)
    });
    const quoteAmountParam = api.createType('u128', quoteAmount);
    const minReceiveParam = api.createType('u128', minReceiveAmount);
    const keepAliveParam = api.createType('bool', true);
    const {data: [resultPoolId,resultWallet,baseAsset,quoteAsset,quoteAssetIdParam,returnedBaseAmount, returnedQuoteAmount, lpTokens]}= await sendAndWaitForSuccess(
      api,
      wallet,
      api.events.pablo.Swapped.is,
      api.tx.pablo.swap(
        poolIdParam,
        currencyPair,
        quoteAmountParam,
        minReceiveParam,
        keepAliveParam
      )
    );
    return {returnedBaseAmount, returnedQuoteAmount};
}

export async function getUserTokens(walletId: KeyringPair, assetId: number){
  const {free, reserved, frozen} = await api.query.tokens.accounts(walletId.address, assetId); 
  return free;
}

export async function getOwnerFee(poolType: string, poolId: number){
  const result = await api.query.pablo.pools(api.createType('u128', poolId));
  return result.unwrap().toJSON()[poolType]["ownerFee"];
}

