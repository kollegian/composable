use crate::{
	mock::{AccountId, Call, Extrinsic, *},
	AssetInfo, Error, PrePrice, Price, Withdraw, *,
};
use codec::Decode;
use composable_traits::defi::CurrencyPair;
use frame_support::{
	assert_noop, assert_ok,
	traits::{Currency, OnInitialize},
	BoundedVec,
};
use pallet_balances::Error as BalancesError;
use parking_lot::RwLock;
use sp_core::offchain::{testing, OffchainDbExt, OffchainWorkerExt, TransactionPoolExt};
use sp_io::TestExternalities;
use sp_keystore::{testing::KeyStore, KeystoreExt, SyncCryptoStore};
use sp_runtime::{
	traits::{BadOrigin, Zero},
	FixedPointNumber, FixedU128, Percent, RuntimeAppPublic,
};
use std::sync::Arc;

use proptest::prelude::*;
use composable_tests_helpers::{prop_assert_noop, prop_assert_ok};

use sp_core::H256;

prop_compose! {
    fn asset_info()
        (
            min_answers in 1..MaxAnswerBound::get(),
            max_answers in 1..MaxAnswerBound::get(),
            block_interval in (StalePrice::get()+1)..(BlockNumber::MAX/16),
            threshold in 0..100u8,
            reward in 0..u64::MAX,
            slash in 0..u64::MAX,
        ) -> AssetInfo<Percent, BlockNumber, Balance> {
            let min_answers = max_answers.saturating_sub(min_answers) + 1;
            let threshold: Percent = Percent::from_percent(threshold);

            AssetInfo {
                threshold,
                min_answers,
                max_answers,
                block_interval,
                reward,
                slash,
            }
        }
}

prop_compose! {
    fn asset_id()
        (x in 0..AssetId::MAX) -> AssetId {
            x
        }
}

prop_compose! {
	fn account_id()
		(x in 0..u64::MAX) -> AccountId {
            let h256 = H256::from_low_u64_be(x);
			AccountId::from_h256(h256)
		}
}


mod add_asset_and_info {
    use super::*;

