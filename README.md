# Monad Migration MCP Server

A comprehensive Model Context Protocol (MCP) server for migrating EVM applications to Monad blockchain with performance optimizations.

## Overview

This MCP server provides tools and guidance for migrating existing EVM applications to Monad blockchain, focusing on:

- **Smart Contract Optimization**: Leverage Monad's larger contract size limits (128kb vs 24.5kb)
- **Gas Optimization**: Use hardcoded values instead of RPC calls for predictable costs
- **RPC Call Batching**: Implement multicall and concurrent patterns for better performance
- **Transaction Optimization**: Concurrent submission with proper nonce management
- **Indexing Solutions**: Integration with supported indexing providers
- **Frontend Migration**: Optimize web3 integrations for Monad's performance characteristics

## Monad Key Differences

- **Chain ID**: 10143 (testnet)
- **Gas Charging**: Charges `gas_limit` instead of `gas_used`
- **Gas Prices**: Hardcoded values (Base: 50 gwei, Priority: 2 gwei)
- **Contract Size**: Up to 128kb contracts allowed
- **Block Time**: 0.5 seconds
- **RPC Limits**: `eth_getLogs` limited to 100 block range

## Installation

```bash
npm install
npm run build
```

## Usage

Start the MCP server:

```bash
npm start
# or for development
npm run dev
```

## Available Tools

### 1. Contract Migration Tools

#### `migrate_contract_deployment`
Migrate contract deployment scripts to Monad with optimizations.

```typescript
// Example usage
{
  "originalCode": "your-deployment-code",
  "contractType": "token|nft|defi|dao|general",
  "optimizationLevel": "basic|advanced|aggressive"
}
```

#### `optimize_contract_size`
Optimize contracts for Monad's larger size limits (128kb).

#### `add_monad_gas_optimizations`
Add Monad-specific gas optimizations to contracts.

#### `generate_monad_deployment_script`
Generate optimized deployment scripts for Monad.

### 2. Frontend Migration Tools

#### `migrate_web3_config`
Migrate web3 configuration to Monad network.

#### `optimize_rpc_calls`
Optimize RPC calls for Monad performance.

#### `implement_batch_calls`
Implement batch calling patterns.

### 3. Gas Optimization Tools

#### `optimize_gas_estimation`
Replace gas estimation with hardcoded values.

#### `implement_gas_limit_strategy`
Implement gas limit strategy for Monad's charging model.

### 4. RPC Optimization Tools

#### `implement_multicall_pattern`
Implement multicall patterns for batching RPC calls.

#### `optimize_concurrent_calls`
Optimize concurrent RPC call patterns.

### 5. Indexer Migration Tools

#### `setup_envio_indexer`
Set up Envio HyperIndex for Monad.

#### `configure_goldsky_subgraph`
Configure Goldsky subgraph for Monad.

### 6. Transaction Optimization Tools

#### `implement_concurrent_transactions`
Implement concurrent transaction submission.

#### `optimize_nonce_management`
Implement local nonce management for multiple transactions.

### 7. Validation Tools

#### `validate_monad_migration`
Validate a complete Monad migration for best practices.

#### `check_gas_optimization`
Check for proper gas optimization patterns.

#### `generate_migration_checklist`
Generate a comprehensive migration checklist.






## Migration Best Practices

### 1. Smart Contracts
- Consolidate related contracts to leverage 128kb size limit
- Use explicit gas limits instead of estimation
- Implement batch operations for efficiency
- Add comprehensive event logging

### 2. Frontend Applications
- Use hardcoded gas values to avoid RPC calls
- Implement concurrent RPC patterns
- Use multicall for batch contract reads
- Optimize for 0.5s block times

### 3. Indexing
- Use supported indexers (Envio, Goldsky, QuickNode, etc.)
- Limit `eth_getLogs` queries to 10-100 block ranges
- Implement proper event filtering

### 4. Transaction Management
- Use local nonce management for concurrent transactions
- Implement proper error handling and retry logic
- Monitor gas usage patterns

## Supported Indexing Providers

- **Envio HyperIndex**: Network ID 10143
- **Goldsky**: Network identifier `monad-testnet`
- **QuickNode Streams**: Network `monad-testnet`
- **The Graph**: Network `monad-testnet`
- **thirdweb Insight**: Chain ID 10143
- **Allium**: Chain `monad_testnet`

## Canonical Contracts on Monad Testnet

| Contract | Address |
|----------|---------|
| Multicall3 | `0xcA11bde05977b3631167028862bE2a173976CA11` |
| CreateX | `0xba5Ed099633D3B313e4D5F7bdc1305d3c28ba5Ed` |
| UniswapV2Router02 | `0xfb8e1c3b833f9e67a71c859a132cf783b645e436` |
| WrappedMonad | `0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701` |

## Migration Checklist

### Basic Migration
- [ ] Update network configuration
- [ ] Replace dynamic gas pricing
- [ ] Set explicit gas limits
- [ ] Test on Monad testnet

### Advanced Migration
- [ ] Implement multicall patterns
- [ ] Add concurrent processing
- [ ] Set up event indexing
- [ ] Optimize contract reads

### Complex Migration
- [ ] Leverage 128kb contract limits
- [ ] Implement custom batching
- [ ] Set up monitoring
- [ ] Optimize for high throughput

## Resources

- **Testnet RPC**: https://testnet-rpc.monad.xyz
- **Explorer**: https://testnet.monadexplorer.com
- **Faucet**: https://faucet.monad.xyz
- **Testnet Hub**: https://testnet.monad.xyz

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details. 
