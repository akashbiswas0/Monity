import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { MonadNetworkConfig } from "../config/monad-config.js";

/**
 * Contract Migration Tool
 * 
 * Provides guidance and code transformations for migrating smart contracts
 * from standard EVM to Monad-optimized versions.
 */
export class ContractMigrationTool {
  private tools: Tool[] = [
    {
      name: "migrate_contract_deployment",
      description: "Migrate contract deployment scripts to Monad with optimizations",
      inputSchema: {
        type: "object",
        properties: {
          originalCode: {
            type: "string",
            description: "Original contract deployment code"
          },
          contractType: {
            type: "string",
            enum: ["token", "nft", "defi", "dao", "general"],
            description: "Type of contract being migrated"
          },
          optimizationLevel: {
            type: "string",
            enum: ["basic", "advanced", "aggressive"],
            default: "basic",
            description: "Level of Monad-specific optimizations to apply"
          }
        },
        required: ["originalCode", "contractType"]
      }
    },
    {
      name: "optimize_contract_size",
      description: "Optimize contract for Monad's larger size limits (128kb vs 24.5kb)",
      inputSchema: {
        type: "object",
        properties: {
          contractCode: {
            type: "string",
            description: "Original contract code"
          },
          targetSize: {
            type: "number",
            description: "Target contract size in bytes",
            default: 131072 // 128kb
          }
        },
        required: ["contractCode"]
      }
    },
    {
      name: "add_monad_gas_optimizations",
      description: "Add Monad-specific gas optimizations to contracts",
      inputSchema: {
        type: "object",
        properties: {
          contractCode: {
            type: "string",
            description: "Original contract code"
          },
          functions: {
            type: "array",
            items: { type: "string" },
            description: "Specific functions to optimize"
          }
        },
        required: ["contractCode"]
      }
    },
    {
      name: "generate_monad_deployment_script",
      description: "Generate Monad-optimized deployment script",
      inputSchema: {
        type: "object",
        properties: {
          contractName: {
            type: "string",
            description: "Name of the contract"
          },
          constructorArgs: {
            type: "array",
            items: { type: "string" },
            description: "Constructor arguments"
          },
          useCreateX: {
            type: "boolean",
            default: false,
            description: "Use CreateX for deterministic deployment"
          }
        },
        required: ["contractName"]
      }
    }
  ];

  getTools(): Tool[] {
    return this.tools;
  }

