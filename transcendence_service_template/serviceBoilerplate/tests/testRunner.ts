#!/usr/bin/env node
/**
 * Master Test Runner
 * 
 * Orchestrates all test layers in the __service__ service:
 * - Domain Layer Tests
 * - Application Layer Tests  
 * - Infrastructure Layer Tests
 * - Presentation Layer Tests
 * - End-to-End Tests
 */

import { spawn } from 'node:child_process';
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';

// ANSI color codes for rich console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

// Test layer configuration
interface TestLayer {
  name: string;
  path: string;
  description: string;
  dependencies?: string[];
  color: string;
  env?: Record<string, string>; // Layer-specific environment variables
}

const testLayers: Record<string, TestLayer> = {
  domain: {
    name: 'Domain',
    path: 'tests/domain/domainTestRunner.ts',
    description: 'Entity and value object tests',
    color: colors.blue,
  },
  application: {
    name: 'Application',
    path: 'tests/application/applicationTestRunner.ts', 
    description: 'Use case and business logic tests',
    dependencies: ['domain'],
    color: colors.green,
  },
  infrastructure: {
    name: 'Infrastructure',
    path: 'tests/infrastructure/infrastructureTestRunner.ts',
    description: 'Database and external service tests',
    dependencies: ['domain', 'application'],
    color: colors.yellow,
    env: {
      SQLITE_FILE: ':memory:', // Use in-memory SQLite for tests
    },
  },
  presentation: {
    name: 'Presentation',
    path: 'tests/presentation/presentationTestRunner.ts',
    description: 'Controller and HTTP endpoint tests',
    dependencies: ['domain', 'application'],
    color: colors.magenta,
    env: {
      __SERVICE__SERVICE_PORT: '0', // Use random available port
    },
  },
  e2e: {
    name: 'End-to-End',
    path: 'tests/e2e/e2eTestRunner.ts',
    description: 'Full system integration tests',
    dependencies: ['domain', 'application', 'infrastructure', 'presentation'],
    color: colors.cyan,
    env: {
      __SERVICE__SERVICE_PORT: '0', // Use random available port
      SQLITE_FILE: ':memory:', // Use in-memory database for tests
    },
  },
};

// Parse command line arguments
const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    layer: {
      type: 'string',
      short: 'l',
      multiple: true,
    },
    exclude: {
      type: 'string',
      short: 'e',
      multiple: true,
    },
    parallel: {
      type: 'boolean',
      short: 'p',
      default: false,
    },
    watch: {
      type: 'boolean',
      short: 'w',
      default: false,
    },
    verbose: {
      type: 'boolean',
      short: 'v',
      default: false,
    },
    'fail-fast': {
      type: 'boolean',
      short: 'f',
      default: false,
    },
    'dry-run': {
      type: 'boolean',
      short: 'd',
      default: false,
    },
    env: {
      type: 'string',
      multiple: true,
      short: 'E',
    },
    help: {
      type: 'boolean',
      short: 'h',
      default: false,
    },
  },
  allowPositionals: true,
});

