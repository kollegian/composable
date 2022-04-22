/*
This suite contains tests for Assets Pallet.
Included functionalities are:
- Mint Initialize
- Burn From
- Force Transfer (Sudo)
- Force Transfer Native(sudo)(Transfers native token)
- Mint initialize
- Mint initialize with governance
- Mint into
- Transfer All
- Transfer All Native
- Transfer Native
 */

import {KeyringPair} from "@polkadot/keyring/types";
import {sendAndWaitForSuccess} from "@composable/utils/polkadotjs";
import {add} from "ramda";
import {expect} from "chai";
import {SafeRpcWrapper} from "@composable/types/interfaces";

describe("Test Suite for Assets Pallet", function (){
    let dom: KeyringPair, yasin: KeyringPair, julian: KeyringPair;
    before("Initialize variables", function (){
        dom = walletAlice.derive("/test/AssetsTest/1");
        yasin = walletBob.derive("/test/Assets/2");
        julian = walletFerdie.derive("/test/Assets/3");
    });

    describe("Success Tests for Assets Pallet", function (){
        it("Assets can be minted to the user wallets with sudo call", async function(){
            this.timeout(2*60*1000);
            let amountTobe = BigInt(1200000000000000000);
            const amount = api.createType('u128', amountTobe);
            const assetId = api.createType('u128', 2);
            const address = api.createType('MultiAddress', {
                id: api.createType("AccountId", dom.address)
            })
            const {data:[result]}= await sendAndWaitForSuccess(
                api,
                walletAlice,
                api.events.sudo.Sudid.is,
                api.tx.sudo.sudo(
                    api.tx.assets.mintInto(assetId, address, amount)
                )
            );

        })
    })
})



export class Assets {

}