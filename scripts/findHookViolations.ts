/**
 * Скрипт для поиска всех нарушений React Rules of Hooks в проекте
 * 
 * Запуск: npx tsx scripts/findHookViolations.ts
 */

import { ReactHooksDebugger } from '../src/utils/reactHooksDebugger';
import * as fs from 'fs';
import * as path from 'path';

interface FileAnalysis {
  file: string;
  hasViolations: boolean;
  violations: any[];
  recommendations: string[];
}

class ProjectHooksScanner {
  private results: FileAnalysis[] = [];
  private scannedFiles = 0;
  private violationFiles = 0;

  /**
   * Сканирует директорию рекурсивно
   */
  scanDirectory(dir: string, extensions: string[] = ['.tsx', '.ts']): void {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Пропускаем node_modules и другие служебные папки
        if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
          this.scanDirectory(filePath, extensions);
        }
      } else if (extensions.some(ext => file.endsWith(ext))) {
        this.scanFile(filePath);
      }
    });
  }

  /**
   * Сканирует отдельный файл
   */
  scanFile(filePath: string): void {
    try {
      const code = fs.readFileSync(filePath, 'utf-8');
      
      // Быстрая проверка
      if (!ReactHooksDebugger.quickCheck(code)) {
        this.scannedFiles++;
        return;
      }

      // Детальный анализ
      const analysis = ReactHooksDebugger.analyzeComponent(code, filePath);
      
      if (analysis.hasViolations) {
        this.results.push({
          file: filePath,
          hasViolations: true,
          violations: analysis.violations,
          recommendations: analysis.recommendations,
        });
        this.violationFiles++;
      }

      this.scannedFiles++;
    } catch (error) {
      console.error(`Ошибка при сканировании ${filePath}:`, error);
    }
  }

  /**
   * Генерирует отчет
   */
  generateReport(): string {
    let report = '\n==============================================\n';
    report += '🔍 АНАЛИЗ ПРОЕКТА НА НАРУШЕНИЯ REACT HOOKS\n';
    report += '==============================================\n\n';
    report += `📁 Всего файлов: ${this.scannedFiles}\n`;
    report += `⚠️  Файлов с нарушениями: ${this.violationFiles}\n\n`;

    if (this.violationFiles === 0) {
      report += '✅ Нарушений не найдено!\n';
      return report;
    }

    report += '==============================================\n';
    report += 'ФАЙЛЫ С КРИТИЧЕСКИМИ НАРУШЕНИЯМИ:\n';
    report += '==============================================\n\n';

    this.results.forEach((result, index) => {
      report += `${index + 1}. ${result.file}\n`;
      report += `   Нарушений: ${result.violations.length}\n\n`;

      result.violations.forEach((v, i) => {
        report += `   ${i + 1}. [${v.type.toUpperCase()}] ${v.hook} (строка ${v.line})\n`;
        report += `      Проблема: ${v.context}\n`;
        report += `      ✨ Решение: ${v.suggestion}\n\n`;
      });

      if (result.recommendations.length > 0) {
        report += '   💡 Рекомендации:\n';
        result.recommendations.forEach(rec => {
          report += `      • ${rec}\n`;
        });
        report += '\n';
      }

      report += '----------------------------------------------\n\n';
    });

    return report;
  }

  /**
   * Сохраняет отчет в файл
   */
  saveReport(outputPath: string): void {
    const report = this.generateReport();
    fs.writeFileSync(outputPath, report, 'utf-8');
    console.log(`\n📄 Отчет сохранен: ${outputPath}`);
  }
}

// Запуск сканирования
const scanner = new ProjectHooksScanner();
const srcPath = path.join(process.cwd(), 'src');

console.log('🔍 Начинаю сканирование проекта...\n');
scanner.scanDirectory(srcPath);

const report = scanner.generateReport();
console.log(report);

// Сохраняем отчет
const outputPath = path.join(process.cwd(), 'hooks-violations-report.txt');
scanner.saveReport(outputPath);

console.log('\n✅ Сканирование завершено!');
console.log('\n💡 Следующие шаги:');
console.log('   1. Откройте hooks-violations-report.txt');
console.log('   2. Исправьте критические нарушения');
console.log('   3. Используйте ReactHooksDebugger.quickCheck() для проверки кода\n');