    proptest! {
        #![proptest_config(ProptestConfig::with_cases(10_000))]

        #[test]
        fn normal_asset_and_info_assert(
            asset_id in asset_id(),
            asset_info in asset_info(),
        ) {
            new_test_ext().execute_with(|| {
                let root_account = get_root_account();

                prop_assert_ok!(Oracle::add_asset_and_info(
                    Origin::signed(root_account),
                    asset_id,
                    asset_info.threshold,
                    asset_info.min_answers,
                    asset_info.max_answers,
                    asset_info.block_interval,
                    asset_info.reward,
                    asset_info.slash,
                ));

                Ok(())
            })?;
        }

        #[test]
        fn asset_count_should_not_increase_when_updating_asset_info(
            asset_id in asset_id(),
            asset_info_1 in asset_info(),
            asset_info_2 in asset_info(),
        ) {
            new_test_ext().execute_with(|| {
                let root_account = get_root_account();

                prop_assert_ok!(Oracle::add_asset_and_info(
                    Origin::signed(root_account),
                    asset_id,
                    asset_info_1.threshold,
                    asset_info_1.min_answers,
                    asset_info_1.max_answers,
                    asset_info_1.block_interval,
                    asset_info_1.reward,
                    asset_info_1.slash,
                ));

                // does not increment asset_count because we have info for the same asset_id
                prop_assert_ok!(Oracle::add_asset_and_info(
                    Origin::signed(root_account),
                    asset_id,
                    asset_info_2.threshold,
                    asset_info_2.min_answers,
                    asset_info_2.max_answers,
                    asset_info_2.block_interval,
                    asset_info_2.reward,
                    asset_info_2.slash,
                ));
                prop_assert_eq!(Oracle::assets_count(), 1);

                Ok(())
            })?;
        }

        #[test]
        fn fails_when_non_root_account(
            asset_id in asset_id(),
            asset_info in asset_info(),
            account_id in account_id(),
        ) {
            // very small chance of happening, but for correctness' sake ;)
            prop_assume!(account_id != get_root_account());

            new_test_ext().execute_with(|| {
                prop_assert_noop!(
                    Oracle::add_asset_and_info(
                        Origin::signed(account_id),
                        asset_id,
                        asset_info.threshold,
                        asset_info.min_answers,
                        asset_info.max_answers,
                        asset_info.block_interval,
                        asset_info.reward,
                        asset_info.slash,
                    ),
                    BadOrigin
                );
                Ok(())
            })?;
        }


        #[test]
        fn can_have_multiple_assets(
            asset_id_1 in asset_id(),
            asset_id_2 in asset_id(),
            asset_info_1 in asset_info(),
            asset_info_2 in asset_info(),
        ) {
            new_test_ext().execute_with(|| {
                let root_account = get_root_account();

                prop_assert_ok!(Oracle::add_asset_and_info(
                    Origin::signed(root_account),
                    asset_id_1,
                    asset_info_1.threshold,
                    asset_info_1.min_answers,
                    asset_info_1.max_answers,
                    asset_info_1.block_interval,
                    asset_info_1.reward,
                    asset_info_1.slash,
                ));

                prop_assert_ok!(Oracle::add_asset_and_info(
                    Origin::signed(root_account),
                    asset_id_2,
                    asset_info_2.threshold,
                    asset_info_2.min_answers,
                    asset_info_2.max_answers,
                    asset_info_2.block_interval,
                    asset_info_2.reward,
                    asset_info_2.slash,
                ));

                prop_assert_eq!(Oracle::asset_info(asset_id_1), Some(asset_info_1));
                prop_assert_eq!(Oracle::asset_info(asset_id_2), Some(asset_info_2));
                prop_assert_eq!(Oracle::assets_count(), 2);

                Ok(())
            })?;
        }



        #[test]
        fn max_answers_cannot_be_less_than_min_answers(
            asset_id in asset_id(),
            asset_info in asset_info(),
        ) {
            let root_account = get_root_account();

            new_test_ext().execute_with(|| {
                prop_assert_noop!(
                    Oracle::add_asset_and_info(
                        Origin::signed(root_account),
                        asset_id,
                        asset_info.threshold,       // notice that max and min are reversed:
                        asset_info.max_answers,     // MIN
                        asset_info.min_answers - 1, // MAX
                        asset_info.block_interval,
                        asset_info.reward,
                        asset_info.slash,
                    ),
                    Error::<Test>::MaxAnswersLessThanMinAnswers
                );

                Ok(())
            })?;
        }



        #[test]
        fn threshold_cannot_be_100(
            asset_id in asset_id(),
            asset_info in asset_info(),
        ) {
            let root_account = get_root_account();

            new_test_ext().execute_with(|| {
                prop_assert_noop!(
                    Oracle::add_asset_and_info(
                        Origin::signed(root_account),
                        asset_id,
                        Percent::from_percent(100), // <- notice that this is 100%
                        asset_info.min_answers,
                        asset_info.max_answers,
                        asset_info.block_interval,
                        asset_info.reward,
                        asset_info.slash,
                    ),
                    Error::<Test>::ExceedThreshold
                );

                Ok(())
            })?;
        }


        #[test]
        fn max_answers_cannot_be_more_than_max_answer_bound(
            asset_id in asset_id(),
            asset_info in asset_info(),
        ) {
            let root_account = get_root_account();

            new_test_ext().execute_with(|| {
                prop_assert_noop!(
                    Oracle::add_asset_and_info(
                        Origin::signed(root_account),
                        asset_id,
                        asset_info.threshold,
                        asset_info.min_answers,
                        MaxAnswerBound::get() + 1, // <- notice that this is more than MaxAnswerBound
                        asset_info.block_interval,
                        asset_info.reward,
                        asset_info.slash,
                    ),
                    Error::<Test>::ExceedMaxAnswers
                );

                Ok(())
            })?;
        }

        #[test]
        fn min_answers_cannot_be_0(
            asset_id in asset_id(),
            asset_info in asset_info(),
        ) {
            let root_account = get_root_account();

            new_test_ext().execute_with(|| {
                prop_assert_noop!(
                    Oracle::add_asset_and_info(
                        Origin::signed(root_account),
                        asset_id,
                        asset_info.threshold,
                        0, // <- notice that this is 0
                        asset_info.max_answers,
                        asset_info.block_interval,
                        asset_info.reward,
                        asset_info.slash,
                    ),
                    Error::<Test>::InvalidMinAnswers
                );

                Ok(())
            })?;
        }

        #[test]
        fn cannot_exceed_max_assets_count(
            asset_id_1 in asset_id(),
            asset_id_2 in asset_id(),
            asset_id_3 in asset_id(),
            asset_info_1 in asset_info(),
            asset_info_2 in asset_info(),
            asset_info_3 in asset_info(),
        ) {
            new_test_ext().execute_with(|| {
                let root_account = get_root_account();

                // First we create 2 assets, which is allowed because within mock.rs, we see:
                // pub const MaxAssetsCount: u32 = 2;
                // it would be nicer to do this in a loop up to MaxAssetsCount,
                // but AFAIK it is not possible to generate props within the proptest body.

                // If the following check fails, that means that the mock.rs was changed,
                // and therefore this test should also be changed.
                prop_assert_eq!(MaxAssetsCount::get(), 2u32);

                prop_assert_ok!(Oracle::add_asset_and_info(
                    Origin::signed(root_account),
                    asset_id_1,
                    asset_info_1.threshold,
                    asset_info_1.min_answers,
                    asset_info_1.max_answers,
                    asset_info_1.block_interval,
                    asset_info_1.reward,
                    asset_info_1.slash,
                ));

                prop_assert_ok!(Oracle::add_asset_and_info(
                    Origin::signed(root_account),
                    asset_id_2,
                    asset_info_2.threshold,
                    asset_info_2.min_answers,
                    asset_info_2.max_answers,
                    asset_info_2.block_interval,
                    asset_info_2.reward,
                    asset_info_2.slash,
                ));

                prop_assert_eq!(Oracle::asset_info(asset_id_1), Some(asset_info_1));
                prop_assert_eq!(Oracle::asset_info(asset_id_2), Some(asset_info_2));
                prop_assert_eq!(Oracle::assets_count(), 2);


                prop_assert_noop!(Oracle::add_asset_and_info(
                    Origin::signed(root_account),
                    asset_id_3,
                    asset_info_3.threshold,
                    asset_info_3.min_answers,
                    asset_info_3.max_answers,
                    asset_info_3.block_interval,
                    asset_info_3.reward,
                    asset_info_3.slash,
                ),
                Error::<Test>::ExceedAssetsCount);

                Ok(())
            })?;
        }

    #[test]
        fn block_interval_cannot_be_less_than_stale_price(
            asset_id in asset_id(),
            asset_info in asset_info(),
            invalid_block_interval in 0..StalePrice::get(),
        ) {
            let root_account = get_root_account();

            new_test_ext().execute_with(|| {
                prop_assert_noop!(
                    Oracle::add_asset_and_info(
                        Origin::signed(root_account),
                        asset_id,
                        asset_info.threshold,
                        asset_info.min_answers,
                        asset_info.max_answers,
                        invalid_block_interval,
                        asset_info.reward,
                        asset_info.slash,
                    ),
                    Error::<Test>::BlockIntervalLength
                );

                Ok(())
            })?;
        }
    }
}

