# Kotlin Android — агент и панель для DeepSeek Harness

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![DSH bundle](https://img.shields.io/badge/DeepSeek%20Harness-bundle-blueviolet.svg)](https://github.com/vitalik-f7/dsh-kotlin-android-agent)
[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](CHANGELOG.md)
[![check](https://github.com/vitalik-f7/dsh-kotlin-android-agent/actions/workflows/check.yml/badge.svg)](https://github.com/vitalik-f7/dsh-kotlin-android-agent/actions/workflows/check.yml)

Бандл `@local/dsh-kotlin-android-agent` для [DeepSeek Harness](https://github.com/deepseek-ai): пресет
агента **Kotlin Android** для проектов Android Studio и запись **Kotlin Android** в нижней части левой
боковой панели.

Пресет настроен на senior-уровень Android/Kotlin-инженера: работает с реальным проектом через Gradle
Wrapper и adb, отвечает по-русски, экономит токены и при включении ведёт журнал уроков в проекте.

> Перед установкой прочитайте [Что это даёт](#что-это-даёт), [Установка](#установка) и
> [Ограничения](#ограничения). Бандл ничего не пишет в проект сам — только когда вы явно включаете
> журнал самоулучшения.

## Содержание

- [Что это даёт](#что-это-даёт)
- [Установка](#установка)
- [Экономия токенов](#экономия-токенов)
- [Самоулучшение](#самоулучшение)
- [Состав репозитория](#состав-репозитория)
- [Разработка и проверка](#разработка-и-проверка)
- [Ограничения](#ограничения)
- [Участие в проекте](#участие-в-проекте)
- [English](#english)
- [Лицензия](#лицензия)

## Что это даёт

1. **Пресет агента `Kotlin Android`** — выбирается при создании новой сессии в Harness.
2. **Панель `Kotlin Android`** — запись у нижнего края левой боковой панели, рядом с «Настройками».
   Показывает профиль экономии токенов, переключатель самоулучшения и готовые команды Gradle,
   которые копируются одним нажатием.

## Установка

Требования:

- **DeepSeek Harness** (desktop или web) — актуальная сборка;
- браузерный клиент DSH с поддержкой бандлов и слотов `sidebar.footer.action`;
- на Windows пресет запускает PowerShell (`pwsh`), на Linux/macOS — `bash` (переключается автоматически).

Шаги:

1. Скачайте репозиторий — `git clone https://github.com/vitalik-f7/dsh-kotlin-android-agent.git`
   или **Code → Download ZIP** и распакуйте в постоянную папку (её нельзя удалять: профиль ссылается
   на неё).
2. Установите бандл в активный профиль DSH — в чате Harness:

   ```
   plugin_manager install_bundle target=<полный путь к папке>
   ```

   Пример для Windows: `target=C:\Tools\dsh-kotlin-android-agent`.
3. Перезагрузите Harness (F5 для web-клиента, перезапуск для desktop).
4. Создайте новую сессию и выберите пресет **Kotlin Android**. Панель появится внизу левой панели.

Обновление после `git pull` — `remove_bundle`, затем снова `install_bundle` с тем же путём.

Удаление: `remove_bundle` в менеджере плагинов (или уберите пакет из `dsh.profile.bundles`
профиля) и перезагрузите Harness.

## Экономия токенов

| Мера | Значение |
|---|---|
| Набор инструментов | без субагентов, расписаний, целей, плагин-менеджера; `apply_patch` выключен |
| Обрезка результатов | `thresholdChars 4096`, `headChars 2048`, `tailChars 512` |
| Инструкции проекта | `AGENTS.md` до 32 КиБ вместо 64 |
| Веб | только `web_search`, `fetch` отключён |
| Правила ответа | отчёт на 3–6 строк, без дампа кода и пересказа файлов |
| Проверки | `compileDebugKotlin` затронутого модуля перед `assembleDebug` |

Пресет также требует сначала разведать проект (Compose или XML, MVVM/MVI, Hilt или Koin, Room,
Retrofit, minSdk/targetSdk, версии Kotlin и AGP) и не выдумывать зависимости и API.

## Самоулучшение

Переключатель в панели копирует в буфер готовую инструкцию. Вставьте её в чат:

- **включение** — агент создаёт `.dsh/kotlin-android-lessons.md` в корне проекта;
- **выключение** — агент удаляет журнал (или переименовывает в `.off`).

Пресет читает этот файл как единственный признак включённого режима: уроки читаются в начале задачи,
в конце дописывается до трёх строк `- ГГГГ-ММ-ДД: симптом → правило`. Журнал не создаётся сам —
только по вашей просьбе. Предпочтение панели хранится в `localStorage` браузера и на сервер не уходит.

## Состав репозитория

| Файл | Назначение |
|---|---|
| `cordis.patch.yml` | Пресет `kotlin-android`, инструменты, промпт, Host-строка бандла |
| `client.js` | Браузерный модуль: запись в `sidebar.footer.action`, диалог панели, словари ru/en |
| `index.js` | Host-половина бандла (пустая, активирует браузерный модуль) |
| `package.json` | Метаданные пакета и подключение `dsh.bundle` / `dsh.client` |
| `locale/{en,ru}.json` | Заголовок и описание для менеджера плагинов |
| `icon.svg` | Иконка бандла |
| `.github/workflows/check.yml` | CI: `node --check` для JS, разбор JSON и YAML |

## Разработка и проверка

Код бандла — обычные ES-модули без сборки: `client.js` загружается браузером как есть, поэтому правки
видны после перезагрузки страницы и переустановки бандла.

```powershell
node --check index.js
node --check client.js
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"
node -e "for (const f of ['locale/en.json','locale/ru.json']) JSON.parse(require('fs').readFileSync(f,'utf8'))"
```

Правила для правок:

- набор ключей в `locale/*.json` и в словарях `en`/`ru` внутри `client.js` должен совпадать;
- подстановки вида `{path}`, `{count}` сохраняются;
- при изменении `cordis.patch.yml` переустановите бандл и проверьте, что пресет появился в списке;
- версию в `package.json`, строку `footer` в `client.js` и [CHANGELOG](CHANGELOG.md) меняйте вместе.

## Ограничения

- Агенту недоступен GUI Android Studio: только файлы проекта, Gradle Wrapper и adb.
- Пресет сознательно не задаёт уточняющих вопросов — при нехватке данных он фиксирует допущение
  одной строкой и продолжает.
- Команды в панели записаны для Windows (`gradlew.bat`); на POSIX используйте `./gradlew`.
- `apply_patch` выключен, веб-`fetch` выключен — это часть профиля экономии.
- Бандл не меняет настройки профиля и не пишет файлы проекта, кроме журнала уроков по вашей просьбе.

## Участие в проекте

Issues и pull request'ы приветствуются: см. [CONTRIBUTING.md](CONTRIBUTING.md). Идеи, которые хорошо
подходят проекту: новые задачи Gradle в панели, поддержка POSIX-команд, дополнительные словари,
переключатели инструментов в пресете.

## English

A DeepSeek Harness bundle that adds the **Kotlin Android** agent preset plus a **Kotlin Android**
entry at the sidebar foot. The preset is a senior Android/Kotlin engineer that edits a real Android
Studio project through the Gradle Wrapper and adb, answers in Russian, keeps token usage low and can
maintain a per-project lessons journal when you switch it on.

Install: clone (or download the ZIP), then run
`plugin_manager install_bundle target=<absolute path>` in DSH, reload, and pick the preset when
creating a session. Uninstall with `remove_bundle`. MIT licensed; issues and pull requests are welcome.

## Лицензия

[MIT](LICENSE) © 2026 Drakin7. Используйте, форкайте, меняйте и распространяйте свободно.
