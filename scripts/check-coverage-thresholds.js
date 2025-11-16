#!/usr/bin/env node

/**
 * Проверка порогов покрытия кода для критичных файлов
 * Блокирует CI/CD если покрытие ниже установленных минимумов
 */

const fs = require('fs');
const path = require('path');

// Минимальные требования для критичных файлов
const CRITICAL_THRESHOLDS = {
  'src/stores/': {
    lines: 90,
    functions: 90,
    branches: 85,
    statements: 90,
  },
  'src/components/battle/enhanced/': {
    lines: 90,
    functions: 90,
    branches: 85,
    statements: 90,
  },
};

// Цвета для вывода
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

function loadCoverageSummary() {
  const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
  
  if (!fs.existsSync(coveragePath)) {
    console.error(`${colors.red}❌ Coverage summary not found at: ${coveragePath}${colors.reset}`);
    process.exit(1);
  }

  return JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
}

function checkCoverage(coverage) {
  let hasFailures = false;
  const results = [];

  // Проверяем каждый критичный путь
  Object.entries(CRITICAL_THRESHOLDS).forEach(([pathPattern, thresholds]) => {
    const matchingFiles = Object.entries(coverage)
      .filter(([filePath]) => filePath.includes(pathPattern) && filePath !== 'total')
      .map(([filePath, metrics]) => ({ filePath, metrics }));

    if (matchingFiles.length === 0) {
      results.push({
        path: pathPattern,
        status: 'warning',
        message: 'No files found',
      });
      return;
    }

    // Вычисляем средние метрики для всех файлов в пути
    const aggregated = {
      lines: 0,
      functions: 0,
      branches: 0,
      statements: 0,
    };

    matchingFiles.forEach(({ metrics }) => {
      aggregated.lines += metrics.lines.pct;
      aggregated.functions += metrics.functions.pct;
      aggregated.branches += metrics.branches.pct;
      aggregated.statements += metrics.statements.pct;
    });

    const count = matchingFiles.length;
    Object.keys(aggregated).forEach(key => {
      aggregated[key] = (aggregated[key] / count).toFixed(2);
    });

    // Проверяем пороги
    const failures = [];
    Object.entries(thresholds).forEach(([metric, threshold]) => {
      if (aggregated[metric] < threshold) {
        failures.push({
          metric,
          actual: aggregated[metric],
          threshold,
        });
        hasFailures = true;
      }
    });

    results.push({
      path: pathPattern,
      status: failures.length > 0 ? 'fail' : 'pass',
      metrics: aggregated,
      thresholds,
      failures,
      fileCount: count,
    });
  });

  return { hasFailures, results };
}

function printResults(results) {
  console.log(`\n${colors.bold}${colors.blue}📊 Coverage Threshold Check Results${colors.reset}\n`);
  console.log('═'.repeat(80));

  results.forEach(result => {
    const statusIcon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    const statusColor = result.status === 'pass' ? colors.green : result.status === 'fail' ? colors.red : colors.yellow;

    console.log(`\n${statusIcon} ${colors.bold}${result.path}${colors.reset}`);
    
    if (result.status === 'warning') {
      console.log(`   ${colors.yellow}${result.message}${colors.reset}`);
      return;
    }

    console.log(`   Files checked: ${result.fileCount}`);
    console.log(`\n   Current Coverage:`);
    
    Object.entries(result.metrics).forEach(([metric, value]) => {
      const threshold = result.thresholds[metric];
      const passed = value >= threshold;
      const icon = passed ? '✓' : '✗';
      const color = passed ? colors.green : colors.red;
      
      console.log(`   ${color}${icon}${colors.reset} ${metric.padEnd(12)} ${value}% ${color}(threshold: ${threshold}%)${colors.reset}`);
    });

    if (result.failures.length > 0) {
      console.log(`\n   ${colors.red}${colors.bold}Failures:${colors.reset}`);
      result.failures.forEach(failure => {
        const gap = (failure.threshold - failure.actual).toFixed(2);
        console.log(`   ${colors.red}•${colors.reset} ${failure.metric}: ${failure.actual}% (need ${gap}% more to reach ${failure.threshold}%)`);
      });
    }
  });

  console.log('\n' + '═'.repeat(80));
}

function main() {
  console.log(`${colors.bold}${colors.blue}🔍 Checking coverage thresholds for critical files...${colors.reset}`);

  try {
    const coverage = loadCoverageSummary();
    const { hasFailures, results } = checkCoverage(coverage);

    printResults(results);

    if (hasFailures) {
      console.log(`\n${colors.red}${colors.bold}❌ Coverage check FAILED!${colors.reset}`);
      console.log(`${colors.red}Critical files must have at least 90% coverage for lines, functions, and statements.${colors.reset}`);
      console.log(`${colors.yellow}Please add more tests to reach the required coverage thresholds.${colors.reset}\n`);
      process.exit(1);
    } else {
      console.log(`\n${colors.green}${colors.bold}✅ All coverage thresholds met!${colors.reset}\n`);
      process.exit(0);
    }
  } catch (error) {
    console.error(`${colors.red}❌ Error checking coverage:${colors.reset}`, error.message);
    process.exit(1);
  }
}

main();
