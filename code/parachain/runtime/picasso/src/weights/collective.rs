
//! Autogenerated weights for `collective`
//!
//! THIS FILE WAS AUTO-GENERATED USING THE SUBSTRATE BENCHMARK CLI VERSION 4.0.0-dev
//! DATE: 2023-02-08, STEPS: `50`, REPEAT: 10, LOW RANGE: `[]`, HIGH RANGE: `[]`
//! HOSTNAME: `5a3b4d6e5166`, CPU: `Intel(R) Xeon(R) CPU @ 3.10GHz`
//! EXECUTION: Some(Wasm), WASM-EXECUTION: Compiled, CHAIN: Some("picasso-dev"), DB CACHE: 1024

// Executed Command:
// /nix/store/9gdd70pyc12n9i1v6gx99rhz8q2n67z0-composable/bin/composable
// benchmark
// pallet
// --chain=picasso-dev
// --execution=wasm
// --wasm-execution=compiled
// --pallet=*
// --extrinsic=*
// --steps=50
// --repeat=10
// --output=code/parachain/runtime/picasso/src/weights

#![cfg_attr(rustfmt, rustfmt_skip)]
#![allow(unused_parens)]
#![allow(unused_imports)]

use frame_support::{traits::Get, weights::Weight};
use sp_std::marker::PhantomData;