mod set_signer {
    use super::*;
    proptest! {
        #![proptest_config(ProptestConfig::with_cases(10_000))]

        #[test]
        fn root_can_be_controller_and_set_signer(
            signer_account in account_id(),
        ) {
            new_test_ext().execute_with(|| {
                let root_account = get_root_account();

                prop_assert_ok!(Oracle::set_signer(Origin::signed(root_account), signer_account));
                prop_assert_eq!(Oracle::controller_to_signer(root_account), Some(signer_account));
                prop_assert_eq!(Oracle::signer_to_controller(signer_account), Some(root_account));

                Ok(())
            })?;
        }

        #[test]
        fn signer_can_also_become_controller(
            controller_account in account_id(),
            signer_account_1 in account_id(), // Will also become a controller.
            signer_account_2 in account_id(), // Will become the signer associated with the controller above.
            controller_balance in MinStake::get()..Balance::MAX,
            signer_1_balance in MinStake::get()..Balance::MAX,
        ) {
            prop_assume!(signer_account_1 != signer_account_2);

            new_test_ext().execute_with(|| {
                Balances::make_free_balance_be(&controller_account, controller_balance);

                prop_assert_ok!(Oracle::set_signer(Origin::signed(controller_account), signer_account_1));
                prop_assert_eq!(Oracle::controller_to_signer(controller_account), Some(signer_account_1));
                prop_assert_eq!(Oracle::signer_to_controller(signer_account_1), Some(controller_account));

                Balances::make_free_balance_be(&signer_account_1, signer_1_balance);

                prop_assert_ok!(Oracle::set_signer(Origin::signed(signer_account_1), signer_account_2));
                prop_assert_eq!(Oracle::controller_to_signer(signer_account_1), Some(signer_account_2));
                prop_assert_eq!(Oracle::signer_to_controller(signer_account_2), Some(signer_account_1));

                Ok(())
            })?;
        }

        #[test]
        fn need_min_stake_balance(
            signer_account in account_id(),
            controller_account in account_id(),
            controller_balance in 0..MinStake::get(),
        ) {
            prop_assume!(signer_account != controller_account);

            new_test_ext().execute_with(|| {
                Balances::make_free_balance_be(&controller_account, controller_balance);

                prop_assert_noop!(
                    Oracle::set_signer(Origin::signed(controller_account), signer_account),
                    BalancesError::<Test>::InsufficientBalance
                );

                Ok(())
            })?;
        }

        #[test]
        fn cannot_use_same_signer_for_two_controllers(
            signer_account in account_id(),
            controller_1_account in account_id(),
            controller_1_balance in MinStake::get()..Balance::MAX,
            controller_2_account in account_id(),
            controller_2_balance in MinStake::get()..Balance::MAX,
        ) {
            prop_assume!(signer_account != controller_1_account);
            prop_assume!(signer_account != controller_2_account);
            prop_assume!(controller_1_account != controller_2_account);

            new_test_ext().execute_with(|| {
                Balances::make_free_balance_be(&controller_1_account, controller_1_balance);
                Balances::make_free_balance_be(&controller_2_account, controller_2_balance);

                prop_assert_ok!(Oracle::set_signer(Origin::signed(controller_1_account), signer_account));

                assert_noop!(
                    Oracle::set_signer(Origin::signed(controller_2_account), signer_account),
                    Error::<Test>::SignerUsed
                );

                Ok(())
            })?;
        }

        #[test]
        fn cannot_use_same_controller_for_two_signers(
            signer_1_account in account_id(),
            signer_2_account in account_id(),
            controller_account in account_id(),
            controller_balance in (MinStake::get() * 2)..Balance::MAX,
        ) {
            prop_assume!(signer_1_account != signer_2_account);
            prop_assume!(signer_1_account != controller_account);
            prop_assume!(signer_2_account != controller_account);

            new_test_ext().execute_with(|| {
                Balances::make_free_balance_be(&controller_account, controller_balance);

                prop_assert_ok!(Oracle::set_signer(Origin::signed(controller_account), signer_1_account));

                assert_noop!(
                    Oracle::set_signer(Origin::signed(controller_account), signer_2_account),
                    Error::<Test>::ControllerUsed
                );

                Ok(())
            })?;
        }


    }

}

mod add_stake {
    use super::*;
    proptest! {
        #![proptest_config(ProptestConfig::with_cases(10_000))]

        #[test]
        fn cannot_add_stake_without_signer_account(
            controller_account in account_id(),
            stake in 0..Balance::MAX,
        ) {
            new_test_ext().execute_with(|| {
                prop_assert_noop!(Oracle::add_stake(Origin::signed(controller_account), stake), Error::<Test>::UnsetSigner);
                Ok(())
            })?;
        }

        #[test]
        fn can_add_balance_to_stake(
            controller_account in account_id(),
            signer_account in account_id(),
            controller_balance in (MinStake::get() + 1)..(Balance::MAX/2), // +1 so that the controller lives after setting signer
            signer_balance in 0..(Balance::MAX/2),
            stake in 0..(Balance::MAX/2),
        ) {
            prop_assume!(controller_account != signer_account);

            // stake = stake.min
            new_test_ext().execute_with(|| {
                Balances::make_free_balance_be(&controller_account, controller_balance);
                Balances::make_free_balance_be(&signer_account, signer_balance);

                prop_assert_ok!(Oracle::set_signer(Origin::signed(controller_account), signer_account));

                let new_controller_balance = controller_balance - MinStake::get();

                // Check if the pre-add-stake balances are correct
                prop_assert_eq!(Balances::free_balance(&controller_account), new_controller_balance);
                prop_assert_eq!(Balances::free_balance(&signer_account), signer_balance);

                // Add the stake
                let stake_to_add = stake.min(new_controller_balance - 1); // -1 so that the controller lives after adding stake
                prop_assert_ok!(Oracle::add_stake(Origin::signed(controller_account), stake_to_add));

                // Check if the post-add-stake balances are correct
                prop_assert_eq!(Balances::free_balance(controller_account), new_controller_balance - stake_to_add);
                prop_assert_eq!(Balances::total_balance(&controller_account), new_controller_balance - stake_to_add);

                // Check if the signer's stake is updated correctly
                let amount_staked = Oracle::oracle_stake(signer_account).unwrap_or_else(|| 0_u32.into());
                prop_assert_eq!(amount_staked, stake_to_add + MinStake::get());

                // Check if the stake is not accidentally added to the controller
                let controller_stake = Oracle::oracle_stake(controller_account).unwrap_or_else(|| 0_u32.into());
                prop_assert_eq!(controller_stake, 0);

                // Check if the signer's total balance includes the amount staked
                prop_assert_eq!(Balances::total_balance(&signer_account), signer_balance + amount_staked);

                Ok(())
            })?;
        }

        #[test]
        fn account_must_live_after_adding_stake(
            controller_account in account_id(),
            signer_account in account_id(),
            controller_balance in (MinStake::get() + 1)..(Balance::MAX/2), // +1 so that the controller lives after setting signer
            signer_balance in 0..(Balance::MAX/2),
        ) {
            prop_assume!(controller_account != signer_account);

            new_test_ext().execute_with(|| {
                Balances::make_free_balance_be(&controller_account, controller_balance);
                Balances::make_free_balance_be(&signer_account, signer_balance);

                prop_assert_ok!(Oracle::set_signer(Origin::signed(controller_account), signer_account));

                let new_controller_balance = controller_balance - MinStake::get();

                // Check if the pre-add-stake balances are correct
                prop_assert_eq!(Balances::free_balance(&controller_account), new_controller_balance);
                prop_assert_eq!(Balances::free_balance(&signer_account), signer_balance);

                // Try to stake the entire controller balance
                prop_assert_noop!(
                    Oracle::add_stake(Origin::signed(controller_account), new_controller_balance),
                    BalancesError::<Test>::KeepAlive
                );

                Ok(())
            })?;
        }

        // TODO: test ExceedStake
        // TODO: check if stakes are isolated
    }
}

