/* ── sc-player-standalone.js ─────────────────────────────────────
   Drop-in SoundCloud player — no build step, no framework.
   Requires: <script src="https://w.soundcloud.com/player/api.js">
   Config:   window.PLAYER_CONFIG (see shell.html)
────────────────────────────────────────────────────────────────── */
;(function () {
  'use strict'

  var cfg = window.PLAYER_CONFIG || {}
  var theme = cfg.theme || {}
  var playlists = cfg.playlists || {}
  var defaultKey = cfg.defaultPlaylist || Object.keys(playlists)[0]
  var allTracks = (playlists[defaultKey] && playlists[defaultKey].tracks) || []
  var currentIdx = 0
  var isPlaying = false
  var currentDur = 0
  var currentPos = 0
  var w = null

  // ── CSS ────────────────────────────────────────────────────
  var cssVars = [
    '--scp-bg:' + (theme.bg || '#1a1a24'),
    '--scp-border:' + (theme.border || '#333842'),
    '--scp-text:' + (theme.text || '#ffffffde'),
    '--scp-muted:' + (theme.muted || '#9ca3af'),
    '--scp-accent:' + (theme.accent || '#aa3bff'),
    '--scp-accent-hover:' + (theme.accentHover || '#9a2bff'),
    '--scp-active-bg:' + (theme.activeBg || 'rgba(170,59,255,0.15)'),
    '--scp-list-bg:' + (theme.listBg || '#242430'),
    '--scp-bar-h:' + (theme.barHeight || '64px'),
    '--scp-radius:' + (theme.borderRadius || '4px'),
    '--scp-font:' + (theme.fontFamily || 'Inter,system-ui,sans-serif'),
  ].join(';')

  var barH = theme.barHeight || '64px'
  var position = cfg.position || 'bottom'

  document.documentElement.style.cssText = cssVars + ';'

  // ── Helpers ────────────────────────────────────────────────
  function formatTime(ms) {
    if (!ms || isNaN(ms) || ms <= 0) return '0:00'
    var s = Math.floor(ms / 1000)
    var h = Math.floor(s / 3600)
    var m = Math.floor((s % 3600) / 60)
    var sec = s % 60
    return h > 0 ? h + ':' + String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0') : m + ':' + String(sec).padStart(2, '0')
  }

  // ── Render ─────────────────────────────────────────────────
  function render() {
    var t = allTracks[currentIdx] || {}
    var pct = currentDur > 0 ? (currentPos / currentDur) * 100 : 0
    var plKeys = Object.keys(playlists)
    var plCount = plKeys.length

    var el = document.getElementById('sc-player-root')
    if (!el) {
      el = document.createElement('div')
      el.id = 'sc-player-root'
      document.body.appendChild(el)
    }

    el.innerHTML =
      '<div class="sc-player sc-player--' + position + '" style="' + cssVars + '">' +
        '<iframe id="sc-widget" class="sc-player__iframe" src="' + (cfg.scEmbedUrl || '') + '" allow="autoplay" title="SoundCloud"></iframe>' +
        '<div class="sc-player__bar">' +
          '<div class="sc-player__info">' +
            '<div class="sc-player__artwork">' +
              (t.artwork_url ? '<img src="' + t.artwork_url + '" alt=""/>' : '<div class="sc-player__artwork-placeholder">♪</div>') +
            '</div>' +
            '<div class="sc-player__text">' +
              '<div class="sc-player__title">' + (t.title || 'Loading...') + '</div>' +
              '<div class="sc-player__artist">' + (t.artist || '') + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="sc-player__controls">' +
            (cfg.showNavButtons !== false ?
              '<button class="sc-player__btn sc-player__btn--prev" id="scp-prev">‹‹</button>' +
              '<button class="sc-player__btn sc-player__btn--play" id="scp-play">' + (isPlaying ? '❚❚' : '▶') + '</button>' +
              '<button class="sc-player__btn sc-player__btn--next" id="scp-next">››</button>'
              : '') +
            (cfg.showPlaylistSelect !== false && plCount > 1 ?
              '<select class="sc-player__select" id="scp-sel">' +
                plKeys.map(function(k) {
                  return '<option value="' + k + '"' + (k === defaultKey ? ' selected' : '') + '>' + playlists[k].label + '</option>'
                }).join('') +
              '</select>'
              : '') +
          '</div>' +
          (cfg.showProgress !== false ?
            '<div class="sc-player__progress" id="scp-prog"><div class="sc-player__progress-fill" style="width:' + pct + '%"></div></div>'
            : '') +
          (cfg.showTrackList !== false ?
            '<button class="sc-player__tracks-btn" id="scp-trk">☰ ' + allTracks.length + '</button>'
            : '') +
        '</div>' +
        '<div class="sc-player__tracks" id="scp-list" style="display:none">' +
          allTracks.map(function(tr, i) {
            return '<button class="sc-player__track' + (i === currentIdx ? ' active' : '') + '" data-i="' + i + '">' +
              '<span class="sc-player__track-num">' + (i + 1) + '</span>' +
              '<span class="sc-player__track-title">' + tr.title + '</span>' +
              '<span class="sc-player__track-dur">' + formatTime(tr.duration) + '</span>' +
              (i === currentIdx && isPlaying ? '<span class="sc-player__playing">♫</span>' : '') +
            '</button>'
          }).join('') +
        '</div>' +
      '</div>'

    bind()
  }

  // ── Widget Init ────────────────────────────────────────────
  function initWidget() {
    if (!window.SC || !window.SC.Widget) return
    var iframe = document.getElementById('sc-widget')
    if (!iframe) return
    w = new window.SC.Widget(iframe)

    w.bind(window.SC.Widget.Events.READY, function() {
      w.isPaused(function(p) { isPlaying = !p; render() })
    })
    w.bind(window.SC.Widget.Events.PLAY, function() { isPlaying = true; render() })
    w.bind(window.SC.Widget.Events.PAUSE, function() { isPlaying = false; render() })
    w.bind(window.SC.Widget.Events.SOUND_CHANGE, function() {
      w.getCurrentSound(function(s) {
        if (s) {
          var i = allTracks.findIndex(function(t) { return t.id === s.id })
          if (i >= 0) currentIdx = i
          w.getDuration(function(d) { currentDur = d })
          render()
        }
      })
    })
    setInterval(function() {
      if (w) w.getPosition(function(p) {
        currentPos = p
        var f = document.querySelector('.sc-player__progress-fill')
        if (f) f.style.width = (currentDur > 0 ? (currentPos / currentDur) * 100 : 0) + '%'
      })
    }, 500)
  }

  // ── Event Binding ──────────────────────────────────────────
  function bind() {
    var playBtn = document.getElementById('scp-play')
    var prevBtn = document.getElementById('scp-prev')
    var nextBtn = document.getElementById('scp-next')
    var sel = document.getElementById('scp-sel')
    var prog = document.getElementById('scp-prog')
    var trkBtn = document.getElementById('scp-trk')
    var list = document.getElementById('scp-list')

    if (playBtn) playBtn.onclick = function() { if (w) w.toggle() }
    if (prevBtn) prevBtn.onclick = function() { if (currentIdx > 0) navTo(currentIdx - 1); else if (w) w.prev() }
    if (nextBtn) nextBtn.onclick = function() { if (currentIdx < allTracks.length - 1) navTo(currentIdx + 1); else if (w) w.next() }

    if (sel) sel.onchange = function() {
      defaultKey = sel.value
      allTracks = (playlists[defaultKey] && playlists[defaultKey].tracks) || []
      currentIdx = 0
      currentDur = 0
      currentPos = 0
      render()
    }

    if (prog) prog.onclick = function(e) {
      if (!w || !currentDur) return
      var r = prog.getBoundingClientRect()
      w.seekTo(currentDur * ((e.clientX - r.left) / r.width))
    }

    if (trkBtn) trkBtn.onclick = function() {
      if (!list) return
      list.style.display = list.style.display === 'none' ? 'block' : 'none'
    }

    if (list) {
      var tracks = list.querySelectorAll('.sc-player__track')
      for (var i = 0; i < tracks.length; i++) {
        (function(idx) {
          tracks[idx].onclick = function() { navTo(idx) }
        })(i)
      }
    }
  }

  // ── Navigate to track ──────────────────────────────────────
  function navTo(i) {
    var t = allTracks[i]
    if (!t || !t.permalink_url || !w) return
    currentIdx = i
    currentDur = t.duration || 0
    currentPos = 0
    w.load(t.permalink_url)
    render()
    if (cfg.autoplayOnSelect !== false) {
      setTimeout(function() { w.play() }, cfg.autoplayDelay || 500)
    }
  }

  // ── Start ──────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { render(); setTimeout(initWidget, 100) })
  } else {
    render()
    setTimeout(initWidget, 100)
  }
})()
