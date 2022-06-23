
//! Autogenerated weights for `pallet_ibc`
//!
//! THIS FILE WAS AUTO-GENERATED USING THE SUBSTRATE BENCHMARK CLI VERSION 4.0.0-dev
//! DATE: 2022-06-20, STEPS: `50`, REPEAT: 20, LOW RANGE: `[]`, HIGH RANGE: `[]`
//! EXECUTION: Some(Wasm), WASM-EXECUTION: Compiled, CHAIN: Some("dali-dev"), DB CACHE: 1024

// Executed Command:
// ./target/release/composable
// benchmark
// pallet
// --chain
// dali-dev
// --execution
// wasm
// --wasm-execution
// compiled
// --pallet
// pallet-ibc
// --extrinsic
// *
// --steps
// 50
// --repeat
// 20
// --output
// ./runtime/dali/src/weights/pallet_ibc.rs

#![cfg_attr(rustfmt, rustfmt_skip)]
#![allow(unused_parens)]
#![allow(unused_imports)]

use frame_support::{traits::Get, weights::Weight};
use sp_std::marker::PhantomData;

/// Weight functions for `pallet_ibc`.
pub struct WeightInfo<T>(PhantomData<T>);
impl<T: frame_system::Config> pallet_ibc::WeightInfo for WeightInfo<T> {
	// Storage: unknown [0x3a7472616e73616374696f6e5f6c6576656c3a] (r:1 w:1)
	// Storage: Ibc Clients (r:1 w:0)
	// Storage: Ibc ClientStates (r:1 w:1)
	// Storage: Ibc ConsensusStates (r:3 w:1)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: ParachainInfo ParachainId (r:1 w:0)
	// Storage: Ibc ClientUpdateTime (r:0 w:1)
	// Storage: Ibc ClientUpdateHeight (r:0 w:1)
	fn update_tendermint_client() -> Weight {
		(241_000_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(8 as Weight))
			.saturating_add(T::DbWeight::get().writes(5 as Weight))
	}
	// Storage: unknown [0x3a7472616e73616374696f6e5f6c6576656c3a] (r:1 w:1)
	// Storage: Ibc ClientStates (r:1 w:0)
	// Storage: Ibc CounterForConnections (r:1 w:1)
	// Storage: ParachainInfo ParachainId (r:1 w:0)
	// Storage: Ibc Connections (r:1 w:1)
	// Storage: Ibc ConnectionClient (r:1 w:1)
	fn connection_open_init() -> Weight {
		(42_000_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(6 as Weight))
			.saturating_add(T::DbWeight::get().writes(4 as Weight))
	}
	// Storage: unknown [0x3a7472616e73616374696f6e5f6c6576656c3a] (r:1 w:1)
	// Storage: ParachainInfo ParachainId (r:1 w:0)
	// Storage: System BlockHash (r:2 w:0)
	// Storage: Ibc Connections (r:1 w:1)
	// Storage: Ibc ClientStates (r:1 w:0)
	// Storage: Ibc ConsensusStates (r:1 w:0)
	// Storage: Ibc HostConsensusStates (r:1 w:0)
	fn conn_try_open_tendermint() -> Weight {
		(196_000_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(8 as Weight))
			.saturating_add(T::DbWeight::get().writes(2 as Weight))
	}
	// Storage: unknown [0x3a7472616e73616374696f6e5f6c6576656c3a] (r:1 w:1)
	// Storage: ParachainInfo ParachainId (r:1 w:0)
	// Storage: System BlockHash (r:2 w:0)
	// Storage: Ibc Connections (r:1 w:1)
	// Storage: Ibc ClientStates (r:1 w:0)
	// Storage: Ibc ConsensusStates (r:1 w:0)
	// Storage: Ibc HostConsensusStates (r:1 w:0)
	fn conn_open_ack_tendermint() -> Weight {
		(189_000_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(8 as Weight))
			.saturating_add(T::DbWeight::get().writes(2 as Weight))
	}
	// Storage: unknown [0x3a7472616e73616374696f6e5f6c6576656c3a] (r:1 w:1)
	// Storage: Ibc Connections (r:1 w:1)
	// Storage: Ibc ClientStates (r:1 w:0)
	// Storage: Ibc ConsensusStates (r:1 w:0)
	// Storage: ParachainInfo ParachainId (r:1 w:0)
	fn conn_open_confirm_tendermint() -> Weight {
		(86_000_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(5 as Weight))
			.saturating_add(T::DbWeight::get().writes(2 as Weight))
	}
	// Storage: unknown [0x3a7472616e73616374696f6e5f6c6576656c3a] (r:1 w:1)
	// Storage: Ibc Connections (r:1 w:0)
	// Storage: Ibc ChannelCounter (r:1 w:1)
	// Storage: ParachainInfo ParachainId (r:1 w:0)
	// Storage: Ibc ChannelsConnection (r:1 w:1)
	// Storage: Ibc NextSequenceAck (r:0 w:1)
	// Storage: Ibc NextSequenceSend (r:0 w:1)
	// Storage: Ibc Channels (r:0 w:1)
	// Storage: Ibc NextSequenceRecv (r:0 w:1)
	fn channel_open_init() -> Weight {
		(44_000_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(5 as Weight))
			.saturating_add(T::DbWeight::get().writes(7 as Weight))
	}
	// Storage: unknown [0x3a7472616e73616374696f6e5f6c6576656c3a] (r:1 w:1)
	// Storage: Ibc Channels (r:1 w:1)
	// Storage: Ibc Connections (r:1 w:0)
	// Storage: Ibc ClientStates (r:1 w:0)
	// Storage: Ibc ConsensusStates (r:1 w:0)
	// Storage: ParachainInfo ParachainId (r:1 w:0)
	fn channel_open_try_tendermint() -> Weight {
		(93_000_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(6 as Weight))
			.saturating_add(T::DbWeight::get().writes(2 as Weight))
	}
	// Storage: unknown [0x3a7472616e73616374696f6e5f6c6576656c3a] (r:1 w:1)
	// Storage: Ibc Channels (r:1 w:1)
	// Storage: Ibc Connections (r:1 w:0)
	// Storage: Ibc ClientStates (r:1 w:0)
	// Storage: Ibc ConsensusStates (r:1 w:0)
	// Storage: ParachainInfo ParachainId (r:1 w:0)
	fn channel_open_ack_tendermint() -> Weight {
		(90_000_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(6 as Weight))
			.saturating_add(T::DbWeight::get().writes(2 as Weight))
	}
	// Storage: unknown [0x3a7472616e73616374696f6e5f6c6576656c3a] (r:1 w:1)
	// Storage: Ibc Channels (r:1 w:1)
	// Storage: Ibc Connections (r:1 w:0)
	// Storage: Ibc ClientStates (r:1 w:0)
	// Storage: Ibc ConsensusStates (r:1 w:0)
	// Storage: ParachainInfo ParachainId (r:1 w:0)
	fn channel_open_confirm_tendermint() -> Weight {
		(89_000_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(6 as Weight))
			.saturating_add(T::DbWeight::get().writes(2 as Weight))
	}
	// Storage: unknown [0x3a7472616e73616374696f6e5f6c6576656c3a] (r:1 w:1)
	// Storage: Ibc Channels (r:1 w:1)
	// Storage: Ibc Connections (r:1 w:0)
	// Storage: ParachainInfo ParachainId (r:1 w:0)
	fn channel_close_init() -> Weight {
		(38_000_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(4 as Weight))
			.saturating_add(T::DbWeight::get().writes(2 as Weight))
	}
	// Storage: unknown [0x3a7472616e73616374696f6e5f6c6576656c3a] (r:1 w:1)
	// Storage: Ibc Channels (r:1 w:1)
	// Storage: Ibc Connections (r:1 w:0)
	// Storage: Ibc ClientStates (r:1 w:0)
	// Storage: Ibc ConsensusStates (r:1 w:0)
	// Storage: ParachainInfo ParachainId (r:1 w:0)
	fn channel_close_confirm_tendermint() -> Weight {
		(91_000_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(6 as Weight))
			.saturating_add(T::DbWeight::get().writes(2 as Weight))
	}
	// Storage: unknown [0x3a7472616e73616374696f6e5f6c6576656c3a] (r:1 w:1)
	// Storage: Ibc Channels (r:1 w:0)
	// Storage: Ibc Connections (r:1 w:0)
	// Storage: ParachainInfo ParachainId (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: Ibc ClientStates (r:1 w:0)
	// Storage: Ibc ConsensusStates (r:1 w:0)
	// Storage: Ibc ClientUpdateTime (r:1 w:0)
	// Storage: Ibc ClientUpdateHeight (r:1 w:0)
	// Storage: Ibc PacketReceipt (r:1 w:1)
	// Storage: Ibc CounterForPacketReceipt (r:1 w:1)
	fn recv_packet_tendermint(i: u32, ) -> Weight {
		(116_267_000 as Weight)
			// Standard Error: 0
			.saturating_add((35_000 as Weight).saturating_mul(i as Weight))
			.saturating_add(T::DbWeight::get().reads(11 as Weight))
			.saturating_add(T::DbWeight::get().writes(3 as Weight))
	}
	// Storage: unknown [0x3a7472616e73616374696f6e5f6c6576656c3a] (r:1 w:1)
	// Storage: Ibc Channels (r:1 w:0)
	// Storage: Ibc Connections (r:1 w:0)
	// Storage: Ibc PacketCommitment (r:1 w:1)
	// Storage: Ibc ClientStates (r:1 w:0)
	// Storage: Ibc ConsensusStates (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: ParachainInfo ParachainId (r:1 w:0)
	// Storage: Ibc ClientUpdateTime (r:1 w:0)
	// Storage: Ibc ClientUpdateHeight (r:1 w:0)
	// Storage: Ibc CounterForPacketCommitment (r:1 w:1)
	fn ack_packet_tendermint(i: u32, j: u32, ) -> Weight {
		(123_463_000 as Weight)
			// Standard Error: 1_000
			.saturating_add((45_000 as Weight).saturating_mul(i as Weight))
			// Standard Error: 1_000
			.saturating_add((31_000 as Weight).saturating_mul(j as Weight))
			.saturating_add(T::DbWeight::get().reads(11 as Weight))
			.saturating_add(T::DbWeight::get().writes(3 as Weight))
	}
	// Storage: unknown [0x3a7472616e73616374696f6e5f6c6576656c3a] (r:1 w:1)
	// Storage: Ibc Channels (r:1 w:1)
	// Storage: Ibc Connections (r:1 w:0)
	// Storage: Ibc ConsensusStates (r:1 w:0)
	// Storage: Ibc PacketCommitment (r:1 w:1)
	// Storage: Ibc ClientStates (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: ParachainInfo ParachainId (r:1 w:0)
	// Storage: Ibc ClientUpdateTime (r:1 w:0)
	// Storage: Ibc ClientUpdateHeight (r:1 w:0)
	// Storage: Ibc CounterForPacketCommitment (r:1 w:1)
	fn timeout_packet_tendermint(i: u32, ) -> Weight {
		(124_160_000 as Weight)
			// Standard Error: 0
			.saturating_add((32_000 as Weight).saturating_mul(i as Weight))
			.saturating_add(T::DbWeight::get().reads(11 as Weight))
			.saturating_add(T::DbWeight::get().writes(4 as Weight))
	}
	// Storage: Ibc ClientStates (r:1 w:0)
	// Storage: Ibc ConsensusStates (r:1 w:0)
	// Storage: Ibc Connections (r:50 w:0)
	// Storage: Ibc Channels (r:50 w:0)
	// Storage: Ibc NextSequenceSend (r:49 w:0)
	// Storage: Ibc NextSequenceRecv (r:49 w:0)
	// Storage: Ibc NextSequenceAck (r:49 w:0)
	// Storage: Ibc PacketCommitment (r:50 w:0)
	// Storage: Ibc Acknowledgements (r:50 w:0)
	// Storage: Ibc PacketReceipt (r:50 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: Ibc HostConsensusStates (r:1 w:1)
	// Storage: System Digest (r:1 w:1)
	// Storage: Ibc Clients (r:1 w:0)
	fn on_finalize(a: u32, b: u32, c: u32, d: u32, e: u32, f: u32, ) -> Weight {
		(0 as Weight)
			// Standard Error: 192_000
			.saturating_add((28_738_000 as Weight).saturating_mul(a as Weight))
			// Standard Error: 192_000
			.saturating_add((8_163_000 as Weight).saturating_mul(b as Weight))
			// Standard Error: 192_000
			.saturating_add((20_475_000 as Weight).saturating_mul(c as Weight))
			// Standard Error: 192_000
			.saturating_add((9_294_000 as Weight).saturating_mul(d as Weight))
			// Standard Error: 192_000
			.saturating_add((13_386_000 as Weight).saturating_mul(e as Weight))
			// Standard Error: 192_000
			.saturating_add((8_256_000 as Weight).saturating_mul(f as Weight))
			.saturating_add(T::DbWeight::get().reads((3 as Weight).saturating_mul(a as Weight)))
			.saturating_add(T::DbWeight::get().reads((1 as Weight).saturating_mul(b as Weight)))
			.saturating_add(T::DbWeight::get().reads((4 as Weight).saturating_mul(c as Weight)))
			.saturating_add(T::DbWeight::get().reads((1 as Weight).saturating_mul(d as Weight)))
			.saturating_add(T::DbWeight::get().reads((1 as Weight).saturating_mul(e as Weight)))
			.saturating_add(T::DbWeight::get().reads((1 as Weight).saturating_mul(f as Weight)))
			.saturating_add(T::DbWeight::get().writes(2 as Weight))
	}
	// Storage: unknown [0x3a7472616e73616374696f6e5f6c6576656c3a] (r:1 w:1)
	// Storage: Ibc ClientStates (r:1 w:0)
	// Storage: Ibc CounterForConnections (r:1 w:1)
	// Storage: ParachainInfo ParachainId (r:1 w:0)
	// Storage: Ibc Connections (r:1 w:1)
	// Storage: Ibc ConnectionClient (r:1 w:1)
	fn initiate_connection() -> Weight {
		(45_000_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(6 as Weight))
			.saturating_add(T::DbWeight::get().writes(4 as Weight))
	}
	// Storage: unknown [0x3a7472616e73616374696f6e5f6c6576656c3a] (r:1 w:1)
	// Storage: Ibc CounterForClients (r:1 w:1)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: ParachainInfo ParachainId (r:1 w:0)
	// Storage: Ibc Clients (r:1 w:1)
	// Storage: Ibc ClientUpdateTime (r:0 w:1)
	// Storage: Ibc ClientUpdateHeight (r:0 w:1)
	// Storage: Ibc ConsensusStates (r:0 w:1)
	// Storage: Ibc ClientStates (r:0 w:1)
	fn create_client() -> Weight {
		(47_000_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(5 as Weight))
			.saturating_add(T::DbWeight::get().writes(7 as Weight))
	}
}
