/* ── sc-player-standalone.js ───────────────────────────────────────────
   Drop-in SoundCloud player — no build step, no framework needed.

   REQUIREMENTS:
   <script src="https://w.soundcloud.com/player/api.js"></script>
   <script>window.PLAYER_CONFIG = { ... }</script>

   See shell.html for a complete configuration template.

   Version: 1.0.0
   License: MIT
   ──────────────────────────────────────────────────────────────────── */
;(function () {
  'use strict'

  /* ── Config & State ─────────────────────────────────────────────── */
  var cfg = window.PLAYER_CONFIG || {}
  var theme = cfg.theme || {}
  var playlists = cfg.playlists || {}
  var playlistKeys = Object.keys(playlists)
  var defaultKey = cfg.defaultPlaylist || (playlistKeys.length ? playlistKeys[0] : '')
  var allTracks = (playlists[defaultKey] && playlists[defaultKey].tracks) || []
  var currentIdx = 0
  var isPlaying = false
  var currentDur = 0
  var currentPos = 0
  var widget = null
  var widgetReady = false
  var progressTimer = null

  /* ── CSS Custom Properties ──────────────────────────────────────── */
  var cssVars = [
    '--scp-bg:' + (theme.bg || '#1a1a24'),
    '--scp-border:' + (theme.border || '#111316'),
    '--scp-text:' + (theme.text || '#ffffffde'),
    '--scp-muted:' + (theme.muted || '#ffffff'),
    '--scp-accent:' + (theme.accent || '#ffffff'),
    '--scp-accent-hover:' + (theme.accentHover || '#ffffff'),
    '--scp-active-bg:' + (theme.activeBg || 'rgba(12, 12, 12, 0.72)'),
    '--scp-list-bg:' + (theme.listBg || '#242430'),
    '--scp-bar-h:' + (theme.barHeight || '64px'),
    '--scp-radius:' + (theme.borderRadius || '4px'),
    '--scp-font:' + (theme.fontFamily || 'Inter,system-ui,sans-serif'),
  ].join(';')

  var position = cfg.position || 'bottom'

  /* ── Helpers ────────────────────────────────────────────────────── */
  function formatTime(ms) {
    if (!ms || isNaN(ms) || ms <= 0) return '0:00'
    var s = Math.floor(ms / 1000)
    var h = Math.floor(s / 3600)
    var m = Math.floor((s % 3600) / 60)
    var sec = s % 60
    return h > 0
      ? h + ':' + pad(m) + ':' + pad(sec)
      : m + ':' + pad(sec)
  }

  function pad(n) { return String(n).padStart(2, '0') }

  function escapeHtml(str) {
    if (!str) return ''
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  function resolveArtwork(url) {
    if (!url) return null
    return url.indexOf('sndcdn.com') !== -1 ? url.replace('-large', '-t500x500') : url
  }

  /* ── Render ─────────────────────────────────────────────────────── */
  function render() {
    var t = allTracks[currentIdx] || {}
    var pct = currentDur > 0 ? Math.round((currentPos / currentDur) * 100) : 0
    var showNav = cfg.showNavButtons !== false
    var showSel = cfg.showPlaylistSelect !== false && playlistKeys.length > 1
    var showProg = cfg.showProgress !== false
    var showTrk = cfg.showTrackList !== false

    // Resolve artwork
    var artUrl = resolveArtwork(t.artwork_url)

    var el = document.getElementById('sc-player-root')
    if (!el) {
      el = document.createElement('div')
      el.id = 'sc-player-root'
      document.body.appendChild(el)
    }

    el.innerHTML =
      '<div class="sc-player sc-player--' + position + '" style="' + cssVars + '">' +

        // Hidden SoundCloud iframe
        '<iframe id="sc-widget" class="sc-player__iframe" src="' + escapeHtml(cfg.scEmbedUrl || '') + '" allow="autoplay" title="SoundCloud Player" tabindex="-1"></iframe>' +

        // Player bar
        '<div class="sc-player__bar">' +

          // Track info
          '<div class="sc-player__info">' +
            '<div class="sc-player__artwork">' +
              (artUrl
                ? '<img src="' + escapeHtml(artUrl) + '" alt="" />'
                : '<div class="sc-player__artwork-placeholder">♪</div>'
              ) +
            '</div>' +
            '<div class="sc-player__text">' +
              '<div class="sc-player__title">' + escapeHtml(t.title || 'No track selected') + '</div>' +
              '<div class="sc-player__artist">' + escapeHtml(t.artist || '') + '</div>' +
            '</div>' +
          '</div>' +

          // Controls
          '<div class="sc-player__controls">' +
            (showNav ? (
              '<button class="sc-player__btn sc-player__btn--prev" id="scp-prev" aria-label="Previous track"' + (!allTracks.length ? ' disabled' : '') + '>\u2039\u2039</button>' +
              '<button class="sc-player__btn sc-player__btn--play" id="scp-play" aria-label="' + (isPlaying ? 'Pause' : 'Play') + '"' + (!widgetReady || !allTracks.length ? ' disabled' : '') + '>' + (isPlaying ? '\u275A\u275A' : '\u25B6') + '</button>' +
              '<button class="sc-player__btn sc-player__btn--next" id="scp-next" aria-label="Next track"' + (!allTracks.length ? ' disabled' : '') + '>\u203A\u203A</button>'
            ) : '') +
            (showSel ? (
              '<select class="sc-player__select" id="scp-sel" aria-label="Select playlist">' +
                playlistKeys.map(function(k) {
                  return '<option value="' + escapeHtml(k) + '"' + (k === defaultKey ? ' selected' : '') + '>' + escapeHtml(playlists[k].label) + '</option>'
                }).join('') +
              '</select>'
            ) : '') +
          '</div>' +

          // Progress bar
          (showProg ? (
            '<div class="sc-player__progress" id="scp-prog" role="slider" aria-label="Playback progress" aria-valuenow="' + Math.round(currentPos) + '" aria-valuemin="0" aria-valuemax="' + Math.max(currentDur, 1) + '" tabindex="0">' +
              '<div class="sc-player__progress-fill" style="width:' + pct + '%"></div>' +
            '</div>'
          ) : '') +

          // Track list toggle
          (showTrk && allTracks.length > 0 ? (
            '<button class="sc-player__tracks-btn" id="scp-trk" aria-label="Toggle track list" aria-expanded="false">' +
              '<span class="sc-player__tracks-btn-icon">\u2630</span>' +
              '<span class="sc-player__tracks-count">' + allTracks.length + '</span>' +
            '</button>'
          ) : '') +

        '</div>' +

        // Track list panel
        (showTrk ? (
          '<div class="sc-player__tracks" id="scp-list" role="list" aria-label="Track list">' +
            allTracks.map(function(tr, i) {
              var active = i === currentIdx
              return '<button class="sc-player__track' + (active ? ' active' : '') + '" data-i="' + i + '" role="listitem"' + (active && isPlaying ? ' aria-current="true"' : '') + '>' +
                '<span class="sc-player__track-num">' + (i + 1) + '</span>' +
                '<span class="sc-player__track-title">' + escapeHtml(tr.title) + '</span>' +
                '<span class="sc-player__track-dur">' + formatTime(tr.duration) + '</span>' +
                (active && isPlaying ? '<span class="sc-player__playing" aria-label="Currently playing">\u266B</span>' : '') +
              '</button>'
            }).join('') +
          '</div>'
        ) : '') +

      '</div>'

    bindEvents()
  }

  /* ── Widget Init ────────────────────────────────────────────────── */
  function initWidget() {
    if (!window.SC || !window.SC.Widget) {
      renderError('SoundCloud API not loaded. Add: <script src="https://w.soundcloud.com/player/api.js"><\/script>')
      return
    }

    var iframe = document.getElementById('sc-widget')
    if (!iframe) return

    try {
      widget = new window.SC.Widget(iframe)
    } catch (e) {
      renderError('Failed to initialize SoundCloud widget: ' + e.message)
      return
    }

    var Events = window.SC.Widget.Events

    widget.bind(Events.READY, function () {
      widgetReady = true
      widget.isPaused(function (p) {
        isPlaying = !p
        updatePlayButton()
      })
    })

    widget.bind(Events.PLAY, function () {
      isPlaying = true
      updatePlayButton()
    })

    widget.bind(Events.PAUSE, function () {
      isPlaying = false
      updatePlayButton()
    })

    widget.bind(Events.SOUND_CHANGE, function () {
      widget.getCurrentSound(function (s) {
        if (s) {
          var i = findTrackIndex(s.id)
          if (i >= 0) currentIdx = i
          widget.getDuration(function (d) { currentDur = d })
          updatePlayButton()
        }
      })
    })

    widget.bind(Events.ERROR, function () {
      renderError('SoundCloud widget encountered an error.')
    })

    // Progress polling
    progressTimer = setInterval(function () {
      if (widget && widgetReady) {
        widget.getPosition(function (p) {
          currentPos = p
          var fill = document.querySelector('.sc-player__progress-fill')
          if (fill) {
            fill.style.width = (currentDur > 0 ? (currentPos / currentDur) * 100 : 0) + '%'
          }
          var prog = document.getElementById('scp-prog')
          if (prog) {
            prog.setAttribute('aria-valuenow', Math.round(p))
          }
        })
      }
    }, 500)
  }

  /* ── Find track index by SoundCloud ID ──────────────────────────── */
  function findTrackIndex(id) {
    for (var i = 0; i < allTracks.length; i++) {
      if (allTracks[i].id === id) return i
    }
    return -1
  }

  /* ── Update just the play button text (avoid full re-render) ────── */
  function updatePlayButton() {
    var btn = document.getElementById('scp-play')
    if (btn) {
      btn.textContent = isPlaying ? '\u275A\u275A' : '\u25B6'
      btn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play')
    }
    // Update playing indicators in track list
    var tracks = document.querySelectorAll('.sc-player__track')
    for (var i = 0; i < tracks.length; i++) {
      var idx = parseInt(tracks[i].getAttribute('data-i'), 10)
      var playing = tracks[i].querySelector('.sc-player__playing')
      if (idx === currentIdx && isPlaying && !playing) {
        var span = document.createElement('span')
        span.className = 'sc-player__playing'
        span.setAttribute('aria-label', 'Currently playing')
        span.textContent = '\u266B'
        tracks[i].appendChild(span)
      } else if ((idx !== currentIdx || !isPlaying) && playing) {
        playing.parentNode.removeChild(playing)
      }
    }
  }

  /* ── Render error state ─────────────────────────────────────────── */
  function renderError(msg) {
    var el = document.getElementById('sc-player-root')
    if (!el) return
    var bar = el.querySelector('.sc-player__bar')
    if (bar) {
      var err = document.createElement('div')
      err.className = 'sc-player__error'
      err.setAttribute('role', 'alert')
      err.textContent = msg || 'Player unavailable.'
      bar.parentNode.insertBefore(err, bar.nextSibling)
    }
  }

  /* ── Event Binding ──────────────────────────────────────────────── */
  function bindEvents() {
    var playBtn = document.getElementById('scp-play')
    var prevBtn = document.getElementById('scp-prev')
    var nextBtn = document.getElementById('scp-next')
    var sel = document.getElementById('scp-sel')
    var prog = document.getElementById('scp-prog')
    var trkBtn = document.getElementById('scp-trk')
    var list = document.getElementById('scp-list')

    if (playBtn) playBtn.onclick = function () { if (widget) widget.toggle() }

    if (prevBtn) prevBtn.onclick = function () {
      if (currentIdx > 0) navTo(currentIdx - 1)
      else if (widget) widget.prev()
    }

    if (nextBtn) nextBtn.onclick = function () {
      if (currentIdx < allTracks.length - 1) navTo(currentIdx + 1)
      else if (widget) widget.next()
    }

    if (sel) sel.onchange = function () {
      var key = sel.value
      if (!key || !playlists[key]) return
      defaultKey = key
      allTracks = (playlists[key] && playlists[key].tracks) || []
      currentIdx = 0
      currentDur = 0
      currentPos = 0
      isPlaying = false
      render()
    }

    if (prog) prog.onclick = function (e) {
      if (!widget || !currentDur) return
      var rect = prog.getBoundingClientRect()
      var pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      widget.seekTo(currentDur * pct)
    }

    if (trkBtn) trkBtn.onclick = function () {
      if (!list) return
      var isOpen = list.classList.contains('sc-player__tracks--open')
      list.classList.toggle('sc-player__tracks--open')
      trkBtn.setAttribute('aria-expanded', String(!isOpen))
      // Update icon
      var icon = trkBtn.querySelector('.sc-player__tracks-btn-icon')
      if (icon) icon.textContent = isOpen ? '\u2630' : '\u00D7'
    }

    if (list) {
      var tracks = list.querySelectorAll('.sc-player__track')
      for (var i = 0; i < tracks.length; i++) {
        (function (idx) {
          tracks[idx].onclick = function () { navTo(idx) }
        })(i)
      }
    }
  }

  /* ── Navigate to track ──────────────────────────────────────────── */
  function navTo(i) {
    var t = allTracks[i]
    if (!t || !t.permalink_url || !widget) return
    currentIdx = i
    currentDur = t.duration || 0
    currentPos = 0
    try {
      widget.load(t.permalink_url)
    } catch (e) {
      renderError('Failed to load track: ' + e.message)
      return
    }
    render()
    if (cfg.autoplayOnSelect !== false) {
      setTimeout(function () {
        try { widget.play() } catch (e) { /* ignore */ }
      }, cfg.autoplayDelay || 500)
    }
  }

  /* ── Cleanup on page unload ─────────────────────────────────────── */
  if (progressTimer) {
    window.addEventListener('beforeunload', function () {
      clearInterval(progressTimer)
    })
  }

  /* ── Start ──────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      render()
      setTimeout(initWidget, 100)
    })
  } else {
    render()
    setTimeout(initWidget, 100)
  }
})()
