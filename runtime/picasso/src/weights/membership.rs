
//! Autogenerated weights for `membership`
//!
//! THIS FILE WAS AUTO-GENERATED USING THE SUBSTRATE BENCHMARK CLI VERSION 4.0.0-dev
//! DATE: 2022-01-19, STEPS: `50`, REPEAT: 20, LOW RANGE: `[]`, HIGH RANGE: `[]`
//! EXECUTION: Some(Wasm), WASM-EXECUTION: Compiled, CHAIN: Some("picasso-dev"), DB CACHE: 128

// Executed Command:
// ./target/release/composable
// benchmark
// --chain=picasso-dev
// --execution=wasm
// --wasm-execution=compiled
// --pallet=membership
// --extrinsic=*
// --steps=50
// --repeat=20
// --raw
// --output=runtime/picasso/src/weights

#![cfg_attr(rustfmt, rustfmt_skip)]
#![allow(unused_parens)]
#![allow(unused_imports)]

use frame_support::{traits::Get, weights::Weight};
use sp_std::marker::PhantomData;

/// Weight functions for `membership`.
pub struct WeightInfo<T>(PhantomData<T>);
impl<T: frame_system::Config> membership::WeightInfo for WeightInfo<T> {
	// Storage: CouncilMembership Members (r:1 w:1)
	// Storage: Council Proposals (r:1 w:0)
	// Storage: Council Members (r:0 w:1)
	// Storage: Council Prime (r:0 w:1)
	fn add_member(m: u32, ) -> Weight {
		(23_947_000 as Weight)
			// Standard Error: 2_000
			.saturating_add((115_000 as Weight).saturating_mul(m as Weight))
			.saturating_add(T::DbWeight::get().reads(2 as Weight))
			.saturating_add(T::DbWeight::get().writes(3 as Weight))
	}
	// Storage: CouncilMembership Members (r:1 w:1)
	// Storage: Council Proposals (r:1 w:0)
	// Storage: CouncilMembership Prime (r:1 w:0)
	// Storage: Council Members (r:0 w:1)
	// Storage: Council Prime (r:0 w:1)
	fn remove_member(m: u32, ) -> Weight {
		(28_875_000 as Weight)
			// Standard Error: 0
			.saturating_add((105_000 as Weight).saturating_mul(m as Weight))
			.saturating_add(T::DbWeight::get().reads(3 as Weight))
			.saturating_add(T::DbWeight::get().writes(3 as Weight))
	}
	// Storage: CouncilMembership Members (r:1 w:1)
	// Storage: Council Proposals (r:1 w:0)
	// Storage: CouncilMembership Prime (r:1 w:0)
	// Storage: Council Members (r:0 w:1)
	// Storage: Council Prime (r:0 w:1)
	fn swap_member(m: u32, ) -> Weight {
		(29_055_000 as Weight)
			// Standard Error: 1_000
			.saturating_add((119_000 as Weight).saturating_mul(m as Weight))
			.saturating_add(T::DbWeight::get().reads(3 as Weight))
			.saturating_add(T::DbWeight::get().writes(3 as Weight))
	}
	// Storage: CouncilMembership Members (r:1 w:1)
	// Storage: Council Proposals (r:1 w:0)
	// Storage: CouncilMembership Prime (r:1 w:0)
	// Storage: Council Members (r:0 w:1)
	// Storage: Council Prime (r:0 w:1)
	fn reset_member(m: u32, ) -> Weight {
		(29_788_000 as Weight)
			// Standard Error: 0
			.saturating_add((244_000 as Weight).saturating_mul(m as Weight))
			.saturating_add(T::DbWeight::get().reads(3 as Weight))
			.saturating_add(T::DbWeight::get().writes(3 as Weight))
	}
	// Storage: CouncilMembership Members (r:1 w:1)
	// Storage: Council Proposals (r:1 w:0)
	// Storage: CouncilMembership Prime (r:1 w:1)
	// Storage: Council Members (r:0 w:1)
	// Storage: Council Prime (r:0 w:1)
	fn change_key(m: u32, ) -> Weight {
		(30_605_000 as Weight)
			// Standard Error: 0
			.saturating_add((112_000 as Weight).saturating_mul(m as Weight))
			.saturating_add(T::DbWeight::get().reads(3 as Weight))
			.saturating_add(T::DbWeight::get().writes(4 as Weight))
	}
	// Storage: CouncilMembership Members (r:1 w:0)
	// Storage: CouncilMembership Prime (r:0 w:1)
	// Storage: Council Prime (r:0 w:1)
	fn set_prime(m: u32, ) -> Weight {
		(7_883_000 as Weight)
			// Standard Error: 0
			.saturating_add((84_000 as Weight).saturating_mul(m as Weight))
			.saturating_add(T::DbWeight::get().reads(1 as Weight))
			.saturating_add(T::DbWeight::get().writes(2 as Weight))
	}
	// Storage: CouncilMembership Prime (r:0 w:1)
	// Storage: Council Prime (r:0 w:1)
	fn clear_prime(m: u32, ) -> Weight {
		(3_272_000 as Weight)
			// Standard Error: 0
			.saturating_add((2_000 as Weight).saturating_mul(m as Weight))
			.saturating_add(T::DbWeight::get().writes(2 as Weight))
	}
}
