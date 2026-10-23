#!/usr/bin/env node
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { Command } from "commander";

const program = new Command();

program
  .name("mcp-cli")
  .description("Headless CLI testing utility for Model Context Protocol (MCP) servers")
  .version("1.0.0")
  .option("-c, --command <cmd>", "Executable command to spawn (for stdio, e.g. 'node', 'uv')")
  .option("-a, --args <args>", "Space-separated or quoted arguments for command")
  .option("-u, --url <url>", "Remote SSE URL (for SSE transport, e.g. 'http://localhost:8000/sse')")
  .option("-e, --env <env...>", "Environment variables as KEY=VALUE pairs");

async function createClient(options: any): Promise<Client> {
  const client = new Client(
    { name: "mcp-cli-runner", version: "1.0.0" },
    { capabilities: {} }
  );

  if (options.url) {
    console.log(`Connecting via SSE: ${options.url}`);
    const transport = new SSEClientTransport(new URL(options.url));
    await client.connect(transport);
    return client;
  }

  if (options.command) {
    const envObj: Record<string, string> = { ...process.env as Record<string, string> };
    if (options.env) {
      for (const pair of options.env) {
        const [k, v] = pair.split("=");
        if (k && v !== undefined) envObj[k] = v;
      }
    }

    let commandArgs: string[] = [];
    if (typeof options.args === "string") {
      // Split args respecting quotes or simple spaces
      commandArgs = options.args.match(/(?:[^\s"]+|"[^"]*")+/g)?.map((s: string) => s.replace(/(^"|"$)/g, "")) || [];
    } else if (Array.isArray(options.args)) {
      commandArgs = options.args;
    }

    const transport = new StdioClientTransport({
      command: options.command,
      args: commandArgs,
      env: envObj
    });

    await client.connect(transport);
    return client;
  }

  throw new Error("Must specify either --command <cmd> (stdio) or --url <url> (SSE).");
}

program
  .command("list-tools")
  .description("List all available tools exposed by the MCP server")
  .action(async () => {
    const opts = program.opts();
    const startTime = Date.now();
    try {
      const client = await createClient(opts);
      const res = await client.listTools();
      const elapsed = Date.now() - startTime;

      console.log(`\nFound ${res.tools.length} tool(s) [${elapsed}ms]:\n`);
      for (const tool of res.tools) {
        console.log(`• \x1b[36m${tool.name}\x1b[0m - ${tool.description || "(no description)"}`);
        if (tool.inputSchema?.properties) {
          const props = Object.keys(tool.inputSchema.properties).join(", ");
          console.log(`  Parameters: (${props})`);
        }
      }
      console.log();
      await client.close();
      process.exit(0);
    } catch (err: any) {
      console.error(`\x1b[31mError:\x1b[0m ${err.message}`);
      process.exit(1);
    }
  });

program
  .command("call-tool <name> [jsonArgs...]")
  .description("Execute a specific tool with JSON arguments (string or @file.json)")
  .action(async (name: string, rawArgs: string[]) => {
    const opts = program.opts();
    const jsonArgs = rawArgs?.length ? rawArgs.join(" ") : "";
    let argsObj: any = {};
    if (jsonArgs) {
      try {
        let raw = jsonArgs.trim();
        // Support reading from a file via @filepath.json
        if (raw.startsWith("@")) {
          const fs = await import("fs/promises");
          raw = await fs.readFile(raw.slice(1), "utf-8");
        }
        try {
          argsObj = JSON.parse(raw);
        } catch {
          // If outer quotes were stripped or keys are unquoted, attempt relaxed parsing
          const cleaned = raw.replace(/^['"]|['"]$/g, "").replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
          argsObj = JSON.parse(cleaned);
        }
      } catch (e: any) {
        console.error(`\x1b[31mError:\x1b[0m Invalid JSON arguments: ${e.message}\nReceived: ${jsonArgs}`);
        process.exit(1);
      }
    }

    const startTime = Date.now();
    try {
      const client = await createClient(opts);
      console.log(`Calling tool '\x1b[36m${name}\x1b[0m' with arguments:`, argsObj);

      const res = await client.callTool({
        name,
        arguments: argsObj
      });
      const elapsed = Date.now() - startTime;

      console.log(`\n\x1b[32mExecution Result\x1b[0m [${elapsed}ms]:`);
      if (res.isError) {
        console.log("\x1b[31m[Tool Flagged Error]\x1b[0m");
      }
      for (const item of res.content as any[]) {
        if (item.type === "text") {
          console.log(item.text);
        } else {
          console.log(JSON.stringify(item, null, 2));
        }
      }
      console.log();
      await client.close();
      process.exit(0);
    } catch (err: any) {
      console.error(`\x1b[31mExecution Failed:\x1b[0m ${err.message}`);
      process.exit(1);
    }
  });

program
  .command("list-resources")
  .description("List all resources exposed by the MCP server")
  .action(async () => {
    const opts = program.opts();
    try {
      const client = await createClient(opts);
      const res = await client.listResources();

      console.log(`\nFound ${res.resources.length} resource(s):\n`);
      for (const r of res.resources) {
        console.log(`• \x1b[33m${r.uri}\x1b[0m (${r.name}) - ${r.description || ""}`);
      }
      console.log();
      await client.close();
      process.exit(0);
    } catch (err: any) {
      console.error(`\x1b[31mError:\x1b[0m ${err.message}`);
      process.exit(1);
    }
  });

program
  .command("read-resource <uri>")
  .description("Read contents of a specific resource URI")
  .action(async (uri: string) => {
    const opts = program.opts();
    try {
      const client = await createClient(opts);
      const res = await client.readResource({ uri });

      console.log(`\n\x1b[32mResource Contents\x1b[0m (${uri}):\n`);
      for (const c of res.contents) {
        if ("text" in c) {
          console.log(c.text);
        } else if ("blob" in c) {
          console.log(`[Binary Blob: ${c.blob.length} bytes]`);
        }
      }
      console.log();
      await client.close();
      process.exit(0);
    } catch (err: any) {
      console.error(`\x1b[31mError:\x1b[0m ${err.message}`);
      process.exit(1);
    }
  });

program
  .command("list-prompts")
  .description("List all prompt templates exposed by the MCP server")
  .action(async () => {
    const opts = program.opts();
    try {
      const client = await createClient(opts);
      const res = await client.listPrompts();

      console.log(`\nFound ${res.prompts.length} prompt(s):\n`);
      for (const p of res.prompts) {
        console.log(`• \x1b[35m${p.name}\x1b[0m - ${p.description || ""}`);
      }
      console.log();
      await client.close();
      process.exit(0);
    } catch (err: any) {
      console.error(`\x1b[31mError:\x1b[0m ${err.message}`);
      process.exit(1);
    }
  });

program.parse();
