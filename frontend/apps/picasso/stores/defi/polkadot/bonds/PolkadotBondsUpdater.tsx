import { useCallback, useEffect, VoidFunctionComponent } from "react";
import { usePicassoAccounts, usePicassoProvider } from "@/defi/polkadot/hooks";
import { fetchBonds } from "@/defi/polkadot/pallets/BondedFinance";
import { useStore } from "@/stores/root";

export const Updater: VoidFunctionComponent = () => {
  const { parachainApi: api } = usePicassoProvider();
  const tokens = useStore(({ substrateTokens }) => substrateTokens.tokens);
  const accounts = usePicassoAccounts();
  const { setBonds, setBondOfferCount } = useStore((state) => state.bonds);

  const updateBonds = useCallback(async () => {
    if (!api) return;
    const { bonds, bondOfferCount } = await fetchBonds(api, tokens);
    setBonds(bonds);
    setBondOfferCount(bondOfferCount);
  }, [setBonds, setBondOfferCount, api, tokens]);
  useEffect(() => {
    updateBonds();
  }, [accounts, updateBonds]);

  return null;
};