  async executeTool(name: string, args: any): Promise<any> {
    switch (name) {
      case "migrate_contract_deployment":
        return this.migrateContractDeployment(args);
      case "optimize_contract_size":
        return this.optimizeContractSize(args);
      case "add_monad_gas_optimizations":
        return this.addMonadGasOptimizations(args);
      case "generate_monad_deployment_script":
        return this.generateMonadDeploymentScript(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private async migrateContractDeployment(args: any) {
    const { originalCode, contractType, optimizationLevel = "basic" } = args;

    let optimizedCode = originalCode;
    let comments: string[] = [];

    // Add Monad network configuration
    const networkConfig = `
// === MONAD MIGRATION: Network Configuration ===
// Original code used standard EVM configuration
// Monad-specific configuration with optimized gas settings

// ${originalCode.includes('chainId') ? '// Original chain configuration (commented out)' : ''}
${originalCode.includes('chainId') ? `// ${originalCode.match(/chainId.*?[,;]/g)?.[0] || ''}` : ''}

// Monad Testnet Configuration
const MONAD_CONFIG = {
  chainId: ${MonadNetworkConfig.TESTNET.chainId},
  name: "${MonadNetworkConfig.TESTNET.name}",
  rpcUrl: "${MonadNetworkConfig.TESTNET.rpcUrl}",
  // Gas configuration - Monad charges gas_limit not gas_used
  gasPrice: ${MonadNetworkConfig.GAS_CONFIG.defaultGasPrice.toString()}, // 52 gwei
  baseFeePerGas: ${MonadNetworkConfig.GAS_CONFIG.baseFeePerGas.toString()}, // 50 gwei (hardcoded)
  maxPriorityFeePerGas: ${MonadNetworkConfig.GAS_CONFIG.maxPriorityFeePerGas.toString()}, // 2 gwei (hardcoded)
};`;

    // Add gas optimization for deployment
    const gasOptimization = `
// === MONAD MIGRATION: Gas Optimization ===
// Monad charges gas_limit instead of gas_used for DOS prevention
// Set explicit gas limits for predictable costs

const MONAD_GAS_LIMITS = {
  // Standard deployment gas limits for different contract types
  ${contractType === 'token' ? 'tokenDeployment: 2000000,' : ''}
  ${contractType === 'nft' ? 'nftDeployment: 3000000,' : ''}
  ${contractType === 'defi' ? 'defiDeployment: 5000000,' : ''}
  ${contractType === 'dao' ? 'daoDeployment: 4000000,' : ''}
  standardDeployment: 2000000,
  // Contract interaction limits
  simpleCall: 100000,
  complexCall: 500000,
};`;

    // Add concurrent deployment optimization
    const concurrentOptimization = `
// === MONAD MIGRATION: Concurrent Deployment Optimization ===
// Deploy multiple contracts concurrently for better performance

async function deployContractsConcurrently(contracts) {
  // Original: Sequential deployment (slow)
  // for (const contract of contracts) {
  //   await deployContract(contract);
  // }
  
  // Monad optimized: Concurrent deployment with nonce management
  const deploymentPromises = contracts.map(async (contract, index) => {
    const nonce = await provider.getTransactionCount(deployer.address) + index;
    return deployContract(contract, { nonce });
  });
  
  return Promise.all(deploymentPromises);
}`;

    // Replace or add network configuration
    optimizedCode = networkConfig + '\n\n' + gasOptimization + '\n\n' + concurrentOptimization + '\n\n' + originalCode;

    comments.push(
      "Added Monad network configuration with hardcoded gas values",
      "Added explicit gas limits to prevent unexpected costs",
      "Added concurrent deployment pattern for better performance",
      "Monad charges gas_limit instead of gas_used - important for cost prediction"
    );

    return {
      content: [
        {
          type: "text",
          text: `## Contract Deployment Migration to Monad

### Key Changes Made:
${comments.map(c => `- ${c}`).join('\n')}

### Optimized Code:

\`\`\`typescript
${optimizedCode}
\`\`\`

### Migration Notes:
1. **Gas Charging**: Monad charges gas_limit instead of gas_used
2. **Network Configuration**: Updated to use Monad testnet settings
3. **Concurrent Deployment**: Enabled for better performance
4. **Hardcoded Values**: Using static gas values instead of RPC calls

### Next Steps:
1. Test deployment on Monad testnet
2. Monitor gas usage patterns
3. Consider using CreateX for deterministic deployments
4. Set up proper nonce management for production`
        }
      ]
    };
  }

