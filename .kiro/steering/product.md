# Product Overview

This is a Web3 DApp that provides an admin authorization and transfer request system for BNB transfers on BNB Smart Chain.

## Core Functionality

- **User Authorization**: Users can authorize admins to request transfers from their wallets
- **Transfer Requests**: Admins can request transfers from authorized users, which users must approve
- **Admin Dashboard**: Centralized view for admins to manage authorized users and create transfer requests
- **Real-time Updates**: Live updates for authorization status and transfer requests via Supabase

## Key Features

- Zero-cost authorization system (stored in Supabase, not on-chain)
- User maintains full control - must approve each transfer in wallet
- Mobile-responsive UI with RainbowKit wallet integration
- Real-time synchronization across all connected clients

## Security Model

- Users explicitly opt-in by authorizing admins
- Authorization grants permission to REQUEST transfers, not execute them
- Each transfer requires user approval via wallet signature
- Standard Web3 security practices with no private key sharing
