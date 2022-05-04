export default {
  rpc: {},
  types: {
    SafeRpcWrapper: "String",
    CustomRpcCurrencyId: "SafeRpcWrapper",
    CustomRpcBalance: "SafeRpcWrapper",
    CurrencyId: "u128",
    AssetsBalance: "u128",
    ComposableTraitsDefiSellCurrencyId: "CurrencyId",
    ComposableTraitsDefiCurrencyPairCurrencyId: {
      base: "CurrencyId",
      quote: "CurrencyId"
    },
    ComposableTraitsXcmCumulusMethodId: "Null",
    ComposableTraitsXcmXcmSellRequest: "Null",
    ComposableTraitsXcmAssetsXcmAssetLocation: "Null",
    ComposableTraitsXcmAssetsForeignMetadata: "Null",
    ComposableTraitsLendingRepayStrategy: "Null",
    ComposableTraitsAssetsBasicAssetMetadata: "Null",
    ComposableTraitsDexDexRoute: "Null"
  },
};
