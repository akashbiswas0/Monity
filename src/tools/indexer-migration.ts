import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { MonadNetworkConfig } from "../config/monad-config.js";

export class IndexerMigrationTool {
  private tools: Tool[] = [
    {
      name: "setup_envio_indexer",
      description: "Set up Envio HyperIndex for Monad",
      inputSchema: {
        type: "object",
        properties: {
          contractAddress: { type: "string" },
          events: { type: "array", items: { type: "string" } }
        },
        required: ["contractAddress", "events"]
      }
    },
    {
      name: "configure_goldsky_subgraph",
      description: "Configure Goldsky subgraph for Monad",
      inputSchema: {
        type: "object",
        properties: {
          contractName: { type: "string" },
          events: { type: "array", items: { type: "string" } }
        },
        required: ["contractName", "events"]
      }
    }
  ];

  getTools(): Tool[] {
    return this.tools;
  }

  async executeTool(name: string, args: any): Promise<any> {
    switch (name) {
      case "setup_envio_indexer":
        return this.setupEnvioIndexer(args);
      case "configure_goldsky_subgraph":
        return this.configureGoldskySubgraph(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private async setupEnvioIndexer(args: any) {
    const { contractAddress, events } = args;
    
    const config = `# Envio HyperIndex Configuration for Monad
name: monad-indexer
networks:
- id: ${MonadNetworkConfig.INDEXER_CONFIGS.ENVIO.networkId}  # Monad Testnet
  start_block: 0
  contracts:
  - name: MyContract
    address:
    - ${contractAddress}
    handler: src/EventHandlers.ts
    events:
${events.map(event => `    - event: ${event}`).join('\n')}`;

    const handlers = `import { MyContract, MyContract_${events[0]?.split('(')[0]} } from "generated";

${events.map(event => {
  const eventName = event.split('(')[0];
  return `
// Handler for ${eventName}
MyContract.${eventName}.handler(async ({ event, context }) => {
  const entity: MyContract_${eventName} = {
    id: \`\${event.chainId}_\${event.block.number}_\${event.logIndex}\`,
    // Add event parameters here
  };
  
  context.MyContract_${eventName}.set(entity);
});`;
}).join('')}`;

    return {
      content: [{
        type: "text",
        text: `## Envio HyperIndex Setup for Monad

### Configuration (config.yaml):
\`\`\`yaml
${config}
\`\`\`

### Event Handlers (src/EventHandlers.ts):
\`\`\`typescript
${handlers}
\`\`\`

### Commands:
\`\`\`bash
npm install -g envio
envio init
# Replace generated config with above
envio dev  # Start indexing
\`\`\``
      }]
    };
  }

  private async configureGoldskySubgraph(args: any) {
    const { contractName, events } = args;
    
    const subgraphYaml = `specVersion: 1.2.0
indexerHints:
  prune: auto
schema:
  file: ./schema.graphql
dataSources:
  - kind: ethereum
    name: ${contractName}
    network: ${MonadNetworkConfig.INDEXER_CONFIGS.GOLDSKY.networkIdentifier}
    source:
      address: "CONTRACT_ADDRESS_HERE"
      abi: ${contractName}ABI
      startBlock: 0
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.9
      language: wasm/assemblyscript
      entities:
${events.map(event => `        - ${event.split('(')[0]}`).join('\n')}
      abis:
        - name: ${contractName}ABI
          file: ./abis/${contractName}.json
      eventHandlers:
${events.map(event => `        - event: ${event}
          handler: handle${event.split('(')[0]}`).join('\n')}
      file: ./src/mapping.ts`;

    return {
      content: [{
        type: "text",
        text: `## Goldsky Subgraph Configuration

### Subgraph Manifest (subgraph.yaml):
\`\`\`yaml
${subgraphYaml}
\`\`\`

### Deploy Command:
\`\`\`bash
goldsky subgraph deploy <subgraph-name> --path .
\`\`\`

### Network: ${MonadNetworkConfig.INDEXER_CONFIGS.GOLDSKY.networkIdentifier}`
      }]
    };
  }
} 