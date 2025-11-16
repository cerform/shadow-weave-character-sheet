#!/usr/bin/env node

/**
 * Скрипт для проверки циклических зависимостей
 * Используется в pre-commit хуке и CI/CD
 */

const madge = require('madge');
const path = require('path');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  error: (msg) => console.error(`${colors.red}❌ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.warn(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}\n`),
};

async function checkCircularDependencies() {
  log.title('🔍 Checking for circular dependencies...');

  try {
    // Конфигурация madge
    const config = {
      fileExtensions: ['ts', 'tsx', 'js', 'jsx'],
      excludeRegExp: [
        /node_modules/,
        /\.test\./,
        /\.spec\./,
        /\.stories\./,
        /__tests__/,
        /__mocks__/,
        /vite\.config/,
        /vitest\.config/,
        /jest\.config/,
      ],
      tsConfig: path.join(__dirname, '../tsconfig.json'),
      detectiveOptions: {
        ts: {
          skipTypeImports: true,
        },
        tsx: {
          skipTypeImports: true,
        },
      },
    };

    // Проверяем src директорию
    log.info('Analyzing src/ directory...');
    const res = await madge('src', config);

    // Получаем циклические зависимости
    const circular = res.circular();

    if (circular.length === 0) {
      log.success('No circular dependencies found! 🎉');
      log.info(`Analyzed ${res.obj().length} files`);
      return { success: true, circular: [] };
    }

    // Есть циклические зависимости
    log.error(`Found ${circular.length} circular dependencies!\n`);

    // Группируем по критичности
    const critical = [];
    const moderate = [];
    const low = [];

    circular.forEach((cycle, index) => {
      const cycleLength = cycle.length;
      const severity = cycleLength >= 4 ? 'critical' : cycleLength >= 3 ? 'moderate' : 'low';

      const cycleInfo = {
        index: index + 1,
        cycle,
        severity,
        length: cycleLength,
      };

      if (severity === 'critical') critical.push(cycleInfo);
      else if (severity === 'moderate') moderate.push(cycleInfo);
      else low.push(cycleInfo);
    });

    // Выводим отсортированные циклы
    const printCycle = (cycleInfo) => {
      const { index, cycle, severity, length } = cycleInfo;
      const severityEmoji = {
        critical: '🔴',
        moderate: '🟡',
        low: '🟢',
      };

      console.log(`\n${severityEmoji[severity]} Cycle #${index} (${severity}, ${length} files):`);
      console.log('  ' + cycle.join('\n  ↓ \n  '));
      console.log('  ↓ \n  ' + cycle[0] + ' (cycle completes)');
    };

    if (critical.length > 0) {
      log.error(`\n🔴 CRITICAL (${critical.length}): Long chains, high risk of Error #185`);
      critical.forEach(printCycle);
    }

    if (moderate.length > 0) {
      log.warning(`\n🟡 MODERATE (${moderate.length}): Medium chains, should be fixed`);
      moderate.forEach(printCycle);
    }

    if (low.length > 0) {
      log.info(`\n🟢 LOW (${low.length}): Short chains, lower priority`);
      low.forEach(printCycle);
    }

    // Рекомендации по исправлению
    console.log('\n' + '═'.repeat(80));
    log.title('💡 How to fix circular dependencies:');
    console.log('1. Extract common code into a separate file');
    console.log('2. Use dependency injection');
    console.log('3. Move shared types to a types-only file');
    console.log('4. Consider restructuring your component hierarchy');
    console.log('\nExample:');
    console.log('  ❌ A.tsx imports B.tsx, B.tsx imports A.tsx');
    console.log('  ✅ Create C.tsx with shared code, both A and B import from C');
    console.log('═'.repeat(80) + '\n');

    // Генерируем граф (опционально, если установлен graphviz)
    try {
      const imagePath = path.join(__dirname, '../circular-deps-graph.svg');
      await res.image(imagePath);
      log.info(`Dependency graph saved to: circular-deps-graph.svg`);
    } catch (imageError) {
      log.warning('Could not generate graph image (graphviz not installed)');
      log.info('To enable graphs: brew install graphviz (or apt-get install graphviz)');
    }

    return {
      success: false,
      circular,
      critical: critical.length,
      moderate: moderate.length,
      low: low.length,
    };
  } catch (error) {
    log.error('Failed to analyze dependencies:');
    console.error(error);
    return { success: false, error: error.message };
  }
}

// Запуск с обработкой exit code
checkCircularDependencies().then((result) => {
  if (!result.success) {
    process.exit(1); // Блокируем коммит/CI
  }
  process.exit(0);
});