  private async optimizeContractSize(args: any) {
    const { contractCode, targetSize = 131072 } = args;

    const optimizations = `
// === MONAD MIGRATION: Contract Size Optimization ===
// Monad allows up to 128kb contracts (vs 24.5kb on Ethereum)
// This enables more complex contracts without splitting

// Original approach might have used proxy patterns to stay under 24.5kb limit
// contract SplitContract {
//   // Limited functionality due to size constraints
// }

// Monad optimized: Single large contract
contract MonadOptimizedContract {
  // === MONAD ADVANTAGE: Larger contract size limit ===
  // Can include more functionality in single contract
  // Reduces complexity and gas costs from proxy calls
  
  // Combined functionality that previously required multiple contracts
  mapping(address => UserData) public users;
  mapping(uint256 => ComplexData) public complexData;
  
  struct UserData {
    uint256 balance;
    uint256[] transactions;
    mapping(address => bool) permissions;
    // More complex data structures possible
  }
  
  struct ComplexData {
    string metadata;
    bytes data;
    uint256[] relatedIds;
    // Rich data structures without size concerns
  }
  
  // === MONAD OPTIMIZATION: Batch operations ===
  // Larger contracts can include more batch operations
  function batchUserOperations(
    address[] calldata users,
    uint256[] calldata amounts,
    bytes[] calldata data
  ) external {
    // Complex batch logic that would exceed 24.5kb on Ethereum
    for (uint i = 0; i < users.length; i++) {
      // Process each user operation
      processUserOperation(users[i], amounts[i], data[i]);
    }
  }
  
  function processUserOperation(address user, uint256 amount, bytes calldata data) internal {
    // Complex processing logic
  }
  
  // === MONAD OPTIMIZATION: Embedded libraries ===
  // Can embed utility functions instead of external libraries
  function complexMath(uint256 a, uint256 b) internal pure returns (uint256) {
    // Complex mathematical operations
    return a * b + (a ** 2) / b;
  }
  
  // === MONAD OPTIMIZATION: Rich event logging ===
  // Larger contracts can afford more detailed events
  event DetailedTransaction(
    address indexed user,
    uint256 indexed amount,
    string metadata,
    bytes data,
    uint256[] relatedIds
  );
}`;

    return {
      content: [
        {
          type: "text",
          text: `## Contract Size Optimization for Monad

### Monad Advantage: 128kb Contract Limit

Monad allows contracts up to **128kb** compared to Ethereum's **24.5kb** limit. This enables:

- **Single Large Contracts**: Reduce proxy complexity
- **Rich Data Structures**: More complex state variables
- **Batch Operations**: Include more batch processing logic
- **Embedded Libraries**: Reduce external dependencies
- **Detailed Events**: More comprehensive logging

### Optimized Contract Code:

\`\`\`solidity
${optimizations}
\`\`\`

### Size Optimization Strategies:

1. **Consolidate Related Contracts**: Combine proxy + implementation
2. **Embed Common Libraries**: Reduce external calls
3. **Rich Batch Operations**: Process multiple items in single call
4. **Detailed State Management**: Use complex data structures
5. **Comprehensive Events**: Enhanced debugging and indexing

### Benefits on Monad:
- **Reduced Gas Costs**: Fewer inter-contract calls
- **Simplified Architecture**: Less proxy complexity
- **Better Performance**: More operations per transaction
- **Enhanced Functionality**: Richer feature sets

### Target Size: ${targetSize} bytes (${(targetSize / 1024).toFixed(1)}kb)`
        }
      ]
    };
  }

