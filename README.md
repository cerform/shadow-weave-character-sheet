# Welcome to your Lovable project

[![Tests](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/test.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/test.yml)
[![Coverage](https://img.shields.io/badge/coverage-check%20codecov-brightgreen)](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO)
[![Hooks Protection](https://img.shields.io/badge/React%20Error%20%23185-Protected-brightgreen)](./HOOKS_PROTECTION.md)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

## Project info

**URL**: https://lovable.dev/projects/60ca1f07-9f8f-4253-82ad-54f81c6c2667

## 🛡️ Quality & Testing

Этот проект включает комплексную защиту от React Error #185 и автоматическое тестирование:

- ✅ **Unit тесты** с Vitest (35+ тестов)
- ✅ **Coverage thresholds** - 90% для критичных файлов, 80% для остальных
- ✅ **Pre-commit hooks** с Husky и lint-staged
- ✅ **GitHub Actions CI/CD** с автоматическими проверками
- ✅ **Coverage отчеты** на Codecov и GitHub Pages
- ✅ **Автоматическая блокировка PR** при несоответствии требованиям
- ✅ **ESLint** с правилами React Hooks

📚 **Документация:**
- [TESTING.md](./TESTING.md) - полная документация по тестам
- [COVERAGE_THRESHOLDS.md](./COVERAGE_THRESHOLDS.md) - требования к покрытию кода
- [HUSKY_SETUP.md](./HUSKY_SETUP.md) - настройка pre-commit hooks
- [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) - CI/CD интеграция
- [HOOKS_PROTECTION.md](./HOOKS_PROTECTION.md) - защита от React Error #185

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/60ca1f07-9f8f-4253-82ad-54f81c6c2667) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/60ca1f07-9f8f-4253-82ad-54f81c6c2667) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## 🧪 Testing & Development

### Running Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run test -- --coverage

# Run in watch mode
npm run test -- --watch

# Run specific test file
npm run test -- src/stores/__tests__/unifiedBattleStoreExports.test.ts
```

### Pre-commit Checks

Husky automatically runs tests before each commit:

```bash
# First time setup
npx husky init
chmod +x .husky/pre-commit

# Tests will run automatically on git commit
git commit -m "your message"
```

### CI/CD Pipeline

GitHub Actions automatically:
- ✅ Runs all tests on push and pull requests
- ✅ Checks ESLint compliance
- ✅ Generates and publishes coverage reports
- ✅ Validates React Hooks rules
- ✅ Deploys coverage to GitHub Pages

**Note:** Update badge URLs in README.md with your GitHub username and repository name.

See [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) for detailed CI/CD configuration.