mod reclaim_stake {
    use super::*;
    proptest! {
        #![proptest_config(ProptestConfig::with_cases(10_000))]

        #[test]
        fn cannot_reclaim_stake_when_no_signer_set(
            controller_account in account_id(),
        ) {
            new_test_ext().execute_with(|| {
                prop_assert_noop!(
                    Oracle::reclaim_stake(Origin::signed(controller_account)),
                    Error::<Test>::UnsetSigner
                );

                Ok(())
            })?;
        }

        #[test]
        fn cannot_reclaim_stake_when_no_declared_withdraws(
            controller_account in account_id(),
            controller_balance in MinStake::get()..Balance::MAX,
            signer_account in account_id(),
        ) {
            prop_assume!(controller_account != signer_account);

            new_test_ext().execute_with(|| {
                Balances::make_free_balance_be(&controller_account, controller_balance);
                prop_assert_ok!(Oracle::set_signer(Origin::signed(controller_account), signer_account));

                prop_assert_noop!(
                    Oracle::reclaim_stake(Origin::signed(controller_account)),
                    Error::<Test>::Unknown
                );

                Ok(())
            })?;
        }

        #[test]
        fn cannot_remove_stake_when_there_is_none(
            controller_account in account_id(),
            controller_balance in (MinStake::get()+1)..Balance::MAX, // +1 to keep alive
            signer_account in account_id(),
            start_block in 0..(BlockNumber::MAX / 2),
        ) {
            prop_assume!(controller_account != signer_account);

            new_test_ext().execute_with(|| {
                Balances::make_free_balance_be(&controller_account, controller_balance);
                prop_assert_ok!(Oracle::set_signer(Origin::signed(controller_account), signer_account));

                System::set_block_number(start_block);
                // Remove the stake from setting the signer
                prop_assert_ok!(Oracle::remove_stake(Origin::signed(controller_account)));
                let withdrawal = Withdraw { stake: MinStake::get(), unlock_block: start_block + StakeLock::get() };

                // Can't remove anymore because we did not stake anything else
                prop_assert_noop!(
                    Oracle::remove_stake(Origin::signed(controller_account)),
                    Error::<Test>::NoStake
                );

                Ok(())
            })?;
        }

        #[test]
        fn can_reclaim_stake_after_removing_stake(
            controller_account in account_id(),
            controller_balance in (MinStake::get()+1)..(Balance::MAX/4), // +1 to keep alive
            signer_account in account_id(),
            signer_balance in 0..(Balance::MAX/4),
            stake_to_add in 0..(Balance::MAX/4),
            start_block in 0..(BlockNumber::MAX / 4),
            wait_after_unlock in 0..(BlockNumber::MAX / 4),
        ) {
            prop_assume!(controller_account != signer_account);

            new_test_ext().execute_with(|| {
                Balances::make_free_balance_be(&controller_account, controller_balance);
                Balances::make_free_balance_be(&signer_account, signer_balance);
                prop_assert_ok!(Oracle::set_signer(Origin::signed(controller_account), signer_account));

                let actual_stake_to_add = stake_to_add.min(controller_balance - MinStake::get() - 1);

                prop_assert_ok!(Oracle::add_stake(Origin::signed(controller_account), actual_stake_to_add));

                // Assert that the stake is added
                prop_assert_eq!(
                    Oracle::oracle_stake(signer_account),
                    Some(actual_stake_to_add + MinStake::get())
                );

                // Remove the stake
                System::set_block_number(start_block);
                prop_assert_ok!(Oracle::remove_stake(Origin::signed(controller_account)));

                // Check if the withdrawal is correctly declared
                let withdrawal = Withdraw { stake: actual_stake_to_add + MinStake::get(), unlock_block: start_block + StakeLock::get() };
                prop_assert_eq!(Oracle::declared_withdraws(signer_account), Some(withdrawal.clone()));

                // ... and that the stake is removed
                prop_assert_eq!(Oracle::oracle_stake(signer_account), None);

                prop_assert_noop!(
                    Oracle::remove_stake(Origin::signed(controller_account)),
                    Error::<Test>::NoStake
                );

                // Check that stake cannot be claimed too early
                prop_assert_noop!(
                    Oracle::reclaim_stake(Origin::signed(controller_account)),
                    Error::<Test>::StakeLocked
                );

                System::set_block_number(withdrawal.unlock_block + wait_after_unlock);

                prop_assert_ok!(Oracle::reclaim_stake(Origin::signed(controller_account)));

                // Check if the controller's balance is correct
                prop_assert_eq!(Balances::free_balance(&controller_account), controller_balance);
                prop_assert_eq!(Balances::free_balance(&signer_account), signer_balance);

                // After reclaiming the stake, the controller <-> signer relationship is removed
                prop_assert_eq!(Oracle::controller_to_signer(controller_account), None);
                prop_assert_eq!(Oracle::signer_to_controller(signer_account), None);

                assert_noop!(Oracle::reclaim_stake(Origin::signed(controller_account)), Error::<Test>::UnsetSigner);
                assert_noop!(Oracle::reclaim_stake(Origin::signed(signer_account)), Error::<Test>::UnsetSigner);


                Ok(())
            })?;
        }
    }
}