  private async addMonadGasOptimizations(args: any) {
    const { contractCode, functions = [] } = args;

    const optimizations = `
// === MONAD MIGRATION: Gas Optimizations ===

pragma solidity ^0.8.19;

// Original contract approach
// contract OriginalContract {
//   // Standard EVM gas optimization patterns
// }

contract MonadOptimizedContract {
  // === MONAD GAS OPTIMIZATION 1: Explicit Gas Limits ===
  // Monad charges gas_limit not gas_used, so set explicit limits
  
  modifier gasOptimized(uint256 gasLimit) {
    require(gasleft() >= gasLimit, "Insufficient gas");
    _;
  }
  
  // === MONAD GAS OPTIMIZATION 2: Batch Operations ===
  // Combine multiple operations to reduce transaction overhead
  
  function batchTransfer(
    address[] calldata recipients,
    uint256[] calldata amounts
  ) external gasOptimized(21000 * recipients.length) {
    // Optimized batch transfer with predictable gas usage
    for (uint i = 0; i < recipients.length; i++) {
      // Each transfer costs exactly 21,000 gas
      _transfer(msg.sender, recipients[i], amounts[i]);
    }
  }
  
  // === MONAD GAS OPTIMIZATION 3: Storage Optimization ===
  // Pack data efficiently for better performance
  
  struct PackedData {
    uint128 amount;     // Instead of uint256 where possible
    uint64 timestamp;   // Sufficient for timestamps
    uint32 blockNumber; // Sufficient for block numbers
    uint32 nonce;       // Sufficient for nonces
  }
  
  mapping(address => PackedData) public packedUserData;
  
  // === MONAD GAS OPTIMIZATION 4: Event Optimization ===
  // Use indexed events for better querying performance
  
  event OptimizedTransfer(
    address indexed from,
    address indexed to,
    uint256 amount,
    uint256 indexed blockNumber
  );
  
  // === MONAD GAS OPTIMIZATION 5: View Function Optimization ===
  // Combine multiple reads into single function
  
  function getUserInfo(address user) external view returns (
    uint256 balance,
    uint256 timestamp,
    uint256 blockNumber,
    uint256 nonce
  ) {
    PackedData memory data = packedUserData[user];
    return (
      uint256(data.amount),
      uint256(data.timestamp),
      uint256(data.blockNumber),
      uint256(data.nonce)
    );
  }
  
  // === MONAD GAS OPTIMIZATION 6: Multicall Support ===
  // Enable batch calls for better UX
  
  function multicall(bytes[] calldata data) external returns (bytes[] memory results) {
    results = new bytes[](data.length);
    for (uint i = 0; i < data.length; i++) {
      (bool success, bytes memory result) = address(this).call(data[i]);
      require(success, "Multicall failed");
      results[i] = result;
    }
  }
  
  // Internal functions with gas tracking
  function _transfer(address from, address to, uint256 amount) internal {
    // Optimized transfer logic
    // Track gas usage for predictable costs
  }
}

// === MONAD GAS CALCULATION HELPER ===
library MonadGasCalculator {
  // Standard gas costs for common operations
  uint256 constant TRANSFER_GAS = 21000;
  uint256 constant SSTORE_GAS = 20000;
  uint256 constant SLOAD_GAS = 800;
  uint256 constant CALL_GAS = 700;
  
  function calculateBatchTransferGas(uint256 transfers) internal pure returns (uint256) {
    return TRANSFER_GAS * transfers;
  }
  
  function calculateStorageGas(uint256 writes, uint256 reads) internal pure returns (uint256) {
    return (SSTORE_GAS * writes) + (SLOAD_GAS * reads);
  }
}`;

    return {
      content: [
        {
          type: "text",
          text: `## Monad Gas Optimizations

### Key Optimization Strategies:

1. **Explicit Gas Limits**: Set predictable gas limits since Monad charges gas_limit
2. **Batch Operations**: Combine multiple operations for efficiency
3. **Storage Packing**: Optimize data structures for better performance
4. **Event Optimization**: Use indexed events for better querying
5. **View Function Batching**: Combine multiple reads
6. **Multicall Support**: Enable batch calls for better UX

### Optimized Contract Code:

\`\`\`solidity
${optimizations}
\`\`\`

### Gas Optimization Benefits:

- **Predictable Costs**: Know exact gas costs upfront
- **Better Performance**: Optimized for Monad's execution model
- **Reduced Transactions**: Batch operations reduce overhead
- **Efficient Storage**: Packed data structures
- **Enhanced UX**: Multicall support for complex operations

### Important Monad Differences:

1. **Gas Charging**: Monad charges gas_limit, not gas_used
2. **Batch Friendly**: Larger blocks support more batch operations
3. **Storage Efficiency**: Optimized state management
4. **Event Indexing**: Better support for complex events

### Recommended Gas Limits:
- Simple transfer: 21,000 gas
- Complex call: 100,000 gas
- Batch operations: 50,000 gas per item
- Contract deployment: 2,000,000+ gas`
        }
      ]
    };
  }