// Help message
function showHelp() {
  console.log(`
${colors.bright}${colors.blue}__Service__ Service Master Test Runner${colors.reset}

${colors.bright}USAGE:${colors.reset}
  npx tsx tests/testRunner.ts [OPTIONS] [LAYERS...]

${colors.bright}LAYERS:${colors.reset}`);

  Object.entries(testLayers).forEach(([key, layer]) => {
    const deps = layer.dependencies ? ` (depends on: ${layer.dependencies.join(', ')})` : '';
    console.log(`  ${layer.color}${key.padEnd(12)}${colors.reset} ${layer.description}${colors.gray}${deps}${colors.reset}`);
  });

  console.log(`
${colors.bright}OPTIONS:${colors.reset}
  -l, --layer <layer>     Run specific layer(s) (can be used multiple times)
  -e, --exclude <layer>   Exclude specific layer(s) (can be used multiple times)
  -p, --parallel          Run layers in parallel (ignores dependencies)
  -w, --watch             Run in watch mode
  -v, --verbose           Verbose output
  -f, --fail-fast         Stop on first failure
  -d, --dry-run           Show what would be executed without running
  -E, --env <KEY=VALUE>   Override environment variables (can be used multiple times)
  -h, --help              Show this help message

${colors.bright}EXAMPLES:${colors.reset}
  npx tsx tests/testRunner.ts                    # Run all tests in dependency order
  npx tsx tests/testRunner.ts domain application # Run specific layers
  npx tsx tests/testRunner.ts -l domain -l app   # Run specific layers (alternative syntax)
  npx tsx tests/testRunner.ts -e e2e             # Run all except e2e tests
  npx tsx tests/testRunner.ts -p                 # Run all tests in parallel
  npx tsx tests/testRunner.ts -w domain          # Watch domain tests
  npx tsx tests/testRunner.ts -d                 # Dry run to see execution plan
  npx tsx tests/testRunner.ts -E SQLITE_FILE=./test.db   # Override database file
  npx tsx tests/testRunner.ts e2e -E __SERVICE__SERVICE_PORT=3001   # Run e2e tests with custom port
`);
}

// Validate test runner files exist
function validateTestRunners(layers: string[]): boolean {
  let allExist = true;
  
  for (const layerKey of layers) {
    const layer = testLayers[layerKey];
    if (!layer) {
      console.error(`${colors.red}Error:${colors.reset} Unknown layer '${layerKey}'`);
      allExist = false;
      continue;
    }
    
    const fullPath = resolve(process.cwd(), layer.path);
    if (!existsSync(fullPath)) {
      console.error(`${colors.red}Error:${colors.reset} Test runner not found: ${layer.path}`);
      allExist = false;
    }
  }
  
  return allExist;
}

// Determine which layers to run
function determineLayersToRun(): string[] {
  // If specific layers requested via positionals or --layer flag
  const requestedLayers = [
    ...(positionals || []),
    ...(values.layer || [])
  ].filter(Boolean);

  let layersToRun: string[];
  
  if (requestedLayers.length > 0) {
    layersToRun = requestedLayers;
  } else {
    // Run all layers by default
    layersToRun = Object.keys(testLayers);
  }

  // Apply exclusions
  if (values.exclude) {
    layersToRun = layersToRun.filter(layer => !values.exclude!.includes(layer));
  }

  // Validate layer names
  const invalidLayers = layersToRun.filter(layer => !testLayers[layer]);
  if (invalidLayers.length > 0) {
    console.error(`${colors.red}Error:${colors.reset} Invalid layer(s): ${invalidLayers.join(', ')}`);
    console.error(`Valid layers: ${Object.keys(testLayers).join(', ')}`);
    process.exit(1);
  }

  return layersToRun;
}

// Parse environment variable overrides from CLI
function parseEnvOverrides(envArgs: string[] = []): Record<string, string> {
  const envOverrides: Record<string, string> = {};
  
  for (const envArg of envArgs) {
    const [key, ...valueParts] = envArg.split('=');
    const value = valueParts.join('='); // Handle values with = in them
    
    if (!key || value === undefined) {
      console.error(`${colors.red}Error:${colors.reset} Invalid environment variable format: ${envArg}`);
      console.error(`Expected format: KEY=VALUE`);
      process.exit(1);
    }
    
    envOverrides[key] = value;
  }
  
  return envOverrides;
}