#[test]
fn remove_and_reclaim_stake() {
	new_test_ext().execute_with(|| {
		let account_1 = get_account_1();
		let account_2 = get_root_account();
		let account_3 = get_account_3();

		assert_ok!(Oracle::set_signer(Origin::signed(account_1), account_2));

		assert_ok!(Oracle::add_stake(Origin::signed(account_1), 50));

		assert_noop!(Oracle::reclaim_stake(Origin::signed(account_1)), Error::<Test>::Unknown);

		assert_ok!(Oracle::remove_stake(Origin::signed(account_1)));
		let withdrawal = Withdraw { stake: 51, unlock_block: 1 };
		assert_eq!(Oracle::declared_withdraws(account_2), Some(withdrawal));
		assert_eq!(Oracle::oracle_stake(account_2), None);
		assert_noop!(Oracle::remove_stake(Origin::signed(account_1)), Error::<Test>::NoStake);

		assert_noop!(Oracle::reclaim_stake(Origin::signed(account_1)), Error::<Test>::StakeLocked);

		System::set_block_number(2);
		assert_ok!(Oracle::reclaim_stake(Origin::signed(account_1)));
		// everyone gets their funds back
		assert_eq!(Balances::free_balance(account_1), 100);
		assert_eq!(Balances::total_balance(&account_1), 100);
		assert_eq!(Balances::free_balance(account_2), 100);
		assert_eq!(Balances::total_balance(&account_2), 100);

		// signer controller pruned
		assert_eq!(Oracle::controller_to_signer(account_1), None);
		assert_eq!(Oracle::signer_to_controller(account_2), None);

		assert_noop!(Oracle::reclaim_stake(Origin::signed(account_3)), Error::<Test>::UnsetSigner);
	});
}

#[test]
fn add_price() {
	new_test_ext().execute_with(|| {
		let account_1 = get_account_1();
		let account_2 = get_root_account();
		let account_4 = get_account_4();
		let account_5 = get_account_5();

		assert_ok!(Oracle::add_asset_and_info(
			Origin::signed(account_2),
			0,
			Percent::from_percent(80),
			3,
			3,
			5,
			5,
			5
		));

		System::set_block_number(6);
		// fails no stake
		assert_noop!(
			Oracle::submit_price(Origin::signed(account_1), 100_u128, 0_u128),
			Error::<Test>::NotEnoughStake
		);

		assert_ok!(Oracle::set_signer(Origin::signed(account_2), account_1));
		assert_ok!(Oracle::set_signer(Origin::signed(account_1), account_2));
		assert_ok!(Oracle::set_signer(Origin::signed(account_5), account_4));
		assert_ok!(Oracle::set_signer(Origin::signed(account_4), account_5));

		assert_ok!(Oracle::add_stake(Origin::signed(account_1), 50));
		assert_ok!(Oracle::add_stake(Origin::signed(account_2), 50));
		assert_ok!(Oracle::add_stake(Origin::signed(account_4), 50));
		assert_ok!(Oracle::add_stake(Origin::signed(account_5), 50));

		assert_ok!(Oracle::submit_price(Origin::signed(account_1), 100_u128, 0_u128));
		assert_ok!(Oracle::submit_price(Origin::signed(account_2), 100_u128, 0_u128));
		assert_noop!(
			Oracle::submit_price(Origin::signed(account_2), 100_u128, 0_u128),
			Error::<Test>::AlreadySubmitted
		);
		assert_ok!(Oracle::submit_price(Origin::signed(account_4), 100_u128, 0_u128));

		assert_eq!(Oracle::answer_in_transit(account_1), Some(5));
		assert_eq!(Oracle::answer_in_transit(account_2), Some(5));
		assert_eq!(Oracle::answer_in_transit(account_4), Some(5));

		assert_noop!(
			Oracle::submit_price(Origin::signed(account_5), 100_u128, 0_u128),
			Error::<Test>::MaxPrices
		);

		let price = PrePrice { price: 100_u128, block: 6, who: account_1 };

		let price2 = PrePrice { price: 100_u128, block: 6, who: account_2 };

		let price4 = PrePrice { price: 100_u128, block: 6, who: account_4 };

		assert_eq!(Oracle::pre_prices(0), vec![price, price2, price4]);
		System::set_block_number(2);
		Oracle::on_initialize(2);

		// fails price not requested
		assert_noop!(
			Oracle::submit_price(Origin::signed(account_1), 100_u128, 0_u128),
			Error::<Test>::PriceNotRequested
		);

		// non existent asset_id
		assert_noop!(
			Oracle::submit_price(Origin::signed(account_1), 100_u128, 10_u128),
			Error::<Test>::PriceNotRequested
		);
	});
}

#[test]
fn medianize_price() {
	new_test_ext().execute_with(|| {
		let account_1 = get_account_1();
		// should not panic
		Oracle::get_median_price(&Oracle::pre_prices(0));
		for i in 0..3 {
			let price = i as u128 + 100_u128;
			add_price_storage(price, 0, account_1, 0);
		}
		let price = Oracle::get_median_price(&Oracle::pre_prices(0));
		assert_eq!(price, Some(101));
	});
}

#[test]
#[should_panic = "No `keystore` associated for the current context!"]
fn check_request() {
	new_test_ext().execute_with(|| {
		let account_2 = get_root_account();
		assert_ok!(Oracle::add_asset_and_info(
			Origin::signed(account_2),
			0,
			Percent::from_percent(80),
			3,
			5,
			5,
			5,
			5
		));
		System::set_block_number(6);
		Oracle::check_requests();
	});
}

#[test]
fn not_check_request() {
	new_test_ext().execute_with(|| {
		Oracle::check_requests();
	});
}

#[test]
fn is_requested() {
	new_test_ext().execute_with(|| {
		let account_2 = get_root_account();
		assert_ok!(Oracle::add_asset_and_info(
			Origin::signed(account_2),
			0,
			Percent::from_percent(80),
			3,
			5,
			5,
			5,
			5
		));
		System::set_block_number(6);
		assert!(Oracle::is_requested(&0));

		let price = Price { price: 0, block: 6 };
		Prices::<Test>::insert(0, price);

		assert!(!Oracle::is_requested(&0));

		System::set_block_number(11);
		assert!(!Oracle::is_requested(&0));
	});
}

