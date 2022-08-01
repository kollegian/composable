
//! Autogenerated weights for `mosaic`
//!
//! THIS FILE WAS AUTO-GENERATED USING THE SUBSTRATE BENCHMARK CLI VERSION 4.0.0-dev
//! DATE: 2022-07-28, STEPS: `50`, REPEAT: 20, LOW RANGE: `[]`, HIGH RANGE: `[]`
//! EXECUTION: Some(Wasm), WASM-EXECUTION: Compiled, CHAIN: Some("dali-dev"), DB CACHE: 1024

// Executed Command:
// ./target/release/composable
// benchmark
// pallet
// --chain=dali-dev
// --execution=wasm
// --wasm-execution=compiled
// --wasm-instantiation-strategy=legacy-instance-reuse
// --pallet=*
// --extrinsic=*
// --steps=50
// --repeat=20
// --output=runtime/dali/src/weights
// --log
// error

#![cfg_attr(rustfmt, rustfmt_skip)]
#![allow(unused_parens)]
#![allow(unused_imports)]

use frame_support::{traits::Get, weights::Weight};
use sp_std::marker::PhantomData;

/// Weight functions for `mosaic`.
pub struct WeightInfo<T>(PhantomData<T>);
impl<T: frame_system::Config> mosaic::WeightInfo for WeightInfo<T> {
	// Storage: Mosaic Relayer (r:0 w:1)
	fn set_relayer() -> Weight {
		(28_069_000 as Weight)
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
	}
	// Storage: Mosaic Relayer (r:1 w:1)
	fn rotate_relayer() -> Weight {
		(34_487_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(1 as Weight))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
	}
	// Storage: Mosaic Relayer (r:1 w:0)
	// Storage: Mosaic NetworkInfos (r:0 w:1)
	fn set_network() -> Weight {
		(60_924_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(1 as Weight))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
	}
	// Storage: Mosaic AssetsInfo (r:1 w:1)
	fn set_budget() -> Weight {
		(33_311_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(1 as Weight))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
	}
	// Storage: Mosaic AssetsInfo (r:1 w:0)
	// Storage: Mosaic LocalToRemoteAsset (r:1 w:0)
	// Storage: Mosaic NetworkInfos (r:1 w:0)
	// Storage: System Account (r:2 w:2)
	// Storage: Mosaic TimeLockPeriod (r:1 w:0)
	// Storage: Mosaic OutgoingTransactions (r:1 w:1)
	// Storage: Mosaic Nonce (r:1 w:1)
	fn transfer_to() -> Weight {
		(131_336_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(8 as Weight))
			.saturating_add(T::DbWeight::get().writes(4 as Weight))
	}
	// Storage: Mosaic Relayer (r:1 w:0)
	// Storage: Mosaic RemoteToLocalAsset (r:1 w:0)
	// Storage: Mosaic OutgoingTransactions (r:1 w:1)
	// Storage: System Account (r:1 w:1)
	fn accept_transfer() -> Weight {
		(90_690_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(4 as Weight))
			.saturating_add(T::DbWeight::get().writes(2 as Weight))
	}
	// Storage: Mosaic OutgoingTransactions (r:1 w:1)
	// Storage: System Account (r:2 w:2)
	fn claim_stale_to() -> Weight {
		(100_677_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(3 as Weight))
			.saturating_add(T::DbWeight::get().writes(3 as Weight))
	}
	// Storage: Mosaic Relayer (r:1 w:0)
	// Storage: Mosaic RemoteToLocalAsset (r:1 w:0)
	// Storage: Mosaic AssetsInfo (r:1 w:1)
	// Storage: System Account (r:1 w:1)
	// Storage: Mosaic IncomingTransactions (r:1 w:1)
	fn timelocked_mint() -> Weight {
		(109_209_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(5 as Weight))
			.saturating_add(T::DbWeight::get().writes(3 as Weight))
	}
	// Storage: Mosaic TimeLockPeriod (r:0 w:1)
	fn set_timelock_duration() -> Weight {
		(8_249_000 as Weight)
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
	}
	// Storage: Mosaic Relayer (r:1 w:0)
	// Storage: Mosaic RemoteToLocalAsset (r:1 w:0)
	// Storage: Mosaic IncomingTransactions (r:1 w:1)
	// Storage: System Account (r:1 w:1)
	fn rescind_timelocked_mint() -> Weight {
		(90_097_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(4 as Weight))
			.saturating_add(T::DbWeight::get().writes(2 as Weight))
	}
	// Storage: Mosaic IncomingTransactions (r:1 w:1)
	// Storage: System Account (r:2 w:2)
	fn claim_to() -> Weight {
		(101_340_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(3 as Weight))
			.saturating_add(T::DbWeight::get().writes(3 as Weight))
	}
	// Storage: Mosaic NetworkInfos (r:1 w:0)
	// Storage: Mosaic LocalToRemoteAsset (r:1 w:1)
	// Storage: Mosaic RemoteToLocalAsset (r:0 w:1)
	fn update_asset_mapping() -> Weight {
		(45_447_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(2 as Weight))
			.saturating_add(T::DbWeight::get().writes(2 as Weight))
	}
	// Storage: Mosaic RemoteAmmWhitelist (r:1 w:1)
	fn add_remote_amm_id() -> Weight {
		(15_158_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(1 as Weight))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
	}
	// Storage: Mosaic RemoteAmmWhitelist (r:1 w:1)
	fn remove_remote_amm_id() -> Weight {
		(16_002_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(1 as Weight))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
	}
}
