/**
 * Monad Network Configuration
 * 
 * This file contains all the network-specific configurations, constants,
 * and contract addresses for Monad blockchain migration.
 */

export interface MonadNetworkInfo {
  chainId: number;
  name: string;
  currency: string;
  rpcUrl: string;
  explorerUrl: string;
  faucetUrl?: string;
  testnetHub?: string;
}

export interface MonadGasConfig {
  baseFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  defaultGasPrice: bigint;
  standardTransferGas: bigint;
}

export interface MonadContractAddresses {
  [key: string]: string;
}

export class MonadNetworkConfig {
  // Monad Testnet Configuration
  static readonly TESTNET: MonadNetworkInfo = {
    chainId: 10143,
    name: "Monad Testnet",
    currency: "MON",
    rpcUrl: "https://testnet-rpc.monad.xyz",
    explorerUrl: "https://testnet.monadexplorer.com",
    faucetUrl: "https://faucet.monad.xyz",
    testnetHub: "https://testnet.monad.xyz"
  };

  // Gas Configuration - Monad specific optimizations
  static readonly GAS_CONFIG: MonadGasConfig = {
    // Base fee is hardcoded to 50 gwei on testnet
    baseFeePerGas: BigInt(50) * BigInt(10 ** 9), // 50 gwei
    // Max priority fee is hardcoded to 2 gwei
    maxPriorityFeePerGas: BigInt(2) * BigInt(10 ** 9), // 2 gwei
    // Default gas price for calculations
    defaultGasPrice: BigInt(52) * BigInt(10 ** 9), // 52 gwei (50 + 2)
    // Standard transfer always costs 21,000 gas
    standardTransferGas: BigInt(21000)
  };

  // Canonical Contract Addresses on Monad Testnet
  static readonly CONTRACTS: MonadContractAddresses = {
    // Deployment utilities
    CreateX: "0xba5Ed099633D3B313e4D5F7bdc1305d3c28ba5Ed",
    FoundryDeterministicDeployer: "0x4e59b44847b379578588920ca78fbf26c0b4956c",
    SafeSingletonFactory: "0x914d7Fec6aaC8cd542e72Bca78B30650d45643d7",
    
    // Account abstraction
    EntryPointV06: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    EntryPointV07: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
    
    // Utilities
    Multicall3: "0xcA11bde05977b3631167028862bE2a173976CA11",
    Permit2: "0x000000000022d473030f116ddee9f6b43ac78ba3",
    
    // DEX Infrastructure
    UniswapV2Factory: "0x733e88f248b742db6c14c0b1713af5ad7fdd59d0",
    UniswapV3Factory: "0x961235a9020b05c44df1026d956d1f4d78014276",
    UniswapV2Router02: "0xfb8e1c3b833f9e67a71c859a132cf783b645e436",
    UniswapUniversalRouter: "0x3ae6d8a282d67893e17aa70ebffb33ee5aa65893",
    
    // Wrapped tokens
    WrappedMonad: "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701"
  };

  // Test tokens on Monad Testnet
  static readonly TEST_TOKENS: MonadContractAddresses = {
    USDC: "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea",
    USDT: "0x88b8E2161DEDC77EF4ab7585569D2415a1C1055D",
    WBTC: "0xcf5a6076cfa32686c0Df13aBaDa2b40dec133F1d",
    WETH: "0xB5a30b0FDc42e3E9760Cb8449Fb37",
    WSOL: "0x5387C85A4965769f6B0Df430638a1388493486F1"
  };

  // Performance optimization constants
  static readonly OPTIMIZATION_CONSTANTS = {
    // Maximum block range for eth_getLogs
    MAX_BLOCK_RANGE_LOGS: 100,
    // Recommended block range for optimal performance
    RECOMMENDED_BLOCK_RANGE: 10,
    // Maximum contract size (128kb vs 24.5kb on Ethereum)
    MAX_CONTRACT_SIZE: 128 * 1024, // 128kb
    // Block time
    BLOCK_TIME_MS: 500, // 0.5 seconds
    // Batch size recommendations
    RECOMMENDED_BATCH_SIZE: 50,
    MAX_BATCH_SIZE: 100
  };

  // Indexer configurations
  static readonly INDEXER_CONFIGS = {
    ALLIUM: {
      chain: "monad_testnet",
      explorerChain: "Monad Testnet"
    },
    ENVIO: {
      networkId: 10143
    },
    GOLDSKY: {
      networkIdentifier: "monad-testnet",
      mirrorDatasetName: "monad_testnet"
    },
    QUICKNODE: {
      networkIdentifier: "monad-testnet"
    },
    THEGRAPH: {
      networkName: "monad-testnet"
    },
    THIRDWEB: {
      chainId: 10143
    }
  };

  // RPC method static responses for optimization
  static readonly STATIC_RPC_RESPONSES = {
    eth_chainId: "0x27a7", // 10143 in hex
    eth_gasPrice: "0xc1dcd6500", // 52 * 10^9 in hex
    eth_maxPriorityFeePerGas: "0x77359400" // 2 * 10^9 in hex
  };

  /**
   * Get network configuration for environment
   */
  static getNetworkConfig(environment: 'testnet' | 'mainnet' = 'testnet'): MonadNetworkInfo {
    if (environment === 'testnet') {
      return this.TESTNET;
    }
    throw new Error('Mainnet configuration not yet available');
  }

  /**
   * Check if an address is a known canonical contract
   */
  static isCanonicalContract(address: string): boolean {
    const lowerAddress = address.toLowerCase();
    return Object.values(this.CONTRACTS).some(
      contractAddress => contractAddress.toLowerCase() === lowerAddress
    );
  }

  /**
   * Get contract name by address
   */
  static getContractName(address: string): string | null {
    const lowerAddress = address.toLowerCase();
    for (const [name, contractAddress] of Object.entries(this.CONTRACTS)) {
      if (contractAddress.toLowerCase() === lowerAddress) {
        return name;
      }
    }
    return null;
  }

  /**
   * Generate Monad-optimized transaction parameters
   */
  static getOptimizedTxParams(gasLimit?: bigint) {
    return {
      gasLimit: gasLimit || this.GAS_CONFIG.standardTransferGas,
      gasPrice: this.GAS_CONFIG.defaultGasPrice,
      maxFeePerGas: this.GAS_CONFIG.baseFeePerGas + this.GAS_CONFIG.maxPriorityFeePerGas,
      maxPriorityFeePerGas: this.GAS_CONFIG.maxPriorityFeePerGas,
      type: 2 as const // EIP-1559 transaction
    };
  }
} 