#[test]
fn test_payout_slash() {
	new_test_ext().execute_with(|| {
		let account_1 = get_account_1();
		let account_2 = get_root_account();
		let account_3 = get_account_3();
		let account_4 = get_account_4();
		let account_5 = get_account_5();
		assert_ok!(Oracle::set_signer(Origin::signed(account_5), account_2));

		let one = PrePrice { price: 79, block: 0, who: account_1 };
		let two = PrePrice { price: 100, block: 0, who: account_2 };
		let three = PrePrice { price: 151, block: 0, who: account_3 };
		let four = PrePrice { price: 400, block: 0, who: account_4 };

		let five = PrePrice { price: 100, block: 0, who: account_5 };

		let asset_info = AssetInfo {
			threshold: Percent::from_percent(0),
			min_answers: 0,
			max_answers: 0,
			block_interval: 0,
			reward: 0,
			slash: 0,
		};
		// doesn't panic when percent not set
		Oracle::handle_payout(&vec![one, two, three, four, five], 100, 0, &asset_info);
		assert_eq!(Balances::free_balance(account_1), 100);

		assert_ok!(Oracle::add_asset_and_info(
			Origin::signed(account_2),
			0,
			Percent::from_percent(80),
			3,
			5,
			5,
			5,
			5
		));

		add_price_storage(79, 0, account_1, 0);
		add_price_storage(100, 0, account_2, 0);

		assert_eq!(Oracle::answer_in_transit(account_1), Some(5));
		assert_eq!(Oracle::answer_in_transit(account_2), Some(5));

		Oracle::handle_payout(
			&vec![one, two, three, four, five],
			100,
			0,
			&Oracle::asset_info(0).unwrap(),
		);

		assert_eq!(Oracle::answer_in_transit(account_1), Some(0));
		assert_eq!(Oracle::answer_in_transit(account_2), Some(0));
		// account 1 and 4 gets slashed 2 and 5 gets rewarded
		assert_eq!(Balances::free_balance(account_1), 95);
		// 5 gets 2's reward and its own
		assert_eq!(Balances::free_balance(account_5), 109);
		assert_eq!(Balances::free_balance(account_2), 100);

		assert_eq!(Balances::free_balance(account_3), 0);
		assert_eq!(Balances::free_balance(account_4), 95);

		assert_ok!(Oracle::add_asset_and_info(
			Origin::signed(account_2),
			0,
			Percent::from_percent(90),
			3,
			5,
			5,
			4,
			5
		));
		Oracle::handle_payout(
			&vec![one, two, three, four, five],
			100,
			0,
			&Oracle::asset_info(0).unwrap(),
		);

		// account 4 gets slashed 2 5 and 1 gets rewarded
		assert_eq!(Balances::free_balance(account_1), 90);
		// 5 gets 2's reward and its own
		assert_eq!(Balances::free_balance(account_5), 117);
		assert_eq!(Balances::free_balance(account_2), 100);

		assert_eq!(Balances::free_balance(account_3), 0);
		assert_eq!(Balances::free_balance(account_4), 90);
	});
}

#[test]
fn on_init() {
	new_test_ext().execute_with(|| {
		// no price fetch
		Oracle::on_initialize(1);
		let price = Price { price: 0, block: 0 };

		assert_eq!(Oracle::prices(0), price);

		// add and request oracle id
		let account_2 = get_root_account();
		assert_ok!(Oracle::add_asset_and_info(
			Origin::signed(account_2),
			0,
			Percent::from_percent(80),
			3,
			5,
			5,
			5,
			5
		));
		// set prices into storage
		let account_1 = get_account_1();
		for i in 0..3 {
			let price = i as u128 + 100_u128;
			add_price_storage(price, 0, account_1, 2);
		}

		Oracle::on_initialize(2);
		let price = Price { price: 101, block: 2 };

		assert_eq!(Oracle::prices(0), price);
		// prunes state
		assert_eq!(Oracle::pre_prices(0), vec![]);

		// doesn't prune state if under min prices
		for i in 0..2 {
			let price = i as u128 + 100_u128;
			add_price_storage(price, 0, account_1, 3);
		}

		// does not fire under min answers
		Oracle::on_initialize(3);
		assert_eq!(Oracle::pre_prices(0).len(), 2);
		assert_eq!(Oracle::prices(0), price);
	});
}

#[test]
fn historic_pricing() {
	new_test_ext().execute_with(|| {
		// add and request oracle id
		let account_2 = get_root_account();
		assert_ok!(Oracle::add_asset_and_info(
			Origin::signed(account_2),
			0,
			Percent::from_percent(80),
			3,
			5,
			5,
			5,
			5
		));

		let mut price_history = vec![];

		do_price_update(0, 0);

		assert_eq!(Oracle::price_history(0).len(), 0);
		assert_eq!(Oracle::price_history(0), price_history);

		do_price_update(0, 5);

		let price_5 = Price { price: 101, block: 5 };
		price_history = vec![price_5.clone()];

		assert_eq!(Oracle::price_history(0), price_history);
		assert_eq!(Oracle::price_history(0).len(), 1);

		do_price_update(0, 10);
		let price_10 = Price { price: 101, block: 10 };
		price_history = vec![price_5.clone(), price_10.clone()];

		assert_eq!(Oracle::price_history(0), price_history);
		assert_eq!(Oracle::price_history(0).len(), 2);

		do_price_update(0, 15);
		let price_15 = Price { price: 101, block: 15 };
		price_history = vec![price_5, price_10.clone(), price_15.clone()];

		assert_eq!(Oracle::price_history(0), price_history);
		assert_eq!(Oracle::price_history(0).len(), 3);

		do_price_update(0, 20);
		let price_20 = Price { price: 101, block: 20 };
		price_history = vec![price_10, price_15, price_20];

		assert_eq!(Oracle::price_history(0), price_history);
		assert_eq!(Oracle::price_history(0).len(), 3);
	});
}

#[test]
fn price_of_amount() {
	new_test_ext().execute_with(|| {
		let value = 100500;
		let id = 42;
		let amount = 10000;

		let price = Price { price: value, block: System::block_number() };
		Prices::<Test>::insert(id, price);
		let total_price =
			<Oracle as composable_traits::oracle::Oracle>::get_price(id, amount).unwrap();

		assert_eq!(total_price.price, value * amount)
	});
}
#[test]
fn ratio_human_case() {
	new_test_ext().execute_with(|| {
		let price = Price { price: 10000, block: System::block_number() };
		Prices::<Test>::insert(13, price);
		let price = Price { price: 100, block: System::block_number() };
		Prices::<Test>::insert(42, price);
		let mut pair = CurrencyPair::new(13, 42);

		let ratio = <Oracle as composable_traits::oracle::Oracle>::get_ratio(pair).unwrap();
		assert_eq!(ratio, FixedU128::saturating_from_integer(100));
		pair.reverse();
		let ratio = <Oracle as composable_traits::oracle::Oracle>::get_ratio(pair).unwrap();

		assert_eq!(ratio, FixedU128::saturating_from_rational(1_u32, 100_u32));
	})
}

