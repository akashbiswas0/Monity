import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { MonadNetworkConfig } from "../config/monad-config.js";

export class TransactionOptimizationTool {
  private tools: Tool[] = [
    {
      name: "implement_concurrent_transactions",
      description: "Implement concurrent transaction submission for Monad",
      inputSchema: {
        type: "object",
        properties: {
          transactionCount: { type: "number", description: "Number of transactions to submit" }
        },
        required: ["transactionCount"]
      }
    },
    {
      name: "optimize_nonce_management",
      description: "Implement local nonce management for multiple transactions",
      inputSchema: {
        type: "object",
        properties: {
          walletType: { type: "string", enum: ["ethers", "viem"], description: "Wallet library type" }
        },
        required: ["walletType"]
      }
    }
  ];

  getTools(): Tool[] {
    return this.tools;
  }

  async executeTool(name: string, args: any): Promise<any> {
    switch (name) {
      case "implement_concurrent_transactions":
        return this.implementConcurrentTransactions(args);
      case "optimize_nonce_management":
        return this.optimizeNonceManagement(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private async implementConcurrentTransactions(args: any) {
    const { transactionCount } = args;
    
    const code = `
// === MONAD MIGRATION: Concurrent Transaction Implementation ===

import { ethers } from "ethers";

class MonadTransactionManager {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private nonceManager: Map<string, number> = new Map();
  
  constructor(privateKey: string) {
    this.provider = new ethers.JsonRpcProvider("${MonadNetworkConfig.TESTNET.rpcUrl}");
    this.signer = new ethers.Wallet(privateKey, this.provider);
  }
  
  // Submit multiple transactions concurrently
  async submitConcurrentTransactions(transactions: Array<{
    to: string;
    value?: bigint;
    data?: string;
    gasLimit?: bigint;
  }>) {
    console.log(\`Submitting \${transactions.length} transactions concurrently...\`);
    
    // Get initial nonce
    const initialNonce = await this.provider.getTransactionCount(this.signer.address);
    
    // Prepare all transactions with managed nonces
    const txPromises = transactions.map(async (tx, index) => {
      const txParams = {
        to: tx.to,
        value: tx.value || 0n,
        data: tx.data || "0x",
        gasLimit: tx.gasLimit || ${MonadNetworkConfig.GAS_CONFIG.standardTransferGas.toString()}n,
        gasPrice: ${MonadNetworkConfig.GAS_CONFIG.defaultGasPrice.toString()}n,
        nonce: initialNonce + index,
        chainId: ${MonadNetworkConfig.TESTNET.chainId}
      };
      
      return this.signer.sendTransaction(txParams);
    });
    
    // Submit all transactions concurrently
    const submittedTxs = await Promise.all(txPromises);
    console.log(\`✅ Submitted \${submittedTxs.length} transactions\`);
    
    // Wait for all confirmations
    const receipts = await Promise.all(
      submittedTxs.map(tx => tx.wait())
    );
    
    console.log(\`✅ All \${receipts.length} transactions confirmed\`);
    return receipts;
  }
  
  // Batch similar transactions for gas efficiency
  async batchSimilarTransactions(
    recipients: string[],
    amounts: bigint[],
    gasLimitPerTx: bigint = ${MonadNetworkConfig.GAS_CONFIG.standardTransferGas.toString()}n
  ) {
    if (recipients.length !== amounts.length) {
      throw new Error("Recipients and amounts arrays must have same length");
    }
    
    const transactions = recipients.map((recipient, index) => ({
      to: recipient,
      value: amounts[index],
      gasLimit: gasLimitPerTx
    }));
    
    return this.submitConcurrentTransactions(transactions);
  }
  
  // Example: ${transactionCount} concurrent transfers
  async exampleConcurrentTransfers() {
    const recipients = Array(${transactionCount}).fill(null).map((_, i) => 
      \`0x\${(i + 1).toString(16).padStart(40, '0')}\`
    );
    const amounts = Array(${transactionCount}).fill(ethers.parseEther("0.01"));
    
    return this.batchSimilarTransactions(recipients, amounts);
  }
}

// Usage example
const txManager = new MonadTransactionManager(process.env.PRIVATE_KEY!);
const results = await txManager.exampleConcurrentTransfers();
console.log(\`Processed \${results.length} transactions\`);`;

    return {
      content: [{
        type: "text",
        text: `## Concurrent Transaction Implementation

### Transaction Manager:
\`\`\`typescript
${code}
\`\`\`

### Key Features:
- Concurrent transaction submission
- Local nonce management
- Batch processing for similar transactions
- Optimized for Monad's performance
- Error handling and confirmation tracking`
      }]
    };
  }

  private async optimizeNonceManagement(args: any) {
    const { walletType } = args;
    
    const nonceManager = `
// === MONAD MIGRATION: Advanced Nonce Management ===

class MonadNonceManager {
  private localNonces: Map<string, number> = new Map();
  private provider: any;
  private pendingTransactions: Map<string, Set<number>> = new Map();
  
  constructor(provider: any) {
    this.provider = provider;
  }
  
  // Get next available nonce for address
  async getNextNonce(address: string): Promise<number> {
    // Initialize if not cached
    if (!this.localNonces.has(address)) {
      const chainNonce = await this.provider.getTransactionCount(address);
      this.localNonces.set(address, chainNonce);
    }
    
    const currentNonce = this.localNonces.get(address)!;
    
    // Find next available nonce not in pending
    let nextNonce = currentNonce;
    const pending = this.pendingTransactions.get(address) || new Set();
    
    while (pending.has(nextNonce)) {
      nextNonce++;
    }
    
    // Mark nonce as pending
    if (!this.pendingTransactions.has(address)) {
      this.pendingTransactions.set(address, new Set());
    }
    this.pendingTransactions.get(address)!.add(nextNonce);
    
    // Update local nonce
    this.localNonces.set(address, Math.max(currentNonce, nextNonce + 1));
    
    return nextNonce;
  }
  
  // Mark transaction as confirmed
  confirmTransaction(address: string, nonce: number) {
    const pending = this.pendingTransactions.get(address);
    if (pending) {
      pending.delete(nonce);
    }
  }
  
  // Reset nonce cache (use when transactions fail)
  async resetNonceCache(address: string) {
    const chainNonce = await this.provider.getTransactionCount(address);
    this.localNonces.set(address, chainNonce);
    this.pendingTransactions.set(address, new Set());
  }
  
  // Get transaction parameters with managed nonce
  async getTransactionParams(address: string, tx: any) {
    const nonce = await this.getNextNonce(address);
    
    return {
      ...tx,
      nonce,
      gasPrice: ${MonadNetworkConfig.GAS_CONFIG.defaultGasPrice.toString()}n,
      chainId: ${MonadNetworkConfig.TESTNET.chainId}
    };
  }
}

// ${walletType} Integration
${walletType === 'ethers' ? `
class MonadEthersHelper {
  private nonceManager: MonadNonceManager;
  private signer: ethers.Wallet;
  
  constructor(privateKey: string, provider: ethers.Provider) {
    this.signer = new ethers.Wallet(privateKey, provider);
    this.nonceManager = new MonadNonceManager(provider);
  }
  
  async sendTransaction(tx: any) {
    const txParams = await this.nonceManager.getTransactionParams(this.signer.address, tx);
    const sentTx = await this.signer.sendTransaction(txParams);
    
    // Confirm nonce when transaction is mined
    sentTx.wait().then(() => {
      this.nonceManager.confirmTransaction(this.signer.address, txParams.nonce);
    });
    
    return sentTx;
  }
}
` : `
class MonadViemHelper {
  private nonceManager: MonadNonceManager;
  private account: any;
  private client: any;
  
  constructor(account: any, client: any) {
    this.account = account;
    this.client = client;
    this.nonceManager = new MonadNonceManager(client);
  }
  
  async sendTransaction(tx: any) {
    const nonce = await this.nonceManager.getNextNonce(this.account.address);
    
    const hash = await this.client.sendTransaction({
      ...tx,
      account: this.account,
      nonce,
      gasPrice: ${MonadNetworkConfig.GAS_CONFIG.defaultGasPrice.toString()},
      chain: { id: ${MonadNetworkConfig.TESTNET.chainId} }
    });
    
    // Confirm nonce when transaction is mined
    this.client.waitForTransactionReceipt({ hash }).then(() => {
      this.nonceManager.confirmTransaction(this.account.address, nonce);
    });
    
    return hash;
  }
}
`}

// Usage example
const helper = new Monad${walletType === 'ethers' ? 'Ethers' : 'Viem'}Helper(/* parameters */);
const txResults = await Promise.all([
  helper.sendTransaction({ to: "0x...", value: "1000000000000000000" }),
  helper.sendTransaction({ to: "0x...", value: "2000000000000000000" }),
  helper.sendTransaction({ to: "0x...", value: "3000000000000000000" })
]);`;

    return {
      content: [{
        type: "text",
        text: `## Advanced Nonce Management

### Nonce Manager Implementation:
\`\`\`typescript
${nonceManager}
\`\`\`

### Benefits:
- Local nonce tracking for concurrent transactions
- Automatic nonce gap prevention
- Transaction confirmation tracking
- Error recovery mechanisms
- Optimized for ${walletType} library`
      }]
    };
  }
} 