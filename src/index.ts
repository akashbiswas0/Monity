#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { MonadNetworkConfig } from "./config/monad-config.js";
import { ContractMigrationTool } from "./tools/contract-migration.js";
import { FrontendMigrationTool } from "./tools/frontend-migration.js";
import { GasOptimizationTool } from "./tools/gas-optimization.js";
import { RPCOptimizationTool } from "./tools/rpc-optimization.js";
import { IndexerMigrationTool } from "./tools/indexer-migration.js";
import { TransactionOptimizationTool } from "./tools/transaction-optimization.js";
import { ValidationTool } from "./tools/validation.js";

/**
 * Monad Migration MCP Server
 * 
 * This server provides comprehensive tools for migrating EVM applications
 * to Monad blockchain with performance optimizations.
 * 
 * Key features:
 * - Smart contract migration with Monad-specific optimizations
 * - Frontend integration updates for better performance
 * - Gas optimization strategies
 * - RPC call batching and optimization
 * - Indexer integration guidance
 * - Transaction optimization techniques
 */
class MonadMigrationServer {
  private server: Server;
  private tools: Map<string, any>;

  constructor() {
    this.server = new Server(
      {
        name: "monad-migration-server",
        version: "1.0.0",
      }
    );

    this.tools = new Map();
    this.initializeTools();
    this.setupHandlers();
  }

  private initializeTools(): void {
    // Initialize all migration tools
    const tools = [
      new ContractMigrationTool(),
      new FrontendMigrationTool(),
      new GasOptimizationTool(),
      new RPCOptimizationTool(),
      new IndexerMigrationTool(),
      new TransactionOptimizationTool(),
      new ValidationTool(),
    ];

    tools.forEach(tool => {
      tool.getTools().forEach((t: Tool) => {
        this.tools.set(t.name, tool);
      });
    });
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const allTools: Tool[] = [];
      
      for (const tool of this.tools.values()) {
        allTools.push(...tool.getTools());
      }

      return { tools: allTools };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      const tool = this.tools.get(name);
      if (!tool) {
        throw new Error(`Tool ${name} not found`);
      }

      return await tool.executeTool(name, args);
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Monad Migration MCP Server running on stdio");
  }
}

// Start the server
const server = new MonadMigrationServer();
server.run().catch(console.error); 