#[test]
fn inverses() {
	new_test_ext().execute_with(|| {
		let price = Price { price: 1, block: System::block_number() };
		Prices::<Test>::insert(13, price);
		let inverse =
			<Oracle as composable_traits::oracle::Oracle>::get_price_inverse(13, 1).unwrap();
		assert_eq!(inverse, 1);

		let price = Price { price: 1, block: System::block_number() };
		Prices::<Test>::insert(13, price);
		let inverse =
			<Oracle as composable_traits::oracle::Oracle>::get_price_inverse(13, 2).unwrap();
		assert_eq!(inverse, 2);
	})
}

#[test]
fn ratio_base_is_way_less_smaller() {
	new_test_ext().execute_with(|| {
		let price = Price { price: 1, block: System::block_number() };
		Prices::<Test>::insert(13, price);
		let price = Price { price: 10_u128.pow(12), block: System::block_number() };
		Prices::<Test>::insert(42, price);
		let pair = CurrencyPair::new(13, 42);

		let ratio = <Oracle as composable_traits::oracle::Oracle>::get_ratio(pair).unwrap();

		assert_eq!(ratio, FixedU128::saturating_from_rational(1, 1000000000000_u64));
	})
}

#[test]
fn get_twap() {
	new_test_ext().execute_with(|| {
		// add and request oracle id
		let account_2 = get_root_account();
		assert_ok!(Oracle::add_asset_and_info(
			Origin::signed(account_2),
			0,
			Percent::from_percent(80),
			3,
			5,
			5,
			5,
			5
		));

		do_price_update(0, 0);
		let price_1 = Price { price: 100, block: 20 };
		let price_2 = Price { price: 100, block: 20 };
		let price_3 = Price { price: 120, block: 20 };
		let historic_prices = [price_1, price_2, price_3].to_vec();
		set_historic_prices(0, historic_prices);

		let twap = Oracle::get_twap(0, vec![20, 30, 50]);
		// twap should be (0.2 * 100) + (0.3 * 120) + (0.5 * 101)
		assert_eq!(twap, Ok(106));
		let err_twap = Oracle::get_twap(0, vec![21, 30, 50]);
		assert_eq!(err_twap, Err(Error::<Test>::MustSumTo100.into()));

		let err_2_twap = Oracle::get_twap(0, vec![10, 10, 10, 10, 60]);
		assert_eq!(err_2_twap, Err(Error::<Test>::DepthTooLarge.into()));
	});
}

#[test]
fn on_init_prune_scenerios() {
	new_test_ext().execute_with(|| {
		// add and request oracle id
		let account_2 = get_root_account();
		assert_ok!(Oracle::add_asset_and_info(
			Origin::signed(account_2),
			0,
			Percent::from_percent(80),
			3,
			5,
			5,
			5,
			5
		));
		// set prices into storage
		let account_1 = get_account_1();
		for i in 0..3 {
			let price = i as u128 + 100_u128;
			add_price_storage(price, 0, account_1, 0);
		}
		// all pruned
		Oracle::on_initialize(3);
		let price = Price { price: 0, block: 0 };
		assert_eq!(Oracle::prices(0), price);
		assert_eq!(Oracle::pre_prices(0).len(), 0);

		for i in 0..5 {
			let price = i as u128 + 1_u128;
			add_price_storage(price, 0, account_1, 0);
		}

		for i in 0..3 {
			let price = i as u128 + 100_u128;
			add_price_storage(price, 0, account_1, 3);
		}

		// more than half pruned
		Oracle::on_initialize(3);
		let price = Price { price: 101, block: 3 };
		assert_eq!(Oracle::prices(0), price);

		for i in 0..5 {
			let price = i as u128 + 1_u128;
			add_price_storage(price, 0, account_1, 0);
		}

		for i in 0..2 {
			let price = i as u128 + 300_u128;
			add_price_storage(price, 0, account_1, 3);
		}

		// more than half pruned not enough for a price call, same as previous
		Oracle::on_initialize(5);
		let price = Price { price: 101, block: 3 };
		assert_eq!(Oracle::pre_prices(0).len(), 2);
		assert_eq!(Oracle::prices(0), price);
	});
}

#[test]
fn on_init_over_max_answers() {
	new_test_ext().execute_with(|| {
		// add and request oracle id
		let account_2 = get_root_account();
		assert_ok!(Oracle::add_asset_and_info(
			Origin::signed(account_2),
			0,
			Percent::from_percent(80),
			1,
			2,
			5,
			5,
			5
		));
		// set prices into storage
		let account_1 = get_account_1();
		for i in 0..5 {
			let price = i as u128 + 100_u128;
			add_price_storage(price, 0, account_1, 0);
		}

		assert_eq!(Oracle::answer_in_transit(account_1), Some(25));

		// all pruned
		Oracle::on_initialize(0);
		// price prunes all but first 2 answers, median went from 102 to 100
		let price = Price { price: 100, block: 0 };
		assert_eq!(Oracle::prices(0), price);
		assert_eq!(Oracle::pre_prices(0).len(), 0);

		assert_eq!(Oracle::answer_in_transit(account_1), Some(0));
	});
}

#[test]
fn prune_old_pre_prices_edgecase() {
	new_test_ext().execute_with(|| {
		let asset_info = AssetInfo {
			threshold: Percent::from_percent(80),
			min_answers: 3,
			max_answers: 5,
			block_interval: 5,
			reward: 5,
			slash: 5,
		};
		Oracle::prune_old_pre_prices(&asset_info, vec![], 0);
	});
}

#[test]
fn should_make_http_call_and_parse_result() {
	let (mut t, _, _) = offchain_worker_env(|state| price_oracle_response(state, "0"));

	t.execute_with(|| {
		// when
		let price = Oracle::fetch_price(&0).unwrap();
		// then
		assert_eq!(price, 15523);
	});
}