// Sort layers by dependency order
function sortLayersByDependencies(layers: string[]): string[] {
  if (values.parallel) {
    return layers; // Don't sort if running in parallel
  }

  const sorted: string[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(layerKey: string) {
    if (visited.has(layerKey)) return;
    if (visiting.has(layerKey)) {
      throw new Error(`Circular dependency detected involving ${layerKey}`);
    }

    visiting.add(layerKey);
    const layer = testLayers[layerKey];
    
    if (layer.dependencies) {
      for (const dep of layer.dependencies) {
        if (layers.includes(dep)) { // Only visit dependencies that are being run
          visit(dep);
        }
      }
    }

    visiting.delete(layerKey);
    visited.add(layerKey);
    sorted.push(layerKey);
  }

  try {
    for (const layer of layers) {
      visit(layer);
    }
    return sorted;
  } catch (error) {
    console.error(`${colors.red}Error:${colors.reset} ${(error as Error).message}`);
    process.exit(1);
  }
}

// Execute a single test layer
function executeTestLayer(layerKey: string, globalEnvOverrides: Record<string, string> = {}): Promise<{ success: boolean; duration: number }> {
  return new Promise((resolve) => {
    const layer = testLayers[layerKey];
    const startTime = Date.now();
    
    console.log(`${layer.color}▶ Running ${layer.name} tests...${colors.reset}`);
    
    if (values.verbose) {
      console.log(`  ${colors.gray}File: ${layer.path}${colors.reset}`);
    }

    // Build environment variables with precedence: process.env < layer.env < globalEnvOverrides
    const testEnv = {
      ...process.env,
      ...(layer.env || {}),
      ...globalEnvOverrides,
      FORCE_COLOR: '1',  // Force color output even when piped
      NO_COLOR: undefined // Remove NO_COLOR if it exists
    };

    // Show environment overrides in verbose mode
    if (values.verbose) {
      const overrides = { ...(layer.env || {}), ...globalEnvOverrides };
      if (Object.keys(overrides).length > 0) {
        console.log(`  ${colors.gray}Environment overrides:${colors.reset}`);
        Object.entries(overrides).forEach(([key, value]) => {
          console.log(`  ${colors.gray}  ${key}=${value}${colors.reset}`);
        });
      }
    }

    const child = spawn('npx', ['tsx', layer.path], {
      stdio: values.verbose ? 'inherit' : 'pipe',
      cwd: process.cwd(),
      env: testEnv,
    });

    let output = '';
    let hasOutput = false;
    
    if (!values.verbose) {
      child.stdout?.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        hasOutput = true;
        
        // If running in parallel or we want real-time output for failures,
        // we can stream it directly with proper indentation
        if (values.parallel && chunk.trim()) {
          // Add indentation to make it clear which layer the output belongs to
          const indentedOutput = chunk
            .split('\n')
            .map((line: string) => line ? `  ${layer.color}[${layer.name}]${colors.reset} ${line}` : line)
            .join('\n');
          process.stdout.write(indentedOutput);
        }
      });
      
      child.stderr?.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        hasOutput = true;
        
        // Stream stderr in parallel mode with proper coloring
        if (values.parallel && chunk.trim()) {
          const indentedOutput = chunk
            .split('\n')
            .map((line: string) => line ? `  ${colors.red}[${layer.name}]${colors.reset} ${line}` : line)
            .join('\n');
          process.stderr.write(indentedOutput);
        }
      });
    }

    child.on('close', (code) => {
      const duration = Date.now() - startTime;
      const success = code === 0;
      
      if (success) {
        console.log(`${layer.color}✓ ${layer.name} tests passed${colors.reset} ${colors.gray}(${duration}ms)${colors.reset}`);
      } else {
        console.log(`${colors.red}✗ ${layer.name} tests failed${colors.reset} ${colors.gray}(${duration}ms)${colors.reset}`);
        
        // Display captured output with preserved colors for failed tests
        if (!values.verbose && !values.parallel && hasOutput) {
          console.log(`\n${colors.gray}${layer.name} Test Output:${colors.reset}`);
          console.log(`${colors.gray}${'─'.repeat(40)}${colors.reset}`);
          
          // Process output to add layer context while preserving colors
          const processedOutput = output
            .split('\n')
            .map((line: string) => {
              if (line.trim()) {
                return `${colors.gray}│${colors.reset} ${line}`;
              }
              return line;
            })
            .join('\n');
            
          console.log(processedOutput);
          console.log(`${colors.gray}${'─'.repeat(40)}${colors.reset}\n`);
        }
      }

      resolve({ success, duration });
    });

    child.on('error', (error) => {
      const duration = Date.now() - startTime;
      console.log(`${colors.red}✗ ${layer.name} tests errored: ${error.message}${colors.reset}`);
      resolve({ success: false, duration });
    });
  });
}

