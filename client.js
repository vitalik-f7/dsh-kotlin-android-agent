/**
 * Browser half of the Kotlin Android bundle.
 *
 * One contribution: an entry at the sidebar foot ("Kotlin Android") that opens
 * a panel describing the `kotlin-android` agent preset. The panel states the
 * preset's token-economy profile, gives one-click Gradle commands, and owns the
 * self-improvement switch: flipping it copies a ready instruction that makes
 * the agent create or remove `.dsh/kotlin-android-lessons.md` in the project,
 * which is the only thing the preset reads to decide whether to keep a journal.
 *
 * The panel keeps its own preference in this browser's `localStorage`; it never
 * writes project files or profile configuration itself.
 */
window.__ModuleLoader__.load({
  id: '@local/dsh-kotlin-android-agent',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    /** Portal factory when `react-dom` is in the browser module table. */
    let createPortal = null;
    try {
      const reactDom = require('react-dom');
      if (reactDom && typeof reactDom.createPortal === 'function') createPortal = reactDom.createPortal;
    } catch (error) {
      createPortal = null;
    }

    /** Dictionary namespace owned by this plugin. */
    const NS = 'kotlinAndroid';
    /** Browser storage key holding the panel preference. */
    const STORAGE_KEY = 'dsh-kotlin-android:panel:v1';
    /** Style tag identity, so a reload replaces rather than duplicates it. */
    const STYLE_ID = 'dsh-kotlin-android/panel-styles';
    /** Project-relative journal path the preset reads. */
    const LESSONS_PATH = '.dsh/kotlin-android-lessons.md';

    /** English dictionary (the key-set source of truth). */
    const en = {
      'action.label': 'Kotlin Android',
      'action.aria': 'Open the Kotlin and Android Studio panel',
      'panel.title': 'Kotlin and Android Studio',
      'panel.subtitle': 'Agent preset “Kotlin Android” for Android Studio projects',
      'badge.tokens': 'token economy',
      'badge.journal': 'self-improvement',
      'tokens.title': 'Token economy',
      'tokens.intro': 'These measures are already active in the preset:',
      'tokens.tools.label': 'Compact tool set',
      'tokens.tools.hint': 'No subagents, schedules, goals or plugin manager in every request.',
      'tokens.pruner.label': 'Large results are trimmed',
      'tokens.pruner.hint': 'Over 4096 characters: 2048 from the head, 512 from the tail, the rest to a recoverable file.',
      'tokens.instructions.label': 'Project instructions capped',
      'tokens.instructions.hint': 'AGENTS.md is loaded up to 32 KiB instead of 64.',
      'tokens.answers.label': 'Answers without code dumps',
      'tokens.answers.hint': 'A 3–6 line report: changed files, assumptions, checks.',
      'tokens.builds.label': 'Targeted builds',
      'tokens.builds.hint': 'The touched module compiles first; a full assemble only when needed.',
      'tokens.web.label': 'Web search only',
      'tokens.web.hint': 'Fetch is off, so one schema is paid instead of two.',
      'journal.title': 'Self-improvement',
      'journal.on': 'Journal is on for the project',
      'journal.off': 'Journal is off',
      'journal.hint':
        'The switch copies an instruction into the clipboard: paste it into the chat and the agent creates or removes {path}. That file is the only switch the preset reads — lessons are read at the start of a task and up to three are appended at its end.',
      'journal.note.on': 'The project journal exists or is about to be created.',
      'journal.note.off': 'The agent keeps no lessons until the journal file appears.',
      'journal.toggleAria': 'Self-improvement journal',
      'commands.title': 'Gradle commands',
      'commands.hint': 'Windows wrapper; on POSIX use ./gradlew.',
      'action.copy': 'Copy',
      'action.copied': 'Copied',
      'action.failed': 'Copy failed — select the text manually',
      'footer': 'Preset kotlin-android · bundle v1.1.0 · desktop profile',
      'close': 'Close',
      'journal.promptOn':
        'Включи самоулучшение для этого проекта: создай файл ' +
        LESSONS_PATH +
        ' с заголовком «# Уроки Kotlin/Android» и пустым списком. Дальше в конце каждой задачи, где была ошибка, неожиданное поведение Gradle/AGP или неочевидный приём, дописывай туда до трёх строк вида «- ГГГГ-ММ-ДД: симптом → правило». Старые записи не переписывай.',
      'journal.promptOff':
        'Выключи самоулучшение для этого проекта: удали файл ' +
        LESSONS_PATH +
        ' (или переименуй его в ' +
        LESSONS_PATH +
        '.off) и больше не читай и не дописывай журнал уроков.',
    };

    /** Russian dictionary, checked against the English keys. */
    const ru = {
      'action.label': 'Kotlin Android',
      'action.aria': 'Открыть панель Kotlin и Android Studio',
      'panel.title': 'Kotlin и Android Studio',
      'panel.subtitle': 'Пресет агента «Kotlin Android» для проектов Android Studio',
      'badge.tokens': 'экономия токенов',
      'badge.journal': 'самоулучшение',
      'tokens.title': 'Экономия токенов',
      'tokens.intro': 'Эти меры уже включены в пресете:',
      'tokens.tools.label': 'Компактный набор инструментов',
      'tokens.tools.hint': 'Без субагентов, расписаний, целей и менеджера плагинов в каждом запросе.',
      'tokens.pruner.label': 'Большие результаты обрезаются',
      'tokens.pruner.hint': 'Свыше 4096 символов: 2048 из начала, 512 из конца, остальное — в восстанавливаемый файл.',
      'tokens.instructions.label': 'Инструкции проекта ограничены',
      'tokens.instructions.hint': 'AGENTS.md читается до 32 КиБ вместо 64.',
      'tokens.answers.label': 'Ответ без дампа кода',
      'tokens.answers.hint': 'Отчёт на 3–6 строк: файлы, допущения, проверки.',
      'tokens.builds.label': 'Точечные сборки',
      'tokens.builds.hint': 'Сначала компиляция затронутого модуля, assemble — только при необходимости.',
      'tokens.web.label': 'Веб — только поиск',
      'tokens.web.hint': 'Fetch отключён: платим за одну схему вместо двух.',
      'journal.title': 'Самоулучшение',
      'journal.on': 'Журнал включён для проекта',
      'journal.off': 'Журнал выключен',
      'journal.hint':
        'Переключатель копирует инструкцию в буфер: вставьте её в чат, и агент создаст или удалит {path}. Этот файл — единственный переключатель, который читает пресет: уроки читаются в начале задачи, до трёх записей добавляются в конце.',
      'journal.note.on': 'Журнал проекта есть или вот-вот появится.',
      'journal.note.off': 'Пока файла журнала нет, уроки не ведутся.',
      'journal.toggleAria': 'Журнал самоулучшения',
      'commands.title': 'Команды Gradle',
      'commands.hint': 'Обёртка Windows; на POSIX — ./gradlew.',
      'action.copy': 'Копировать',
      'action.copied': 'Скопировано',
      'action.failed': 'Не удалось скопировать — выделите текст вручную',
      'footer': 'Пресет kotlin-android · пакет v1.1.0 · профиль desktop',
      'close': 'Закрыть',
      'journal.promptOn':
        'Включи самоулучшение для этого проекта: создай файл ' +
        LESSONS_PATH +
        ' с заголовком «# Уроки Kotlin/Android» и пустым списком. Дальше в конце каждой задачи, где была ошибка, неожиданное поведение Gradle/AGP или неочевидный приём, дописывай туда до трёх строк вида «- ГГГГ-ММ-ДД: симптом → правило». Старые записи не переписывай.',
      'journal.promptOff':
        'Выключи самоулучшение для этого проекта: удали файл ' +
        LESSONS_PATH +
        ' (или переименуй его в ' +
        LESSONS_PATH +
        '.off) и больше не читай и не дописывай журнал уроков.',
    };

    /** Gradle commands offered as one-click copies. */
    const COMMANDS = [
      '.\\gradlew.bat :app:compileDebugKotlin',
      '.\\gradlew.bat :app:testDebugUnitTest',
      '.\\gradlew.bat :app:lintDebug',
    ];

    /** Read the stored preference; anything malformed falls back to defaults. */
    function readPref() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw === null) return { journal: false };
        const parsed = JSON.parse(raw);
        return { journal: parsed !== null && typeof parsed === 'object' && parsed.journal === true };
      } catch (error) {
        return { journal: false };
      }
    }

    /** Persist the preference; storage failures are not fatal for the panel. */
    function writePref(pref) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ journal: pref.journal === true }));
      } catch (error) {
        /* The switch still works for this mount. */
      }
    }

    /** Copy text through the async clipboard, falling back to a selection copy. */
    async function copyText(text) {
      try {
        if (navigator.clipboard !== undefined && typeof navigator.clipboard.writeText === 'function') {
          await navigator.clipboard.writeText(text);
          return true;
        }
      } catch (error) {
        /* Fall through to the selection copy. */
      }
      try {
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.top = '0';
        area.style.left = '0';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand('copy');
        area.remove();
        return ok;
      } catch (error) {
        return false;
      }
    }

    /** Bracketed-code mark, drawn in the current text color. */
    function Mark(props) {
      const size = typeof props.size === 'number' ? props.size : 16;
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          'aria-hidden': 'true',
          focusable: 'false',
          style: { flex: 'none', display: 'block' },
        },
        h('path', {
          d: 'M9 6 4 12 9 18',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
        h('path', {
          d: 'M15 6 20 12 15 18',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
        h('circle', { cx: 12, cy: 12, r: 1.5, fill: 'currentColor' }),
      );
    }

    /** One token-economy measure: a check mark, a name, and its effect. */
    function Measure(props) {
      return h(
        'div',
        { className: 'kas_measure' },
        h('span', { className: 'kas_check', 'aria-hidden': 'true' }, '✓'),
        h(
          'span',
          { className: 'kas_measureText' },
          h('span', { className: 'kas_measureLabel' }, props.label),
          h('span', { className: 'kas_measureHint' }, props.hint),
        ),
      );
    }

    /** A switch button that mirrors the host's `role="switch"` control. */
    function Switch(props) {
      return h(
        'button',
        {
          type: 'button',
          role: 'switch',
          'aria-checked': props.checked,
          'aria-label': props.label,
          className: 'kas_switch' + (props.checked ? ' kas_switchOn' : ''),
          onClick: props.onChange,
        },
        h('span', { className: 'kas_switchThumb', 'aria-hidden': 'true' }),
      );
    }

    /** A monospace command with its own copy button. */
    function CommandRow(props) {
      return h(
        'div',
        { className: 'kas_command' },
        h('code', { className: 'kas_commandText' }, props.command),
        h(
          'button',
          {
            type: 'button',
            className: 'kas_copyButton',
            onClick: props.onCopy,
            'aria-label': props.t('action.copy') + ': ' + props.command,
          },
          props.copied ? props.t('action.copied') : props.t('action.copy'),
        ),
      );
    }

    /** The panel dialog; mounted only while open. */
    function PanelDialog(props) {
      const t = props.t;
      const [pref, setPref] = React.useState(readPref);
      const [copiedKey, setCopiedKey] = React.useState(null);
      const [notice, setNotice] = React.useState(null);
      const dialogRef = React.useRef(null);
      const closeRef = React.useRef(null);
      const timerRef = React.useRef(null);

      React.useEffect(() => {
        const node = closeRef.current;
        if (node !== null) node.focus();
      }, []);

      React.useEffect(
        () => () => {
          if (timerRef.current !== null) window.clearTimeout(timerRef.current);
        },
        [],
      );

      React.useEffect(() => {
        const onKeyDown = (event) => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            props.onClose();
          }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
      }, [props.onClose]);

      /** Copy a payload and flash its label. */
      const copy = (key, text) => {
        copyText(text).then((ok) => {
          setCopiedKey(ok ? key : null);
          setNotice(ok ? t('action.copied') : t('action.failed'));
          if (timerRef.current !== null) window.clearTimeout(timerRef.current);
          timerRef.current = window.setTimeout(() => {
            setCopiedKey(null);
            setNotice(null);
          }, 2400);
        });
      };

      /** Flip the journal switch and hand the user the matching instruction. */
      const toggleJournal = () => {
        const next = { journal: pref.journal !== true };
        setPref(next);
        writePref(next);
        copy('journal', next.journal ? t('journal.promptOn') : t('journal.promptOff'));
      };

      const body = h(
        'div',
        {
          className: 'kas_dialog',
          role: 'dialog',
          'aria-modal': 'true',
          'aria-label': t('panel.title'),
          ref: dialogRef,
        },
        h(
          'div',
          { className: 'kas_header' },
          h('span', { className: 'kas_headerMark' }, h(Mark, { size: 22 })),
          h(
            'span',
            { className: 'kas_headerText' },
            h('span', { className: 'kas_title' }, t('panel.title')),
            h('span', { className: 'kas_subtitle' }, t('panel.subtitle')),
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'kas_close',
              'aria-label': t('close'),
              title: t('close'),
              onClick: props.onClose,
              ref: closeRef,
            },
            '✕',
          ),
        ),
        h(
          'div',
          { className: 'kas_badges' },
          h('span', { className: 'kas_badge' }, t('badge.tokens')),
          h('span', { className: 'kas_badge' }, t('badge.journal')),
        ),
        h(
          'section',
          { className: 'kas_section' },
          h('h3', { className: 'kas_sectionTitle' }, t('tokens.title')),
          h('p', { className: 'kas_sectionNote' }, t('tokens.intro')),
          h(
            'div',
            { className: 'kas_measures' },
            h(Measure, { label: t('tokens.tools.label'), hint: t('tokens.tools.hint') }),
            h(Measure, { label: t('tokens.pruner.label'), hint: t('tokens.pruner.hint') }),
            h(Measure, { label: t('tokens.instructions.label'), hint: t('tokens.instructions.hint') }),
            h(Measure, { label: t('tokens.answers.label'), hint: t('tokens.answers.hint') }),
            h(Measure, { label: t('tokens.builds.label'), hint: t('tokens.builds.hint') }),
            h(Measure, { label: t('tokens.web.label'), hint: t('tokens.web.hint') }),
          ),
        ),
        h(
          'section',
          { className: 'kas_section' },
          h(
            'div',
            { className: 'kas_journalHead' },
            h(
              'span',
              { className: 'kas_journalText' },
              h('span', { className: 'kas_sectionTitle' }, t('journal.title')),
              h('span', { className: 'kas_journalState' }, pref.journal ? t('journal.on') : t('journal.off')),
            ),
            h(Switch, {
              checked: pref.journal === true,
              label: t('journal.toggleAria'),
              onChange: toggleJournal,
            }),
          ),
          h('p', { className: 'kas_sectionNote' }, t('journal.hint', { path: LESSONS_PATH })),
          h('p', { className: 'kas_sectionNote kas_sectionNoteMuted' }, pref.journal ? t('journal.note.on') : t('journal.note.off')),
        ),
        h(
          'section',
          { className: 'kas_section' },
          h('h3', { className: 'kas_sectionTitle' }, t('commands.title')),
          h('p', { className: 'kas_sectionNote' }, t('commands.hint')),
          h(
            'div',
            { className: 'kas_commands' },
            COMMANDS.map((command) =>
              h(CommandRow, {
                key: command,
                command,
                t,
                copied: copiedKey === command,
                onCopy: () => copy(command, command),
              }),
            ),
          ),
        ),
        h(
          'div',
          { className: 'kas_footer' },
          h('span', { className: 'kas_footerText' }, t('footer')),
          h('span', { className: 'kas_notice', role: 'status', 'aria-live': 'polite' }, notice === null ? '' : notice),
        ),
      );

      return h(
        'div',
        {
          className: 'kas_backdrop',
          onMouseDown: (event) => {
            if (event.target === event.currentTarget) props.onClose();
          },
        },
        body,
      );
    }

    /** The sidebar-foot entry: a Settings-style row that opens the panel. */
    function KotlinSidebarAction(props) {
      const wide = props !== null && typeof props === 'object' && props.wide === true;
      const t = typeof props.t === 'function' ? props.t : (key) => key;
      const [open, setOpen] = React.useState(false);
      const close = React.useCallback(() => setOpen(false), []);

      const entry = h(
        'button',
        {
          type: 'button',
          className: wide ? 'kas_action' : 'kas_action kas_actionRail',
          'aria-haspopup': 'dialog',
          'aria-expanded': open,
          'aria-label': t('action.aria'),
          title: t('action.aria'),
          onClick: () => setOpen(true),
        },
        h(Mark, { size: 16 }),
        wide ? h('span', { className: 'kas_actionLabel' }, t('action.label')) : null,
      );

      if (!open) return entry;
      const dialog = h(PanelDialog, { t, onClose: close });
      return h(
        React.Fragment,
        null,
        entry,
        createPortal === null ? dialog : createPortal(dialog, document.body),
      );
    }

    /** Stylesheet for the entry, the dialog and its controls. */
    const CSS = [
      '.kas_action{display:flex;align-items:center;gap:8px;box-sizing:border-box;width:100%;min-width:0;height:30px;padding:0 8px;border:none;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;line-height:20px;text-align:left;cursor:pointer}',
      '.kas_actionRail{width:30px;justify-content:center;padding:0}',
      '@media (hover:hover){.kas_action:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}',
      '.kas_action[aria-expanded=true]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}',
      '.kas_action:focus-visible{outline:1.5px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}',
      '.kas_actionLabel{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.kas_backdrop{position:fixed;inset:0;z-index:1200;display:flex;align-items:center;justify-content:center;padding:24px;background:var(--dsw-alias-bg-mask,rgba(12,12,16,.45))}',
      '.kas_dialog{box-sizing:border-box;width:min(560px,calc(100vw - 32px));max-height:min(680px,calc(100vh - 48px));overflow:auto;padding:20px;border-radius:var(--dsw-radius-lg);border:.5px solid var(--dsw-alias-border-l1);background:var(--dsw-specific-menu,var(--dsw-alias-bg-elevated));box-shadow:var(--dsw-elevation-prominent);color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px}',
      '.kas_header{display:flex;align-items:flex-start;gap:10px}',
      '.kas_headerMark{display:flex;align-items:center;justify-content:center;width:30px;height:30px;flex:none;border-radius:var(--dsw-radius-md);background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-state-business-primary)}',
      '.kas_headerText{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}',
      '.kas_title{color:var(--dsw-alias-label-primary);font-size:15px;line-height:22px;font-weight:600}',
      '.kas_subtitle{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:17px}',
      '.kas_close{flex:none;width:26px;height:26px;border:none;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:12px;line-height:1;cursor:pointer}',
      '@media (hover:hover){.kas_close:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}',
      '.kas_close:focus-visible{outline:1.5px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}',
      '.kas_badges{display:flex;flex-wrap:wrap;gap:6px;margin:14px 0 4px}',
      '.kas_badge{padding:2px 8px;border-radius:999px;border:.5px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}',
      '.kas_section{margin-top:18px;padding-top:14px;border-top:.5px solid var(--dsw-alias-border-l2)}',
      '.kas_sectionTitle{margin:0;color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px;font-weight:500}',
      '.kas_sectionNote{margin:4px 0 0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:17px}',
      '.kas_sectionNoteMuted{opacity:.8}',
      '.kas_measures{display:flex;flex-direction:column;gap:10px;margin-top:12px}',
      '.kas_measure{display:flex;align-items:flex-start;gap:8px}',
      '.kas_check{flex:none;width:16px;color:var(--dsw-alias-state-business-primary);font-size:12px;line-height:17px}',
      '.kas_measureText{display:flex;flex-direction:column;min-width:0;gap:1px}',
      '.kas_measureLabel{color:var(--dsw-alias-label-secondary);font-size:12.5px;line-height:18px}',
      '.kas_measureHint{color:var(--dsw-alias-label-tertiary);font-size:11.5px;line-height:16px}',
      '.kas_journalHead{display:flex;align-items:center;justify-content:space-between;gap:16px}',
      '.kas_journalText{display:flex;flex-direction:column;gap:1px;min-width:0}',
      '.kas_journalState{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:17px}',
      '.kas_switch{position:relative;flex:none;width:40px;height:22px;padding:0;border:none;border-radius:999px;background:var(--dsw-alias-border-l2);cursor:pointer;transition:background .15s ease}',
      '.kas_switchOn{background:var(--dsw-alias-state-business-primary)}',
      '.kas_switch:focus-visible{outline:1.5px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}',
      '.kas_switchThumb{position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:var(--dsw-alias-label-primary);transition:transform .15s ease}',
      '.kas_switchOn .kas_switchThumb{transform:translateX(18px)}',
      '.kas_commands{display:flex;flex-direction:column;gap:6px;margin-top:10px}',
      '.kas_command{display:flex;align-items:center;gap:8px;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm);padding:4px 4px 4px 10px}',
      '.kas_commandText{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:11.5px}',
      '.kas_copyButton{flex:none;height:24px;padding:0 8px;border:none;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:11px;line-height:1;cursor:pointer}',
      '@media (hover:hover){.kas_copyButton:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}}',
      '.kas_copyButton:focus-visible{outline:1.5px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}',
      '.kas_footer{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:18px;padding-top:12px;border-top:.5px solid var(--dsw-alias-border-l2)}',
      '.kas_footerText{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}',
      '.kas_notice{color:var(--dsw-alias-state-business-primary);font-size:11px;line-height:16px}',
    ].join('');

    /** Install the stylesheet; returns the disposer that removes it. */
    function injectStyles() {
      if (typeof document === 'undefined') return () => {};
      if (document.querySelector('style[data-plugin-css=' + JSON.stringify(STYLE_ID) + ']') === null) {
        const tag = document.createElement('style');
        tag.dataset.plugin = '@local/dsh-kotlin-android-agent';
        tag.dataset.pluginCss = STYLE_ID;
        tag.textContent = CSS;
        document.head.appendChild(tag);
      }
      return () => {
        const tag = document.querySelector('style[data-plugin-css=' + JSON.stringify(STYLE_ID) + ']');
        if (tag !== null) tag.remove();
      };
    }

    /** Services used by the browser companion. */
    const inject = ['slots', 'locale'];

    /**
     * Register the translate lookup and the sidebar entry.
     * @param ctx - browser plugin context.
     */
    function apply(ctx) {
      const locale = ctx.locale;
      const t = locale.bind(NS);

      ctx.effect(() => locale.register(NS, { en, ru }), 'kotlin-android: dictionaries');
      ctx.effect(() => injectStyles(), 'kotlin-android: styles');

      const Entry = (props) => h(KotlinSidebarAction, { ...props, t });

      ctx.slots.inject('sidebar.footer.action', () =>
        ctx.slots.register(
          {
            name: 'sidebar.footer.action',
            id: 'kotlin-android',
            order: 20,
            locale: NS,
            label: () => t('action.label'),
          },
          Entry,
        ),
      );
    }

    return { inject, apply };
  },
});