/// Weight functions for `collective`.
pub struct WeightInfo<T>(PhantomData<T>);
impl<T: frame_system::Config> collective::WeightInfo for WeightInfo<T> {
	// Storage: Council Members (r:1 w:1)
	// Storage: Council Proposals (r:1 w:0)
	// Storage: Council Prime (r:0 w:1)
	// Storage: Council Voting (r:100 w:100)
	/// The range of component `m` is `[0, 100]`.
	/// The range of component `n` is `[0, 100]`.
	/// The range of component `p` is `[0, 100]`.
	fn set_members(m: u32, _n: u32, p: u32, ) -> Weight {
		// Minimum execution time: 32_926 nanoseconds.
		Weight::from_ref_time(33_363_000 as u64)
			// Standard Error: 130_615
			.saturating_add(Weight::from_ref_time(8_102_589 as u64).saturating_mul(m as u64))
			// Standard Error: 130_615
			.saturating_add(Weight::from_ref_time(12_141_522 as u64).saturating_mul(p as u64))
			.saturating_add(T::DbWeight::get().reads(2 as u64))
			.saturating_add(T::DbWeight::get().reads((1 as u64).saturating_mul(p as u64)))
			.saturating_add(T::DbWeight::get().writes(2 as u64))
			.saturating_add(T::DbWeight::get().writes((1 as u64).saturating_mul(p as u64)))
	}
	// Storage: Council Members (r:1 w:0)
	// Storage: CallFilter DisabledCalls (r:1 w:0)
	/// The range of component `b` is `[1, 1024]`.
	/// The range of component `m` is `[1, 100]`.
	fn execute(b: u32, m: u32, ) -> Weight {
		// Minimum execution time: 44_231 nanoseconds.
		Weight::from_ref_time(44_276_776 as u64)
			// Standard Error: 276
			.saturating_add(Weight::from_ref_time(1_687 as u64).saturating_mul(b as u64))
			// Standard Error: 2_848
			.saturating_add(Weight::from_ref_time(47_412 as u64).saturating_mul(m as u64))
			.saturating_add(T::DbWeight::get().reads(2 as u64))
	}
	// Storage: Council Members (r:1 w:0)
	// Storage: Council ProposalOf (r:1 w:0)
	// Storage: CallFilter DisabledCalls (r:1 w:0)
	/// The range of component `b` is `[1, 1024]`.
	/// The range of component `m` is `[1, 100]`.
	fn propose_execute(b: u32, m: u32, ) -> Weight {
		// Minimum execution time: 47_729 nanoseconds.
		Weight::from_ref_time(46_365_631 as u64)
			// Standard Error: 253
			.saturating_add(Weight::from_ref_time(2_242 as u64).saturating_mul(b as u64))
			// Standard Error: 2_613
			.saturating_add(Weight::from_ref_time(94_756 as u64).saturating_mul(m as u64))
			.saturating_add(T::DbWeight::get().reads(3 as u64))
	}
	// Storage: Council Members (r:1 w:0)
	// Storage: Council ProposalOf (r:1 w:1)
	// Storage: Council Proposals (r:1 w:1)
	// Storage: Council ProposalCount (r:1 w:1)
	// Storage: Council Voting (r:0 w:1)
	/// The range of component `b` is `[1, 1024]`.
	/// The range of component `m` is `[2, 100]`.
	/// The range of component `p` is `[1, 100]`.
	fn propose_proposed(b: u32, m: u32, p: u32, ) -> Weight {
		// Minimum execution time: 55_750 nanoseconds.
		Weight::from_ref_time(51_793_554 as u64)
			// Standard Error: 468
			.saturating_add(Weight::from_ref_time(8_536 as u64).saturating_mul(b as u64))
			// Standard Error: 4_894
			.saturating_add(Weight::from_ref_time(57_919 as u64).saturating_mul(m as u64))
			// Standard Error: 4_832
			.saturating_add(Weight::from_ref_time(501_111 as u64).saturating_mul(p as u64))
			.saturating_add(T::DbWeight::get().reads(4 as u64))
			.saturating_add(T::DbWeight::get().writes(4 as u64))
	}
	// Storage: Council Members (r:1 w:0)
	// Storage: Council Voting (r:1 w:1)
	/// The range of component `m` is `[5, 100]`.
	fn vote(m: u32, ) -> Weight {
		// Minimum execution time: 64_220 nanoseconds.
		Weight::from_ref_time(68_849_407 as u64)
			// Standard Error: 6_533
			.saturating_add(Weight::from_ref_time(144_042 as u64).saturating_mul(m as u64))
			.saturating_add(T::DbWeight::get().reads(2 as u64))
			.saturating_add(T::DbWeight::get().writes(1 as u64))
	}
	// Storage: Council Voting (r:1 w:1)
	// Storage: Council Members (r:1 w:0)
	// Storage: Council Proposals (r:1 w:1)
	// Storage: Council ProposalOf (r:0 w:1)
	/// The range of component `m` is `[4, 100]`.
	/// The range of component `p` is `[1, 100]`.
	fn close_early_disapproved(m: u32, p: u32, ) -> Weight {
		// Minimum execution time: 62_698 nanoseconds.
		Weight::from_ref_time(61_754_811 as u64)
			// Standard Error: 5_249
			.saturating_add(Weight::from_ref_time(82_737 as u64).saturating_mul(m as u64))
			// Standard Error: 5_119
			.saturating_add(Weight::from_ref_time(445_194 as u64).saturating_mul(p as u64))
			.saturating_add(T::DbWeight::get().reads(3 as u64))
			.saturating_add(T::DbWeight::get().writes(3 as u64))
	}
	// Storage: Council Voting (r:1 w:1)
	// Storage: Council Members (r:1 w:0)
	// Storage: Council ProposalOf (r:1 w:1)
	// Storage: CallFilter DisabledCalls (r:1 w:0)
	// Storage: Council Proposals (r:1 w:1)
	/// The range of component `b` is `[1, 1024]`.
	/// The range of component `m` is `[4, 100]`.
	/// The range of component `p` is `[1, 100]`.
	fn close_early_approved(b: u32, m: u32, p: u32, ) -> Weight {
		// Minimum execution time: 89_349 nanoseconds.
		Weight::from_ref_time(86_416_084 as u64)
			// Standard Error: 599
			.saturating_add(Weight::from_ref_time(4_427 as u64).saturating_mul(b as u64))
			// Standard Error: 6_339
			.saturating_add(Weight::from_ref_time(110_954 as u64).saturating_mul(m as u64))
			// Standard Error: 6_179
			.saturating_add(Weight::from_ref_time(456_449 as u64).saturating_mul(p as u64))
			.saturating_add(T::DbWeight::get().reads(5 as u64))
			.saturating_add(T::DbWeight::get().writes(3 as u64))
	}
	// Storage: Council Voting (r:1 w:1)
	// Storage: Council Members (r:1 w:0)
	// Storage: Council Prime (r:1 w:0)
	// Storage: Council Proposals (r:1 w:1)
	// Storage: Council ProposalOf (r:0 w:1)
	/// The range of component `m` is `[4, 100]`.
	/// The range of component `p` is `[1, 100]`.
	fn close_disapproved(m: u32, p: u32, ) -> Weight {
		// Minimum execution time: 66_604 nanoseconds.
		Weight::from_ref_time(63_999_565 as u64)
			// Standard Error: 5_036
			.saturating_add(Weight::from_ref_time(97_193 as u64).saturating_mul(m as u64))
			// Standard Error: 4_911
			.saturating_add(Weight::from_ref_time(453_215 as u64).saturating_mul(p as u64))
			.saturating_add(T::DbWeight::get().reads(4 as u64))
			.saturating_add(T::DbWeight::get().writes(3 as u64))
	}
	// Storage: Council Voting (r:1 w:1)
	// Storage: Council Members (r:1 w:0)
	// Storage: Council Prime (r:1 w:0)
	// Storage: Council ProposalOf (r:1 w:1)
	// Storage: CallFilter DisabledCalls (r:1 w:0)
	// Storage: Council Proposals (r:1 w:1)
	/// The range of component `b` is `[1, 1024]`.
	/// The range of component `m` is `[4, 100]`.
	/// The range of component `p` is `[1, 100]`.
	fn close_approved(b: u32, m: u32, p: u32, ) -> Weight {
		// Minimum execution time: 93_645 nanoseconds.
		Weight::from_ref_time(86_820_776 as u64)
			// Standard Error: 522
			.saturating_add(Weight::from_ref_time(5_724 as u64).saturating_mul(b as u64))
			// Standard Error: 5_531
			.saturating_add(Weight::from_ref_time(117_160 as u64).saturating_mul(m as u64))
			// Standard Error: 5_391
			.saturating_add(Weight::from_ref_time(474_953 as u64).saturating_mul(p as u64))
			.saturating_add(T::DbWeight::get().reads(6 as u64))
			.saturating_add(T::DbWeight::get().writes(3 as u64))
	}
	// Storage: Council Proposals (r:1 w:1)
	// Storage: Council Voting (r:0 w:1)
	// Storage: Council ProposalOf (r:0 w:1)
	/// The range of component `p` is `[1, 100]`.
	fn disapprove_proposal(p: u32, ) -> Weight {
		// Minimum execution time: 37_286 nanoseconds.
		Weight::from_ref_time(42_378_905 as u64)
			// Standard Error: 4_975
			.saturating_add(Weight::from_ref_time(468_810 as u64).saturating_mul(p as u64))
			.saturating_add(T::DbWeight::get().reads(1 as u64))
			.saturating_add(T::DbWeight::get().writes(3 as u64))
	}
}
