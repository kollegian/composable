import {sendAndWaitForSuccess, sendAndWaitForWithBatch} from "@composable/utils/polkadotjs";
import {expect} from "chai";
import {SubmittableExtrinsic} from "@polkadot/api/promise/types";
import {ISubmittableResult} from "@polkadot/types/types";
import {Extrinsic} from "@polkadot/types/interfaces/extrinsics";

/***
 * This mints all specified assets to a specified wallet.
 * The best way would be to make a list of all transactions, and sending them at once.
 * But due to issues with our current handler when sending transactions at the same time (Priority to low event),
 * we send them one after another. Check [CU-20jc9ug]
 *
 * @param wallet The wallet receiving the assets.
 * @param sudoKey The sudo key making the transaction.
 * @param assetIDs All assets to be minted to wallet.
 * @param amount Mint amount.
 */

export async function mintAssetsToWallet(wallet, sudoKey, assetIDs:number[]) {
  const amount = api.createType('u128', BigInt(100000000000000000000));
  const tx : [SubmittableExtrinsic]= [api.tx.sudo.sudo(
      api.tx.assets.mintInto(1, wallet.publicKey, amount)
  )];
  for (const asset of assetIDs) {
    tx.push(api.tx.sudo.sudo(
        api.tx.assets.mintInto(asset, wallet.publicKey, amount)
    ));
  }
  /*const {data: [result]} = await sendAndWaitForWithBatch(
      api,
      sudoKey,
      api.events.sudo.Sudid.is,
      tx,
      false
    );
    expect(result.isOk).to.be.true;*/
  await api.tx.utility.batch(tx).signAndSend(sudoKey, {nonce: -1});
}
