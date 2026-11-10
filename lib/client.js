/**
 * anim233 — 浏览器半侧（设置页「动画 233」）
 * ----------------------------------------------------------------------------
 * 注册 settings.section，提供：
 *   - 动画包选择（内置 13 款 + 导入的）
 *   - 用户名（默认「博士」）
 *   - 背景层：开关 / 透明度 / 来源（预设/图片/渐变/网址）
 *   - 进入后 UI/UX 动画开关
 *   - git 导入别人的动画包（URL + 目录名）
 *   - 立即预览 / 保存 / 恢复默认
 * 数据走 Host 自带 HTTP API（GET/POST /anim233/config），不依赖 settings 命名空间。
 * 注册 id 必须等于 loader entry 名（dsh-plugin-anim233）。
 */
window.__ModuleLoader__.load({
  id: 'dsh-plugin-anim233',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    var react = require('react')
    var h = react.createElement
    var API = '/anim233/config'

    var CSS = [
      '.__a233_root{max-width:640px;display:flex;flex-direction:column;gap:14px;font-size:13px;color:var(--dsw-alias-label-primary)}',
      '.__a233_version{font-family:ui-monospace,Consolas,monospace;font-size:12px;letter-spacing:.04em;color:var(--dsw-alias-label-tertiary)}',
      '.__a233_group{border:1px solid var(--dsw-alias-border-l2);border-radius:10px;padding:12px 14px;display:flex;flex-direction:column;gap:11px}',
      '.__a233_groupTitle{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--dsw-alias-label-tertiary)}',
      '.__a233_field{display:flex;flex-direction:column;gap:5px}',
      '.__a233_label{font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary)}',
      '.__a233_hint{font-size:11px;line-height:1.55;color:var(--dsw-alias-label-tertiary)}',
      '.__a233_input{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);font:inherit;color:var(--dsw-alias-label-primary);border-radius:8px;padding:6px 10px;font-size:13px;box-sizing:border-box;width:100%;outline:none}',
      '.__a233_input:focus{border-color:var(--dsw-alias-state-business-primary)}',
      '.__a233_select{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);border-radius:8px;padding:6px 8px;font:inherit;font-size:13px;min-width:200px;max-width:100%}',
      '.__a233_check{display:flex;align-items:flex-start;gap:8px;cursor:pointer}',
      '.__a233_check input{margin-top:2px;accent-color:var(--dsw-alias-state-business-primary)}',
      '.__a233_checkText{display:flex;flex-direction:column;gap:2px}',
      '.__a233_two{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
      '.__a233_actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:2px}',
      '.__a233_actionsSticky{position:sticky;bottom:-2px;z-index:3;margin-top:0;padding:9px 0 7px;background:var(--dsw-alias-bg-layer-1,transparent);border-top:1px solid var(--dsw-alias-border-l2);box-shadow:0 -10px 18px -14px rgba(0,0,0,.45);display:flex;flex-direction:column;gap:6px}',
      '.__a233_barHint{font-size:11px;line-height:1.5;color:var(--dsw-alias-label-tertiary);word-break:break-all}',
      '.__a233_barFile{display:block;opacity:.85;font-family:ui-monospace,Consolas,monospace;font-size:10.5px}',
      '.__a233_dirty{font-size:12px;color:var(--dsw-alias-state-business-primary,#c26a00);font-weight:600}',
      '.__a233_btn{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);border-radius:8px;padding:6px 14px;font:inherit;font-size:13px;cursor:pointer}',
      '.__a233_btn:hover:not(:disabled){border-color:var(--dsw-alias-state-business-primary)}',
      '.__a233_btn:disabled{opacity:.5;cursor:default}',
      '.__a233_btnPrimary{border-color:var(--dsw-alias-state-business-primary,#3964fe);background:var(--dsw-alias-state-business-primary,#3964fe);color:#fff}',
      '.__a233_status{font-size:12px;color:var(--dsw-alias-label-tertiary)}',
      '.__a233_ok{font-size:12px;color:var(--dsw-alias-state-business-primary)}',
      '.__a233_err{font-size:12px;color:var(--dsw-alias-state-error-primary,#f85149)}',
      '.__a233_packs{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px}',
      '.__a233_pack{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:10px;padding:10px 8px;text-align:center;cursor:pointer;font-size:12px;color:var(--dsw-alias-label-secondary)}',
      '.__a233_pack:hover{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-primary)}',
      '.__a233_packActive{border-color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-state-business-primary);color:#fff}',
      '.__a233_packTag{display:block;font-size:10px;opacity:.7;margin-top:3px}',
      '.__a233_importRow{display:flex;gap:8px;align-items:center;flex-wrap:wrap}'
    ].join('')
    var tagId = 'dsh-plugin-anim233/main.css'
    if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css="' + tagId + '"]') === null) {
      var tag = document.createElement('style')
      tag.dataset.plugin = 'dsh-plugin-anim233'
      tag.dataset.pluginCss = tagId
      tag.textContent = CSS
      document.head.appendChild(tag)
    }

    function Field(props) {
      return h('div', { className: '__a233_field' },
        h('label', { className: '__a233_label' }, props.label),
        props.children,
        props.hint ? h('div', { className: '__a233_hint' }, props.hint) : null
      )
    }
    function TextInput(props) {
      return h('input', {
        className: '__a233_input',
        type: 'text',
        value: props.value == null ? '' : String(props.value),
        placeholder: props.placeholder || '',
        maxLength: props.maxLength || 128,
        spellCheck: false,
        onChange: (e) => props.onChange(e.target.value)
      })
    }
    function Select(props) {
      return h('select', {
        className: '__a233_select',
        value: props.value,
        onChange: (e) => props.onChange(e.target.value)
      }, props.options.map((o) => h('option', { key: o[0], value: o[0] }, o[1])))
    }
    function Check(props) {
      return h('label', { className: '__a233_check' },
        h('input', { type: 'checkbox', checked: !!props.checked, onChange: (e) => props.onChange(e.target.checked) }),
        h('span', { className: '__a233_checkText' },
          h('span', null, props.label),
          props.hint ? h('span', { className: '__a233_hint' }, props.hint) : null
        )
      )
    }
    function Range(props) {
      return h('div', { className: '__a233_two' },
        h('input', {
          type: 'range', min: props.min, max: props.max, step: props.step || 0.01,
          value: props.value, style: { flex: '1 1 160px' },
          onChange: (e) => props.onChange(Number(e.target.value))
        }),
        h('span', { className: '__a233_status' }, props.display)
      )
    }

    var FALLBACK = {
      enabled: true, mode: 'session', pack: 'genshin', allowSkip: true, entranceEnabled: true,
      speed: 1, username: '博士',
      backgroundEnabled: true, backgroundOpacity: 0.55, backgroundType: 'preset',
      backgroundPreset: 'aurora', backgroundImage: '', backgroundGradient: '', backgroundUrl: ''
    }
    var FALLBACK_VERSION = '1.0.0'
    function num(v, d) { var n = Number(v); return isFinite(n) ? n : d }
    function readInjectedVersion() { try { return window.__ANIM233_VERSION__ || '' } catch (e) { return '' } }

    /* 背景预设选项 */
    var PRESET_OPTS = [
      ['aurora', '极光'], ['ember', '暖焰'], ['ocean', '深海'],
      ['forest', '幽林'], ['mono', '纯色'], ['none', '无']
    ]

    function Panel() {
      var [draft, setDraft] = react.useState(null)
      var [defaults, setDefaults] = react.useState(null)
      var [file, setFile] = react.useState('')
      var [packsDir, setPacksDir] = react.useState('')
      var [version, setVersion] = react.useState(readInjectedVersion)
      var [error, setError] = react.useState(null)
      var [notice, setNotice] = react.useState(null)
      var [busy, setBusy] = react.useState(false)
      var [dirty, setDirty] = react.useState(false)
      var [imported, setImported] = react.useState([])
      var [importUrl, setImportUrl] = react.useState('')
      var [importDir, setImportDir] = react.useState('')
      var [importing, setImporting] = react.useState(false)

      function load() {
        setError(null)
        return fetch(API, { headers: { Accept: 'application/json' } })
          .then((r) => r.json())
          .then((j) => {
            if (!j || j.ok !== true) throw new Error((j && j.error) || 'load failed')
            setDraft(Object.assign({}, FALLBACK, j.config))
            setDefaults(Object.assign({}, FALLBACK, j.defaults))
            setDirty(false)
            setFile(j.file || '')
            setPacksDir(j.packsDir || '')
            if (j.version) setVersion(String(j.version))
            setImported((j.imported || []).map(function (p) { return p.id }))
          })
          .catch((e) => setError('读取配置失败：' + String(e && e.message ? e.message : e)))
      }
      react.useEffect(() => { load() }, [])

      /* 设置面板打开时隐藏背景层，避免高透明度盖住配置；关闭时恢复 */
      react.useEffect(function () {
        var bg = window.ANIM233 && window.ANIM233.background
        if (bg && typeof bg.setHidden === 'function') bg.setHidden(true)
        return function () {
          if (bg && typeof bg.setHidden === 'function') bg.setHidden(false)
        }
      }, [])

      function set(key, value) {
        setNotice(null); setDirty(true)
        setDraft((d) => Object.assign({}, d, { [key]: value }))
      }
      function save() {
        if (!draft) return
        setBusy(true); setNotice(null); setError(null)
        fetch(API, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patch: draft })
        })
          .then((r) => r.json())
          .then((j) => {
            if (!j || j.ok !== true) throw new Error((j && j.error) || 'save failed')
            setDraft(j.config); setDirty(false)
            setNotice('已保存。点「立即预览」先看效果；下次打开 DSH 自动生效。')
          })
          .catch((e) => setError('保存失败：' + String(e && e.message ? e.message : e)))
          .then(() => setBusy(false))
      }
      function reset() {
        setBusy(true); setNotice(null); setError(null)
        fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reset' }) })
          .then((r) => r.json())
          .then((j) => {
            if (!j || j.ok !== true) throw new Error((j && j.error) || 'reset failed')
            setDraft(j.config); setDirty(false); setNotice('已恢复默认。')
          })
          .catch((e) => setError('恢复默认失败：' + String(e && e.message ? e.message : e)))
          .then(() => setBusy(false))
      }
      function preview() {
        var api = window.__ANIM233_API__
        if (api && typeof api.replay === 'function') {
          try { api.replay() } catch (e) { window.location.reload() }
          setTimeout(function () {
            var root = document.getElementById('anim233-root')
            if (!root && window.__ANIM233_RUNNING__ !== true) window.location.reload()
          }, 1200)
          return
        }
        window.location.reload()
      }
      function importPack() {
        var url = importUrl.trim()
        if (!url) { setError('请填写 git 仓库地址'); return }
        setImporting(true); setError(null); setNotice(null)
        fetch(API, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'import', url: url, dir: importDir.trim() })
        })
          .then((r) => r.json())
          .then((j) => {
            if (!j || j.ok !== true) throw new Error((j && j.error) || 'import failed')
            setNotice('已导入动画包：' + (j.name || j.dir) + '。刷新后可选用。')
            setImportUrl(''); setImportDir('')
            return load()
          })
          .catch((e) => setError('导入失败：' + String(e && e.message ? e.message : e)))
          .then(() => setImporting(false))
      }

      var versionLine = h('div', { className: '__a233_version' }, '动画 233 · v' + (version || FALLBACK_VERSION))
      if (!draft) {
        return h('div', { className: '__a233_root' },
          versionLine,
          h('div', { className: '__a233_status' }, error ? error : '读取配置中…'),
          error ? h('div', { className: '__a233_actions' }, h('button', { className: '__a233_btn', onClick: load }, '重试')) : null
        )
      }

      var modeOptions = [['session', '每个浏览器会话一次'], ['daily', '每天一次'], ['always', '每次打开都播放']]

      /* 内置包定义（与 Host scanPacks 顺序一致） */
      var BUILTIN = [
        ['genshin', '原神', '二次元'], ['arknights', '明日方舟', '科幻'], ['starrail', '星穹铁道', '科幻'],
        ['honkai3', '崩坏3', '动作'], ['zzz', '绝区零', '都市'], ['eldenring', '艾尔登法环', '魂系'],
        ['zelda', '塞尔达传说', '冒险'], ['witcher3', '巫师3', '奇幻'], ['monsterhunter', '怪物猎人', '狩猎'],
        ['sekiro', '只狼', '忍者'], ['league', '英雄联盟', 'MOBA'], ['wangzhe', '王者荣耀', 'MOBA'],
        ['cyberpunk', '赛博朋克2077', '赛博']
      ]

      function PackCard(props) {
        var active = draft.pack === props.id
        return h('div', {
          className: '__a233_pack' + (active ? ' __a233_packActive' : ''),
          onClick: function () { set('pack', props.id) }
        },
          props.name,
          h('span', { className: '__a233_packTag' }, props.style)
        )
      }

      return h('div', { className: '__a233_root' },
        versionLine,

        /* 启动动画包 */
        h('div', { className: '__a233_group' },
          h('div', { className: '__a233_groupTitle' }, '启动动画包'),
          h(Check, { label: '启用动画', checked: draft.enabled, onChange: (v) => set('enabled', v) }),
          h(Field, { label: '内置风格（点一下选中）' },
            h('div', { className: '__a233_packs' },
              BUILTIN.map(function (b) { return h(PackCard, { key: b[0], id: b[0], name: b[1], style: b[2] }) }),
              imported.map(function (id) {
                var name = id.replace(/^imported:/, '')
                return h(PackCard, { key: id, id: id, name: name, style: '导入' })
              })
            )
          ),
          h(Field, { label: '播放时机' }, h(Select, { value: draft.mode, options: modeOptions, onChange: (v) => set('mode', v) })),
          h(Field, { label: '速度倍率', hint: '0.35 慢放 · 1 原速 · 3 快放' },
            h(Range, { value: num(draft.speed, 1), min: 0.35, max: 3, step: 0.05, display: num(draft.speed, 1).toFixed(2) + '×', onChange: (v) => set('speed', v) })),
          h(Check, { label: '允许跳过', checked: draft.allowSkip, onChange: (v) => set('allowSkip', v) })
        ),

        /* 用户名 */
        h('div', { className: '__a233_group' },
          h('div', { className: '__a233_groupTitle' }, '用户名'),
          h(Field, { label: '显示名称', hint: '默认「博士」，会显示在启动动画与欢迎语中。' },
            h(TextInput, { value: draft.username, placeholder: '博士', onChange: (v) => set('username', v) }))
        ),

        /* 进入后动画 */
        h('div', { className: '__a233_group' },
          h('div', { className: '__a233_groupTitle' }, '进入后 UI/UX 动画'),
          h(Check, {
            label: '启用进入后动画',
            hint: '启动动画播完进入主界面时的过渡/欢迎光效；关闭则直接进界面。',
            checked: draft.entranceEnabled, onChange: (v) => set('entranceEnabled', v)
          })
        ),

        /* 背景层 */
        h('div', { className: '__a233_group' },
          h('div', { className: '__a233_groupTitle' }, '背景层（可调透明度 · 常驻）'),
          h(Check, {
            label: '启用背景层',
            hint: '独立于启动动画的常驻背景，进入主界面后仍可见，透明度可调。',
            checked: draft.backgroundEnabled, onChange: (v) => set('backgroundEnabled', v)
          }),
          draft.backgroundEnabled ? h(Field, { label: '透明度', hint: '1 = 不透明，0 = 完全透明。' },
            h(Range, { value: num(draft.backgroundOpacity, 0.55), min: 0, max: 1, step: 0.01, display: Math.round(num(draft.backgroundOpacity, 0.55) * 100) + '%', onChange: (v) => set('backgroundOpacity', v) })) : null,
          draft.backgroundEnabled ? h(Field, { label: '来源' },
            h(Select, {
              value: draft.backgroundType, options: [
                ['preset', '内置预设'], ['image', '本地图片'], ['gradient', '自定义渐变'], ['url', '网络图片']
              ], onChange: (v) => set('backgroundType', v)
            })) : null,
          (draft.backgroundEnabled && draft.backgroundType === 'preset') ? h(Field, { label: '预设' },
            h(Select, { value: draft.backgroundPreset, options: PRESET_OPTS, onChange: (v) => set('backgroundPreset', v) })) : null,
          (draft.backgroundEnabled && draft.backgroundType === 'image') ? h(Field, { label: '本地图片名', hint: '把图片放到 ' + (packsDir ? packsDir.replace(/anim233-packs$/, 'anim233-assets') : '~/.dsh/anim233-assets') + '，填文件名（如 bg.png）。' },
            h(TextInput, { value: draft.backgroundImage, placeholder: 'bg.png', onChange: (v) => set('backgroundImage', v) })) : null,
          (draft.backgroundEnabled && draft.backgroundType === 'gradient') ? h(Field, { label: '渐变 CSS', hint: '如 linear-gradient(160deg,#0b0e1a,#141a33)' },
            h(TextInput, { value: draft.backgroundGradient, placeholder: 'linear-gradient(...)', onChange: (v) => set('backgroundGradient', v) })) : null,
          (draft.backgroundEnabled && draft.backgroundType === 'url') ? h(Field, { label: '图片网址', hint: '任意可直链的图片 URL。' },
            h(TextInput, { value: draft.backgroundUrl, placeholder: 'https://.../bg.jpg', onChange: (v) => set('backgroundUrl', v) })) : null
        ),

        /* git 导入 */
        h('div', { className: '__a233_group' },
          h('div', { className: '__a233_groupTitle' }, '导入别人的动画包（git）'),
          h('div', { className: '__a233_hint' }, '对方仓库需含 pack.js（调用 window.ANIM233.register）和可选 manifest.json（含 name/style）。可重复导入更新（git pull）。'),
          h('div', { className: '__a233_importRow' },
            h('input', { className: '__a233_input', style: { flex: '1 1 280px' }, type: 'text', placeholder: 'https://github.com/xxx/anim-pack.git', value: importUrl, spellCheck: false, onChange: (e) => setImportUrl(e.target.value) }),
            h('input', { className: '__a233_input', style: { flex: '0 1 140px' }, type: 'text', placeholder: '目录名(可选)', value: importDir, spellCheck: false, onChange: (e) => setImportDir(e.target.value) }),
            h('button', { className: '__a233_btn', disabled: importing, onClick: importPack }, importing ? '导入中…' : '导入')
          )
        ),

        h('div', { className: '__a233_actionsSticky' },
          h('div', { className: '__a233_actions' },
            h('button', { className: '__a233_btn __a233_btnPrimary', disabled: busy, onClick: save }, busy ? '处理中…' : '保存'),
            h('button', { className: '__a233_btn', onClick: preview }, '立即预览'),
            h('button', { className: '__a233_btn', disabled: busy, onClick: reset }, '恢复默认'),
            h('button', { className: '__a233_btn', disabled: busy, onClick: load }, '放弃修改'),
            dirty ? h('span', { className: '__a233_dirty' }, '● 未保存') : null,
            notice ? h('span', { className: '__a233_ok' }, notice) : null,
            error ? h('span', { className: '__a233_err' }, error) : null
          ),
          h('div', { className: '__a233_barHint' },
            '预览按已保存配置重播。', file ? h('span', { className: '__a233_barFile' }, '配置：' + file) : null,
            packsDir ? h('span', { className: '__a233_barFile' }, '导入库：' + packsDir) : null
          )
        )
      )
    }

    var inject = ['slots']
    function apply(ctx) {
      ctx.slots.inject('settings.section', function () {
        return ctx.slots.register(
          { name: 'settings.section', id: 'anim233', order: 27, label: '动画 233' },
          function () { return h(Panel, {}) }
        )
      })
    }

    exports.apply = apply
    exports.inject = inject
    return module.exports
  }
})
