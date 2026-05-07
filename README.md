# Habbittracker

[![CI Passed](https://github.com/zhbforum/Habbittracker/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/zhbforum/Habbittracker/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/zhbforum/Habittracker/graph/badge.svg?token=LQYAI7COLK)](https://codecov.io/gh/zhbforum/Habittracker)
[![Tests](https://img.shields.io/badge/tests-748%20passed-success)](#quality-and-testing-en)
[![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo)](https://expo.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Cross-platform habit tracker focused on daily consistency, measurable progress, and clean UX.

**Language navigation:** [English](#english) | [Українська](#ukrainian) | [Русский](#russian)

---

<a id="english"></a>
## English

### Navigation
- [Overview](#overview-en)
- [Core Features](#core-features-en)
- [Tech Stack](#tech-stack-en)
- [Architecture](#architecture-en)
- [Project Structure](#project-structure-en)
- [Getting Started](#getting-started-en)
- [Scripts](#scripts-en)
- [Quality and Testing](#quality-and-testing-en)
- [CI/CD Workflows](#cicd-workflows-en)
- [Roadmap](#roadmap-en)
- [License](#license-en)

<a id="overview-en"></a>
### Overview
Habbittracker is an Expo + React Native application for building strong habits with:
- onboarding and auth flow (email/password + OAuth-ready architecture)
- habit and habit-group management
- completion tracking and analytics
- achievements, streak-driven motivation, and profile customization
- public profile routing via username and deep-link aware auth callbacks

<a id="core-features-en"></a>
### Core Features
- Personalized onboarding with a guided first run
- Supabase-based authentication and session persistence
- Habit CRUD with frequency rules, reminders, and grouping
- Statistics dashboard with calendar and heatmap views
- Achievement system with catalog + progression engine
- Profile editing with avatar support and theme preferences
- End-to-end Android smoke coverage with Maestro flows

<a id="tech-stack-en"></a>
### Tech Stack
| Layer | Stack |
|---|---|
| App framework | Expo SDK 54, React Native 0.81, React 19 |
| Routing | Expo Router |
| Backend/BaaS | Supabase (`@supabase/supabase-js`) |
| Storage | AsyncStorage, Expo Secure Store |
| UI & motion | React Native core, Reanimated, Gesture Handler, Lucide icons |
| Notifications | Expo Notifications |
| Language | TypeScript |
| Testing | Jest, `jest-expo`, `@testing-library/react-native`, Maestro |
| Tooling | Bun, ESLint, TypeScript compiler |
| CI | GitHub Actions + Codecov upload |

<a id="architecture-en"></a>
### Architecture
The codebase follows a feature-oriented modular layout inspired by FSD principles:
- `app` for route-level entry points
- `features` for user-facing scenarios
- `entities` for reusable domain logic and data contracts
- `shared` for cross-cutting infrastructure (API, theme, UI, config, navigation)

This keeps business logic isolated, testable, and easy to evolve as the product grows.

<a id="project-structure-en"></a>
### Project Structure
```text
.
├─ .github/workflows/        # CI, Android build, Android E2E, release
├─ .maestro/                 # Mobile E2E flows
├─ android/                  # Native Android project
├─ src/
│  ├─ app/                   # Expo Router routes
│  ├─ entities/              # Domain entities (habit, profile, achievement)
│  ├─ features/              # Product features (auth, habits, home, stats, etc.)
│  ├─ shared/                # Shared API, theme, UI, config, helpers
│  ├─ test/                  # Fixtures, mocks, test setup
│  └─ __tests__/             # Root-level smoke tests
├─ coverage/                 # Coverage artifacts
└─ test-reports/             # E2E report output
```

<a id="getting-started-en"></a>
### Getting Started
1. Install prerequisites:
```bash
bun --version
node --version
```
2. Install dependencies:
```bash
bun install
```
3. Configure environment:
```bash
cp .env.example .env
```
4. Set required values in `.env`:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
5. Start the app:
```bash
bun run start
```
6. Run Android build locally (optional):
```bash
bun run android
```

<a id="scripts-en"></a>
### Scripts
| Command | Purpose |
|---|---|
| `bun run start` | Start Expo dev server |
| `bun run android` | Build/run Android app |
| `bun run web` | Start web target |
| `bun run lint` | Lint codebase |
| `bun run typecheck` | TypeScript checks |
| `bun run test` | Run unit/integration tests |
| `bun run test:coverage` | Run tests with coverage |
| `bun run e2e` | Run Maestro E2E suite |
| `bun run e2e:report:junit` | Generate JUnit E2E report |
| `bun run e2e:report:html` | Generate HTML E2E report |

<a id="quality-and-testing-en"></a>
### Quality and Testing
Latest local Jest coverage run (May 7, 2026):
- Statements: `97.12%` (`3580/3686`)
- Branches: `90.79%` (`1913/2107`)
- Functions: `97.73%` (`1037/1061`)
- Lines: `97.11%` (`3471/3574`)

Codecov may display a slightly lower project coverage because it treats partially covered lines as not fully covered.

Automated test status:
- Test suites: `178 passed`
- Tests: `748 passed`

<a id="cicd-workflows-en"></a>
### CI/CD Workflows
GitHub Actions workflows:
- `ci.yml` - typecheck, lint, tests with coverage, Codecov upload
- `android-build.yml` - PR/build validation for Android APK
- `e2e-android.yml` - Android emulator smoke tests with Maestro
- `android-release.yml` - manual release APK build + GitHub Release publication

<a id="roadmap-en"></a>
### Roadmap
- Friends and follow system
- Public profile discovery by nickname with progress comparison
- Shared/social habits for accountability circles
- Team or family challenges with shared streak goals
- Smarter reminders with adaptive schedule suggestions
- Advanced analytics export and longitudinal insights

<a id="license-en"></a>
### License
MIT License. See [LICENSE](LICENSE).

[Back to language navigation](#habbittracker)

---

<a id="ukrainian"></a>
## Українська

### Навігація
- [Огляд](#overview-uk)
- [Ключові можливості](#core-features-uk)
- [Технологічний стек](#tech-stack-uk)
- [Архітектура](#architecture-uk)
- [Структура проєкту](#project-structure-uk)
- [Швидкий старт](#getting-started-uk)
- [Скрипти](#scripts-uk)
- [Якість і тестування](#quality-and-testing-uk)
- [CI/CD процеси](#cicd-workflows-uk)
- [Плани розвитку](#roadmap-uk)
- [Ліцензія](#license-uk)

<a id="overview-uk"></a>
### Огляд
Habbittracker - це застосунок на Expo + React Native для формування стабільних звичок:
- онбординг і auth-процес (email/password + архітектура під OAuth)
- керування звичками та групами звичок
- відстеження виконання і аналітика
- система досягнень, мотивація через streak
- публічний профіль за username і deep-link обробка auth callback

<a id="core-features-uk"></a>
### Ключові можливості
- Персоналізований онбординг з контрольним першим запуском
- Авторизація на Supabase та збереження сесії
- CRUD для звичок з правилами частоти, нагадуваннями та групами
- Екран статистики з календарем і heatmap
- Система досягнень з каталогом і рушієм прогресу
- Редагування профілю, аватар та вибір теми
- Android E2E smoke-перевірки через Maestro

<a id="tech-stack-uk"></a>
### Технологічний стек
| Рівень | Стек |
|---|---|
| Фреймворк | Expo SDK 54, React Native 0.81, React 19 |
| Роутинг | Expo Router |
| Backend/BaaS | Supabase (`@supabase/supabase-js`) |
| Зберігання | AsyncStorage, Expo Secure Store |
| UI та анімації | React Native, Reanimated, Gesture Handler, Lucide icons |
| Нотифікації | Expo Notifications |
| Мова | TypeScript |
| Тестування | Jest, `jest-expo`, `@testing-library/react-native`, Maestro |
| Tooling | Bun, ESLint, TypeScript compiler |
| CI | GitHub Actions + Codecov |

<a id="architecture-uk"></a>
### Архітектура
Кодова база побудована за модульним feature-first підходом, близьким до FSD:
- `app` - точки входу роутів
- `features` - користувацькі сценарії
- `entities` - доменна логіка і контракти даних
- `shared` - спільна інфраструктура (API, theme, UI, config, navigation)

Такий поділ добре масштабується, спрощує тестування і прискорює внесення змін.

<a id="project-structure-uk"></a>
### Структура проєкту
```text
.
├─ .github/workflows/        # CI, Android build, Android E2E, release
├─ .maestro/                 # Мобільні E2E flow
├─ android/                  # Native Android частина
├─ src/
│  ├─ app/                   # Роути Expo Router
│  ├─ entities/              # Доменні сутності (habit, profile, achievement)
│  ├─ features/              # Функціональні модулі (auth, habits, home, stats...)
│  ├─ shared/                # Загальні API, theme, UI, config, helper-и
│  ├─ test/                  # Фікстури, моки, test setup
│  └─ __tests__/             # Кореневі smoke-тести
├─ coverage/                 # Артефакти покриття
└─ test-reports/             # Звіти E2E
```

<a id="getting-started-uk"></a>
### Швидкий старт
1. Перевірити інструменти:
```bash
bun --version
node --version
```
2. Встановити залежності:
```bash
bun install
```
3. Налаштувати оточення:
```bash
cp .env.example .env
```
4. Заповнити змінні в `.env`:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
5. Запуск:
```bash
bun run start
```
6. Локальний Android запуск (опційно):
```bash
bun run android
```

<a id="scripts-uk"></a>
### Скрипти
| Команда | Призначення |
|---|---|
| `bun run start` | Запуск Expo dev server |
| `bun run android` | Збірка/запуск Android |
| `bun run web` | Запуск web-цілі |
| `bun run lint` | Лінтинг |
| `bun run typecheck` | Перевірка TypeScript |
| `bun run test` | Unit/integration тести |
| `bun run test:coverage` | Тести з покриттям |
| `bun run e2e` | Maestro E2E набір |
| `bun run e2e:report:junit` | JUnit звіт E2E |
| `bun run e2e:report:html` | HTML звіт E2E |

<a id="quality-and-testing-uk"></a>
### Якість і тестування
Останній локальний запуск Jest coverage (7 травня 2026):
- Statements: `97.12%` (`3580/3686`)
- Branches: `90.79%` (`1913/2107`)
- Functions: `97.73%` (`1037/1061`)
- Lines: `97.11%` (`3471/3574`)

Codecov може показувати трохи нижче загальне покриття, оскільки частково покриті рядки не рахуються як повністю покриті.

Статус автоматизованих тестів:
- Test suites: `178 passed`
- Tests: `748 passed`

<a id="cicd-workflows-uk"></a>
### CI/CD процеси
GitHub Actions workflow:
- `ci.yml` - typecheck, lint, тести з coverage, upload у Codecov
- `android-build.yml` - перевірка Android APK для PR
- `e2e-android.yml` - Android emulator smoke-тести через Maestro
- `android-release.yml` - ручний release APK + публікація GitHub Release

<a id="roadmap-uk"></a>
### Плани розвитку
- Додавання друзів і підписок
- Пошук публічних профілів за ніком з порівнянням прогресу
- Спільні/social-звички для групової відповідальності
- Командні або сімейні челенджі зі спільними streak-цілями
- Розумні нагадування з адаптивним графіком
- Розширений експорт аналітики та long-term інсайти

<a id="license-uk"></a>
### Ліцензія
MIT License. Деталі в [LICENSE](LICENSE).

[Повернутися до мовної навігації](#habbittracker)

---

<a id="russian"></a>
## Русский

### Навигация
- [Обзор](#overview-ru)
- [Ключевые возможности](#core-features-ru)
- [Технологический стек](#tech-stack-ru)
- [Архитектура](#architecture-ru)
- [Структура проекта](#project-structure-ru)
- [Быстрый старт](#getting-started-ru)
- [Скрипты](#scripts-ru)
- [Качество и тестирование](#quality-and-testing-ru)
- [CI/CD процессы](#cicd-workflows-ru)
- [Roadmap](#roadmap-ru)
- [Лицензия](#license-ru)

<a id="overview-ru"></a>
### Обзор
Habbittracker - это приложение на Expo + React Native для формирования устойчивых привычек:
- онбординг и auth-flow (email/password + архитектура под OAuth)
- управление привычками и группами привычек
- трекинг выполнения и аналитика прогресса
- система достижений и мотивация через streak
- публичный профиль по username и deep-link обработка auth callback

<a id="core-features-ru"></a>
### Ключевые возможности
- Персонализированный онбординг с контролируемым первым запуском
- Аутентификация через Supabase и сохранение сессии
- CRUD привычек с правилами частоты, напоминаниями и группировкой
- Экран статистики с календарем и heatmap
- Система достижений с каталогом и движком прогресса
- Редактирование профиля, аватар и переключение темы
- Android E2E smoke-покрытие через Maestro

<a id="tech-stack-ru"></a>
### Технологический стек
| Слой | Стек |
|---|---|
| Фреймворк | Expo SDK 54, React Native 0.81, React 19 |
| Роутинг | Expo Router |
| Backend/BaaS | Supabase (`@supabase/supabase-js`) |
| Хранение | AsyncStorage, Expo Secure Store |
| UI и анимации | React Native, Reanimated, Gesture Handler, Lucide icons |
| Уведомления | Expo Notifications |
| Язык | TypeScript |
| Тестирование | Jest, `jest-expo`, `@testing-library/react-native`, Maestro |
| Tooling | Bun, ESLint, TypeScript compiler |
| CI | GitHub Actions + Codecov |

<a id="architecture-ru"></a>
### Архитектура
Проект использует модульный feature-first подход, близкий к FSD:
- `app` - точки входа роутов
- `features` - пользовательские сценарии
- `entities` - доменная логика и контракты данных
- `shared` - общая инфраструктура (API, theme, UI, config, navigation)

Такое разделение упрощает поддержку, покрытие тестами и дальнейшее масштабирование продукта.

<a id="project-structure-ru"></a>
### Структура проекта
```text
.
├─ .github/workflows/        # CI, Android build, Android E2E, release
├─ .maestro/                 # Мобильные E2E flow
├─ android/                  # Native Android часть
├─ src/
│  ├─ app/                   # Роуты Expo Router
│  ├─ entities/              # Домен (habit, profile, achievement)
│  ├─ features/              # Фичи продукта (auth, habits, home, stats...)
│  ├─ shared/                # Общие API, theme, UI, config, helpers
│  ├─ test/                  # Фикстуры, моки, test setup
│  └─ __tests__/             # Корневые smoke-тесты
├─ coverage/                 # Артефакты покрытия
└─ test-reports/             # Отчеты E2E
```

<a id="getting-started-ru"></a>
### Быстрый старт
1. Проверить инструменты:
```bash
bun --version
node --version
```
2. Установить зависимости:
```bash
bun install
```
3. Настроить окружение:
```bash
cp .env.example .env
```
4. Заполнить переменные в `.env`:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
5. Запуск приложения:
```bash
bun run start
```
6. Локальный Android запуск (опционально):
```bash
bun run android
```

<a id="scripts-ru"></a>
### Скрипты
| Команда | Назначение |
|---|---|
| `bun run start` | Запуск Expo dev server |
| `bun run android` | Сборка/запуск Android |
| `bun run web` | Запуск web-цели |
| `bun run lint` | Линтинг |
| `bun run typecheck` | Проверка TypeScript |
| `bun run test` | Unit/integration тесты |
| `bun run test:coverage` | Тесты с покрытием |
| `bun run e2e` | Запуск Maestro E2E |
| `bun run e2e:report:junit` | Генерация JUnit отчета E2E |
| `bun run e2e:report:html` | Генерация HTML отчета E2E |

<a id="quality-and-testing-ru"></a>
### Качество и тестирование
Последний локальный запуск Jest coverage (7 мая 2026):
- Statements: `97.12%` (`3580/3686`)
- Branches: `90.79%` (`1913/2107`)
- Functions: `97.73%` (`1037/1061`)
- Lines: `97.11%` (`3471/3574`)

Codecov может показывать немного ниже общее покрытие, потому что частично покрытые строки не считаются полностью покрытыми.

Статус автотестов:
- Test suites: `178 passed`
- Tests: `748 passed`

<a id="cicd-workflows-ru"></a>
### CI/CD процессы
GitHub Actions workflow:
- `ci.yml` - typecheck, lint, тесты с coverage, upload в Codecov
- `android-build.yml` - проверка Android APK для PR
- `e2e-android.yml` - Android emulator smoke-тесты через Maestro
- `android-release.yml` - ручная release-сборка APK и публикация GitHub Release

<a id="roadmap-ru"></a>
### Roadmap
- Добавление друзей и подписок
- Поиск публичных профилей по нику и сравнение прогресса
- Совместные/social-привычки для accountability-групп
- Командные или семейные челленджи с общими streak-целями
- Умные напоминания с адаптивным расписанием
- Расширенный экспорт аналитики и long-term инсайты

<a id="license-ru"></a>
### Лицензия
MIT License. Подробности в [LICENSE](LICENSE).

[Вернуться к языковой навигации](#habbittracker)
