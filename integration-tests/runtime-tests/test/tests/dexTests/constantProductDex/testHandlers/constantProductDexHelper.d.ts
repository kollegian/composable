import { KeyringPair } from "@polkadot/keyring/types";
import { u128 } from '@polkadot/types-codec';
export declare function createPool(walletId: KeyringPair, baseAssetId: number, quoteAssetId: number, ownerFee: number): Promise<number>;
export declare function addFundstoThePool(walletId: KeyringPair, baseAmount: number, quoteAmount: number): Promise<{
    walletIdResult: import("@polkadot/types/interfaces").AccountId32;
    baseAdded: u128;
    quoteAdded: u128;
    returnedLPTokens: u128;
}>;
export declare function buyFromPool(walletId: KeyringPair, assetId: number, amountToBuy: number): Promise<{
    accountId: import("@polkadot/types/interfaces").AccountId32;
    quoteAmount: u128;
    expectedConversion: number;
    ownerFee: u128;
}>;
export declare function sellToPool(walletId: KeyringPair, assetId: number, amount: number): Promise<string>;
export declare function removeLiquidityFromPool(walletId: KeyringPair, lpTokens: number): Promise<{
    remainingLpTokens: u128;
    expectedLPTokens: number;
}>;
export declare function swapTokenPairs(wallet: KeyringPair, baseAssetId: number, quoteAssetId: number, quoteAmount: number, minReceiveAmount?: number): Promise<{
    returnedQuoteAmount: u128;
}>;
export declare function getUserTokens(walletId: KeyringPair, assetId: number): Promise<number>;
export declare function getOwnerFee(poolId: number): Promise<number>;
