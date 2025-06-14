import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { MonadNetworkConfig } from "../config/monad-config.js";

export class ValidationTool {
  private tools: Tool[] = [
    {
      name: "validate_monad_migration",
      description: "Validate a complete Monad migration for best practices",
      inputSchema: {
        type: "object",
        properties: {
          projectType: {
            type: "string",
            enum: ["defi", "nft", "dao", "gaming", "general"],
            description: "Type of project being migrated"
          },
          codeBase: {
            type: "string",
            description: "Code to validate"
          }
        },
        required: ["projectType", "codeBase"]
      }
    },
    {
      name: "check_gas_optimization",
      description: "Check for proper gas optimization patterns",
      inputSchema: {
        type: "object",
        properties: {
          code: {
            type: "string",
            description: "Code to check for gas optimizations"
          }
        },
        required: ["code"]
      }
    },
    {
      name: "generate_migration_checklist",
      description: "Generate a comprehensive migration checklist",
      inputSchema: {
        type: "object",
        properties: {
          complexity: {
            type: "string",
            enum: ["simple", "moderate", "complex"],
            description: "Complexity level of the migration"
          }
        },
        required: ["complexity"]
      }
    }
  ];

  getTools(): Tool[] {
    return this.tools;
  }

  async executeTool(name: string, args: any): Promise<any> {
    switch (name) {
      case "validate_monad_migration":
        return this.validateMonadMigration(args);
      case "check_gas_optimization":
        return this.checkGasOptimization(args);
      case "generate_migration_checklist":
        return this.generateMigrationChecklist(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private async validateMonadMigration(args: any) {
    const { projectType, codeBase } = args;
    
    const checks = [
      {
        name: "Network Configuration",
        passed: codeBase.includes(MonadNetworkConfig.TESTNET.chainId.toString()),
        description: "Uses correct Monad chain ID (10143)"
      },
      {
        name: "Gas Price Optimization",
        passed: codeBase.includes("52000000000") || codeBase.includes("52 * 10**9"),
        description: "Uses hardcoded gas price instead of RPC calls"
      },
      {
        name: "Multicall Integration",
        passed: codeBase.includes("multicall") || codeBase.includes("Multicall3"),
        description: "Implements multicall for batch operations"
      },
      {
        name: "Concurrent Processing",
        passed: codeBase.includes("Promise.all"),
        description: "Uses concurrent patterns for better performance"
      },
      {
        name: "Gas Limit Management",
        passed: codeBase.includes("gasLimit") && !codeBase.includes("estimateGas"),
        description: "Uses explicit gas limits instead of estimation"
      }
    ];

    const passedChecks = checks.filter(check => check.passed).length;
    const score = Math.round((passedChecks / checks.length) * 100);

    const recommendations: string[] = [];
    if (!checks[0].passed) recommendations.push("Update network configuration to use Monad testnet (Chain ID: 10143)");
    if (!checks[1].passed) recommendations.push("Replace dynamic gas price calls with hardcoded value (52 gwei)");
    if (!checks[2].passed) recommendations.push("Implement Multicall3 for batching contract reads");
    if (!checks[3].passed) recommendations.push("Add concurrent processing with Promise.all for better performance");
    if (!checks[4].passed) recommendations.push("Use explicit gas limits instead of gas estimation");

    return {
      content: [{
        type: "text",
        text: `## Monad Migration Validation Report

### Migration Score: ${score}% (${passedChecks}/${checks.length} checks passed)

### Validation Results:
${checks.map(check => `${check.passed ? '✅' : '❌'} **${check.name}**: ${check.description}`).join('\n')}

### Project Type: ${projectType}
${projectType === 'defi' ? 'Consider implementing batch swap functions and optimized liquidity operations' : ''}
${projectType === 'nft' ? 'Leverage Monad\'s larger contract size for rich metadata and batch minting' : ''}
${projectType === 'dao' ? 'Implement batch voting and concurrent proposal processing' : ''}

### Recommendations:
${recommendations.length > 0 ? recommendations.map(rec => `- ${rec}`).join('\n') : '🎉 All checks passed! Your migration follows Monad best practices.'}

### Next Steps:
1. Deploy to Monad testnet for testing
2. Monitor gas usage patterns
3. Set up indexing for event data
4. Test concurrent transaction scenarios`
      }]
    };
  }

  private async checkGasOptimization(args: any) {
    const { code } = args;
    
    const gasChecks = [
      {
        check: "Hardcoded Gas Values",
        pattern: /gasPrice.*52.*10\*\*9|gasPrice.*52000000000/,
        passed: false,
        importance: "high"
      },
      {
        check: "Explicit Gas Limits",
        pattern: /gasLimit.*\d+/,
        passed: false,
        importance: "high"
      },
      {
        check: "No Gas Estimation",
        pattern: /estimateGas/,
        passed: true, // Inverse check - should NOT be present
        importance: "medium"
      },
      {
        check: "EIP-1559 Support",
        pattern: /maxFeePerGas|maxPriorityFeePerGas/,
        passed: false,
        importance: "medium"
      },
      {
        check: "Batch Operations",
        pattern: /batch|multicall/i,
        passed: false,
        importance: "high"
      }
    ];

    // Run checks
    gasChecks.forEach(check => {
      if (check.check === "No Gas Estimation") {
        check.passed = !check.pattern.test(code);
      } else {
        check.passed = check.pattern.test(code);
      }
    });

    const highPriorityPassed = gasChecks.filter(c => c.importance === "high" && c.passed).length;
    const highPriorityTotal = gasChecks.filter(c => c.importance === "high").length;
    
    return {
      content: [{
        type: "text",
        text: `## Gas Optimization Analysis

### High Priority Optimizations: ${highPriorityPassed}/${highPriorityTotal} ✓

### Detailed Results:
${gasChecks.map(check => 
  `${check.passed ? '✅' : '❌'} **${check.check}** (${check.importance} priority)`
).join('\n')}

### Monad-Specific Gas Recommendations:

#### ✅ **DO:**
- Use hardcoded gas price: \`${MonadNetworkConfig.GAS_CONFIG.defaultGasPrice.toString()}\` wei (52 gwei)
- Set explicit gas limits for predictable costs
- Implement batch operations to reduce transaction count
- Use EIP-1559 transaction format

#### ❌ **DON'T:**
- Call \`eth_estimateGas\` - use known gas costs instead
- Use dynamic gas pricing - values are hardcoded on Monad
- Ignore gas_limit charging - Monad charges gas_limit not gas_used

### Code Examples:

\`\`\`typescript
// ✅ Optimized for Monad
const tx = {
  gasLimit: 21000n, // Explicit limit
  gasPrice: ${MonadNetworkConfig.GAS_CONFIG.defaultGasPrice.toString()}n, // Hardcoded
  maxFeePerGas: ${MonadNetworkConfig.GAS_CONFIG.baseFeePerGas.toString()}n + ${MonadNetworkConfig.GAS_CONFIG.maxPriorityFeePerGas.toString()}n
};

// ❌ Avoid on Monad
const gasLimit = await contract.estimateGas.transfer(to, amount);
const gasPrice = await provider.getGasPrice();
\`\`\``
      }]
    };
  }

  private async generateMigrationChecklist(args: any) {
    const { complexity } = args;
    
    const basicChecklist = [
      "Update network configuration to Monad testnet (Chain ID: 10143)",
      "Replace dynamic gas pricing with hardcoded values",
      "Set explicit gas limits for all transactions",
      "Test basic contract deployment and interaction",
      "Verify contract functionality on Monad testnet"
    ];

    const moderateChecklist = [
      ...basicChecklist,
      "Implement multicall patterns for batch operations",
      "Add concurrent transaction processing",
      "Set up event indexing with supported providers",
      "Optimize contract reads with batch patterns",
      "Implement proper nonce management for multiple transactions",
      "Test gas usage patterns and optimize accordingly"
    ];

    const complexChecklist = [
      ...moderateChecklist,
      "Leverage Monad's 128kb contract size limit for consolidation",
      "Implement custom batching contracts for complex operations",
      "Set up comprehensive monitoring and alerting",
      "Optimize for Monad's high throughput capabilities",
      "Implement cross-chain bridge integrations if needed",
      "Set up automated testing for concurrent scenarios",
      "Implement advanced indexing with multiple providers",
      "Optimize frontend for Monad's fast block times (0.5s)",
      "Set up proper error handling for batch operations",
      "Implement fallback strategies for RPC failures"
    ];

    const checklist = complexity === 'simple' ? basicChecklist : 
                     complexity === 'moderate' ? moderateChecklist : 
                     complexChecklist;

    return {
      content: [{
        type: "text",
        text: `## Monad Migration Checklist (${complexity.toUpperCase()} complexity)

### Pre-Migration
- [ ] Audit existing codebase for Monad compatibility
- [ ] Identify gas-heavy operations for optimization
- [ ] Plan indexing strategy for event data
- [ ] Set up Monad testnet development environment

### Core Migration Tasks
${checklist.map(item => `- [ ] ${item}`).join('\n')}

### Monad-Specific Optimizations
- [ ] Replace \`eth_chainId\` calls with hardcoded value: ${MonadNetworkConfig.TESTNET.chainId}
- [ ] Replace \`eth_gasPrice\` calls with hardcoded value: ${MonadNetworkConfig.GAS_CONFIG.defaultGasPrice.toString()} wei
- [ ] Use Multicall3 at: \`${MonadNetworkConfig.CONTRACTS.Multicall3}\`
- [ ] Implement proper gas_limit vs gas_used cost calculations
- [ ] Optimize for 500ms block times

### Testing & Validation
- [ ] Test all contract functions on Monad testnet
- [ ] Verify gas cost predictions vs actual usage
- [ ] Test concurrent transaction scenarios
- [ ] Validate indexer integration and event querying
- [ ] Performance test with high transaction volumes
- [ ] Test error handling and recovery scenarios

### Deployment & Monitoring
- [ ] Deploy to Monad testnet with proper gas settings
- [ ] Set up transaction monitoring and alerting
- [ ] Configure indexer for production data access
- [ ] Implement health checks and uptime monitoring
- [ ] Document migration changes and new patterns

### Resources
- **Testnet RPC**: ${MonadNetworkConfig.TESTNET.rpcUrl}
- **Explorer**: ${MonadNetworkConfig.TESTNET.explorerUrl}
- **Faucet**: ${MonadNetworkConfig.TESTNET.faucetUrl}
- **Max Contract Size**: ${MonadNetworkConfig.OPTIMIZATION_CONSTANTS.MAX_CONTRACT_SIZE / 1024}kb
- **Recommended Batch Size**: ${MonadNetworkConfig.OPTIMIZATION_CONSTANTS.RECOMMENDED_BATCH_SIZE}

### Success Criteria
- All transactions execute with predictable gas costs
- Batch operations reduce overall transaction count by >50%
- Event indexing provides real-time data access
- Application performs better than original EVM implementation`
      }]
    };
  }
} 