  private async generateMonadDeploymentScript(args: any) {
    const { contractName, constructorArgs = [], useCreateX = false } = args;

    const deploymentScript = `
// === MONAD DEPLOYMENT SCRIPT ===
// Optimized deployment script for Monad blockchain

import { ethers } from "ethers";
import { MonadNetworkConfig } from "./monad-config";

// Monad-specific deployment configuration
const MONAD_DEPLOYMENT_CONFIG = {
  // Use hardcoded gas values for predictable costs
  gasPrice: ${MonadNetworkConfig.GAS_CONFIG.defaultGasPrice.toString()},
  gasLimit: 2000000, // Explicit gas limit for deployment
  
  // Network configuration
  chainId: ${MonadNetworkConfig.TESTNET.chainId},
  rpcUrl: "${MonadNetworkConfig.TESTNET.rpcUrl}",
  
  // Contract addresses
  ${useCreateX ? `createX: "${MonadNetworkConfig.CONTRACTS.CreateX}",` : ''}
  multicall3: "${MonadNetworkConfig.CONTRACTS.Multicall3}",
};

async function deployContract() {
  // === MONAD OPTIMIZATION: Provider setup ===
  const provider = new ethers.JsonRpcProvider(MONAD_DEPLOYMENT_CONFIG.rpcUrl);
  
  // === MONAD OPTIMIZATION: Signer with explicit gas config ===
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  
  // Verify network
  const network = await provider.getNetwork();
  console.log(\`Deploying to network: \${network.name} (chainId: \${network.chainId})\`);
  
  if (network.chainId !== BigInt(MONAD_DEPLOYMENT_CONFIG.chainId)) {
    throw new Error(\`Wrong network! Expected \${MONAD_DEPLOYMENT_CONFIG.chainId}, got \${network.chainId}\`);
  }

  // === MONAD OPTIMIZATION: Load contract factory ===
  const ContractFactory = await ethers.getContractFactory("${contractName}", signer);
  
  ${useCreateX ? `
  // === MONAD OPTIMIZATION: CreateX Deployment (Deterministic) ===
  const createXContract = new ethers.Contract(
    MONAD_DEPLOYMENT_CONFIG.createX,
    CREATE_X_ABI,
    signer
  );
  
  // Generate deterministic salt
  const salt = ethers.keccak256(ethers.toUtf8Bytes("${contractName}"));
  
  // Deploy using CreateX
  console.log("Deploying ${contractName} using CreateX...");
  const deployTx = await createXContract.deployCreate2(
    salt,
    ContractFactory.bytecode,
    {
      gasLimit: MONAD_DEPLOYMENT_CONFIG.gasLimit,
      gasPrice: MONAD_DEPLOYMENT_CONFIG.gasPrice,
    }
  );
  
  await deployTx.wait();
  
  // Calculate deployed address
  const deployedAddress = await createXContract.computeCreate2Address(
    salt,
    ethers.keccak256(ContractFactory.bytecode),
    signer.address
  );
  ` : `
  // === MONAD OPTIMIZATION: Standard deployment with explicit gas ===
  console.log("Deploying ${contractName}...");
  const contract = await ContractFactory.deploy(
    ${constructorArgs.map((arg: string) => `"${arg}"`).join(', ')},
    {
      gasLimit: MONAD_DEPLOYMENT_CONFIG.gasLimit,
      gasPrice: MONAD_DEPLOYMENT_CONFIG.gasPrice,
      // Monad-specific: Set explicit gas to avoid estimation calls
    }
  );
  
  console.log("Waiting for deployment...");
  await contract.waitForDeployment();
  
  const deployedAddress = await contract.getAddress();
  `}
  
  console.log(\`\${contractName} deployed to: \${deployedAddress}\`);
  
  // === MONAD OPTIMIZATION: Verify deployment ===
  console.log("Verifying deployment...");
  const deployedContract = new ethers.Contract(
    deployedAddress,
    ContractFactory.interface,
    signer
  );
  
  // Test contract is responsive
  try {
    // Make a simple call to verify contract is working
    const code = await provider.getCode(deployedAddress);
    if (code === "0x") {
      throw new Error("Contract deployment failed - no code at address");
    }
    console.log("✅ Contract deployed successfully!");
  } catch (error) {
    console.error("❌ Contract deployment verification failed:", error);
    throw error;
  }
  
  // === MONAD OPTIMIZATION: Save deployment info ===
  const deploymentInfo = {
    contractName: "${contractName}",
    address: deployedAddress,
    chainId: MONAD_DEPLOYMENT_CONFIG.chainId,
    gasUsed: MONAD_DEPLOYMENT_CONFIG.gasLimit, // Monad charges gas_limit
    gasPrice: MONAD_DEPLOYMENT_CONFIG.gasPrice.toString(),
    deploymentTime: new Date().toISOString(),
    constructorArgs: [${constructorArgs.map((arg: string) => `"${arg}"`).join(', ')}],
    ${useCreateX ? 'deploymentMethod: "CreateX",' : 'deploymentMethod: "Standard",'}
  };
  
  console.log("Deployment info:", JSON.stringify(deploymentInfo, null, 2));
  
  return {
    contract: deployedContract,
    address: deployedAddress,
    deploymentInfo
  };
}

// === MONAD OPTIMIZATION: Batch deployment function ===
async function batchDeploy(contracts: Array<{name: string, args: string[]}>) {
  console.log("Starting batch deployment...");
  
  const provider = new ethers.JsonRpcProvider(MONAD_DEPLOYMENT_CONFIG.rpcUrl);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  
  // Get initial nonce
  const initialNonce = await provider.getTransactionCount(signer.address);
  
  // Deploy contracts concurrently with managed nonces
  const deploymentPromises = contracts.map(async (contractInfo, index) => {
    const factory = await ethers.getContractFactory(contractInfo.name, signer);
    
    return factory.deploy(...contractInfo.args, {
      gasLimit: MONAD_DEPLOYMENT_CONFIG.gasLimit,
      gasPrice: MONAD_DEPLOYMENT_CONFIG.gasPrice,
      nonce: initialNonce + index,
    });
  });
  
  console.log(\`Deploying \${contracts.length} contracts concurrently...\`);
  const deployedContracts = await Promise.all(deploymentPromises);
  
  // Wait for all deployments
  await Promise.all(deployedContracts.map(contract => contract.waitForDeployment()));
  
  console.log("✅ All contracts deployed successfully!");
  return deployedContracts;
}

${useCreateX ? `
// CreateX ABI (minimal)
const CREATE_X_ABI = [
  "function deployCreate2(bytes32 salt, bytes memory bytecode) external returns (address)",
  "function computeCreate2Address(bytes32 salt, bytes32 bytecodeHash, address deployer) external view returns (address)"
];
` : ''}

// Export deployment functions
export { deployContract, batchDeploy, MONAD_DEPLOYMENT_CONFIG };

// Run deployment if called directly
if (require.main === module) {
  deployContract()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}`;

    return {
      content: [
        {
          type: "text",
          text: `## Monad Deployment Script

### Generated deployment script optimized for Monad blockchain:

\`\`\`typescript
${deploymentScript}
\`\`\`

### Key Optimizations:

1. **Explicit Gas Configuration**: Uses hardcoded gas values to avoid RPC calls
2. **Network Verification**: Ensures deployment to correct Monad network
3. **Batch Deployment**: Supports concurrent deployment with nonce management
4. **Deterministic Deployment**: ${useCreateX ? 'Uses CreateX for' : 'Option to use CreateX for'} deterministic addresses
5. **Deployment Verification**: Comprehensive verification and logging

### Usage:

\`\`\`bash
# Set environment variables
export PRIVATE_KEY="your-private-key"

# Deploy single contract
npm run deploy

# Or deploy multiple contracts
npm run deploy:batch
\`\`\`

### Monad-Specific Features:

- **Gas Charging**: Configured for gas_limit charging model
- **Concurrent Deployment**: Optimized for Monad's performance
- **Network Configuration**: Pre-configured for Monad testnet
- **Canonical Contracts**: Integrated with Monad's deployed contracts

### Next Steps:

1. Test deployment on Monad testnet
2. Verify contract functionality
3. Set up contract verification
4. Configure monitoring and alerts`
        }
      ]
    };
  }
} 