// Main execution function
async function main() {
  if (values.help) {
    showHelp();
    return;
  }

  const layersToRun = determineLayersToRun();
  
  if (layersToRun.length === 0) {
    console.log(`${colors.yellow}No test layers to run.${colors.reset}`);
    return;
  }

  // Validate all test runners exist
  if (!validateTestRunners(layersToRun)) {
    process.exit(1);
  }

  const sortedLayers = sortLayersByDependencies(layersToRun);

  // Show execution plan
  console.log(`${colors.bright}${colors.blue}🧪 __Service__ Service Test Runner${colors.reset}`);
  console.log(`${colors.bright}${'='.repeat(50)}${colors.reset}`);
  
  if (values['dry-run']) {
    console.log(`${colors.bright}DRY RUN - Execution Plan:${colors.reset}`);
  }
  
  console.log(`Mode: ${values.parallel ? `${colors.yellow}Parallel${colors.reset}` : `${colors.green}Sequential${colors.reset}`}`);
  console.log(`Layers: ${sortedLayers.map(key => `${testLayers[key].color}${key}${colors.reset}`).join(' → ')}`);
  
  if (values.watch) {
    console.log(`${colors.cyan}Watch mode enabled${colors.reset}`);
  }
  
  console.log('');

  if (values['dry-run']) {
    console.log(`${colors.bright}Would execute:${colors.reset}`);
    for (const layerKey of sortedLayers) {
      const layer = testLayers[layerKey];
      console.log(`  ${layer.color}${layer.name}${colors.reset}: npx tsx ${layer.path}`);
    }
    return;
  }

  // Parse environment variable overrides
  const globalEnvOverrides = parseEnvOverrides(values.env);
  
  if (Object.keys(globalEnvOverrides).length > 0) {
    console.log(`Global environment overrides: ${Object.entries(globalEnvOverrides).map(([k, v]) => `${k}=${v}`).join(', ')}`);
    console.log('');
  }

  // Execute tests
  const startTime = Date.now();
  let results: { layer: string; success: boolean; duration: number }[] = [];

  if (values.parallel) {
    // Run all layers in parallel
    const promises = sortedLayers.map(async (layerKey) => {
      const result = await executeTestLayer(layerKey, globalEnvOverrides);
      return { layer: layerKey, ...result };
    });
    
    results = await Promise.all(promises);
  } else {
    // Run layers sequentially
    for (const layerKey of sortedLayers) {
      const result = await executeTestLayer(layerKey, globalEnvOverrides);
      results.push({ layer: layerKey, ...result });
      
      if (!result.success && values['fail-fast']) {
        console.log(`${colors.red}Stopping due to failure (--fail-fast enabled)${colors.reset}`);
        break;
      }
    }
  }

  // Summary
  const totalDuration = Date.now() - startTime;
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`\n${colors.bright}Test Summary${colors.reset}`);
  console.log(`${'='.repeat(20)}`);
  console.log(`${colors.green}✓ Passed: ${successful.length}${colors.reset}`);
  console.log(`${colors.red}✗ Failed: ${failed.length}${colors.reset}`);
  console.log(`${colors.gray}Total time: ${totalDuration}ms${colors.reset}`);

  if (failed.length > 0) {
    console.log(`\n${colors.red}Failed layers:${colors.reset}`);
    failed.forEach(({ layer }) => {
      console.log(`  ${colors.red}✗ ${testLayers[layer].name}${colors.reset}`);
    });
    process.exit(1);
  } else {
    console.log(`\n${colors.green}All tests passed! 🎉${colors.reset}`);
  }
}

// Handle process signals
process.on('SIGINT', () => {
  console.log(`\n\n${colors.yellow}🛑 Test runner interrupted${colors.reset}`);
  process.exit(130);
});

process.on('SIGTERM', () => {
  console.log(`\n\n${colors.yellow}🛑 Test runner terminated${colors.reset}`);
  process.exit(143);
});

// Run the main function
main().catch((error) => {
  console.error(`${colors.red}Unexpected error:${colors.reset}`, error);
  process.exit(1);
});