#[test]
fn knows_how_to_mock_several_http_calls() {
	let (mut t, _, _) = offchain_worker_env(|state| {
		state.expect_request(testing::PendingRequest {
			method: "GET".into(),
			uri: "http://localhost:3001/price/0".into(),
			response: Some(br#"{"0": 100}"#.to_vec()),
			sent: true,
			..Default::default()
		});

		state.expect_request(testing::PendingRequest {
			method: "GET".into(),
			uri: "http://localhost:3001/price/0".into(),
			response: Some(br#"{"0": 200}"#.to_vec()),
			sent: true,
			..Default::default()
		});

		state.expect_request(testing::PendingRequest {
			method: "GET".into(),
			uri: "http://localhost:3001/price/0".into(),
			response: Some(br#"{"0": 300}"#.to_vec()),
			sent: true,
			..Default::default()
		});
	});

	t.execute_with(|| {
		let price1 = Oracle::fetch_price(&0).unwrap();
		let price2 = Oracle::fetch_price(&0).unwrap();
		let price3 = Oracle::fetch_price(&0).unwrap();

		assert_eq!(price1, 100);
		assert_eq!(price2, 200);
		assert_eq!(price3, 300);
	})
}

#[test]
fn should_submit_signed_transaction_on_chain() {
	let (mut t, _, pool_state) = offchain_worker_env(|state| price_oracle_response(state, "0"));

	t.execute_with(|| {
		let account_2 = get_root_account();
		assert_ok!(Oracle::add_asset_and_info(
			Origin::signed(account_2),
			0,
			Percent::from_percent(80),
			3,
			3,
			5,
			5,
			5
		));

		// when
		Oracle::fetch_price_and_send_signed(&0, Oracle::asset_info(0).unwrap()).unwrap();
		// then
		let tx = pool_state.write().transactions.pop().unwrap();
		assert!(pool_state.read().transactions.is_empty());
		let tx = Extrinsic::decode(&mut &*tx).unwrap();
		assert_eq!(tx.signature.unwrap().0, 0);
		assert_eq!(tx.call, Call::Oracle(crate::Call::submit_price { price: 15523, asset_id: 0 }));
	});
}

#[test]
#[should_panic = "Tx already submitted"]
fn should_check_oracles_submitted_price() {
	let (mut t, oracle_account_id, _) = offchain_worker_env(|state| price_oracle_response(state, "0"));

	t.execute_with(|| {
		let account_2 = get_root_account();

		assert_ok!(Oracle::add_asset_and_info(
			Origin::signed(account_2),
			0,
			Percent::from_percent(80),
			3,
			3,
			5,
			5,
			5
		));

		add_price_storage(100_u128, 0, oracle_account_id, 0);
		// when
		Oracle::fetch_price_and_send_signed(&0, Oracle::asset_info(0).unwrap()).unwrap();
	});
}

#[test]
#[should_panic = "Max answers reached"]
fn should_check_oracles_max_answer() {
	let (mut t, _, _) = offchain_worker_env(|state| price_oracle_response(state, "0"));
	let asset_info = AssetInfo {
		threshold: Percent::from_percent(0),
		min_answers: 0,
		max_answers: 0,
		block_interval: 0,
		reward: 0,
		slash: 0,
	};
	t.execute_with(|| {
		Oracle::fetch_price_and_send_signed(&0, asset_info).unwrap();
	});
}

#[test]
fn parse_price_works() {
	let test_data = vec![
		("{\"1\":6536.92}", Some(6536)),
		("{\"1\":650000000}", Some(650000000)),
		("{\"2\":6536}", None),
		("{\"0\":\"6432\"}", None),
	];

	for (json, expected) in test_data {
		assert_eq!(expected, Oracle::parse_price(json, "1"));
	}
}

fn add_price_storage(price: u128, asset_id: u128, who: AccountId, block: u64) {
	let price = PrePrice { price, block, who };
	PrePrices::<Test>::mutate(asset_id, |current_prices| current_prices.try_push(price).unwrap());
	AnswerInTransit::<Test>::mutate(who, |transit| {
		*transit = Some(transit.unwrap_or_else(Zero::zero) + 5)
	});
}

fn do_price_update(asset_id: u128, block: u64) {
	let account_1 = get_account_1();
	for i in 0..3 {
		let price = i as u128 + 100_u128;
		add_price_storage(price, asset_id, account_1, block);
	}

	System::set_block_number(block);
	Oracle::on_initialize(block);
	let price = Price { price: 101, block };
	assert_eq!(Oracle::prices(asset_id), price);
}

fn set_historic_prices(asset_id: u128, historic_prices: Vec<Price<u128, u64>>) {
	PriceHistory::<Test>::insert(asset_id, BoundedVec::try_from(historic_prices).unwrap());
}

fn price_oracle_response(state: &mut testing::OffchainState, price_id: &str) {
	let base: String = "http://localhost:3001/price/".to_owned();
	let url = base + price_id;

	state.expect_request(testing::PendingRequest {
		method: "GET".into(),
		uri: url,
		response: Some(br#"{"0": 15523}"#.to_vec()),
		sent: true,
		..Default::default()
	});
}

fn offchain_worker_env(
	state_updater: fn(&mut testing::OffchainState),
) -> (TestExternalities, AccountId, Arc<RwLock<testing::PoolState>>) {
	const PHRASE: &str =
		"news slush supreme milk chapter athlete soap sausage put clutch what kitten";

	let (offchain, offchain_state) = testing::TestOffchainExt::new();
	let (pool, pool_state) = testing::TestTransactionPoolExt::new();
	let keystore = KeyStore::new();
	let account_id = SyncCryptoStore::sr25519_generate_new(
		&keystore,
		crate::crypto::Public::ID,
		Some(&format!("{}/hunter1", PHRASE)),
	)
	.unwrap();

	let mut t = sp_io::TestExternalities::default();
	t.register_extension(OffchainDbExt::new(offchain.clone()));
	t.register_extension(OffchainWorkerExt::new(offchain));
	t.register_extension(TransactionPoolExt::new(pool));
	t.register_extension(KeystoreExt(Arc::new(keystore)));

	state_updater(&mut offchain_state.write());

	(t, account_id, pool_state)
}
