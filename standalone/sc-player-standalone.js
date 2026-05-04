/* ── sc-player-standalone.js ───────────────────────────────────────────
   Drop-in SoundCloud player — no build step, no framework needed.

   REQUIREMENTS:
   <script src="https://w.soundcloud.com/player/api.js"></script>
   <script>window.PLAYER_CONFIG = { ... }</script>

   See shell.html for a complete configuration template.

   Version: 1.1.0
   License: MIT
   ──────────────────────────────────────────────────────────────────── */
;(function () {
  'use strict'

  /* ── Config & State ─────────────────────────────────────────────── */
  var cfg = window.PLAYER_CONFIG || {}
  var theme = cfg.theme || {}
  var playlists = cfg.playlists || {}
  var playlistKeys = Object.keys(playlists)
  var storageKey = cfg.storageKey || 'scp-state'
  var persist = cfg.persist !== false

  // Load state from localStorage
  var savedState = null
  if (persist) {
    try {
      var saved = localStorage.getItem(storageKey)
      if (saved) savedState = JSON.parse(saved)
    } catch (e) {}
  }

  var defaultKey = (savedState && savedState.playlist && playlists[savedState.playlist])
    ? savedState.playlist
    : (cfg.defaultPlaylist || (playlistKeys.length ? playlistKeys[0] : ''))

  var allTracks = (playlists[defaultKey] && playlists[defaultKey].tracks) || []
  var currentIdx = (savedState && savedState.index < allTracks.length) ? savedState.index : 0
  var currentPos = (savedState && savedState.progress) ? savedState.progress : 0

  var isPlaying = false
  var currentDur = (allTracks[currentIdx] && allTracks[currentIdx].duration) || 0
  var widget = null
  var widgetReady = false
  var progressTimer = null

  /* ── Icons (SVG) ────────────────────────────────────────────────── */
  var ICONS = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>',
    music: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>'
  }

  /* ── CSS Custom Properties ──────────────────────────────────────── */
  var cssVars = [
    '--scp-bg:' + (theme.bg || '#1a1a24'),
    '--scp-border:' + (theme.border || '#333842'),
    '--scp-text:' + (theme.text || '#d1d1d1de'),
    '--scp-muted:' + (theme.muted || '#9ca3af'),
    '--scp-accent:' + (theme.accent || '#1a1a1a'),
    '--scp-accent-hover:' + (theme.accentHover || '#000000'),
    '--scp-active-bg:' + (theme.activeBg || 'rgba(62, 62, 62, 0.15)'),
    '--scp-list-bg:' + (theme.listBg || '#0c0c0c'),
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
    var pl = playlists[defaultKey] || {}
    var pct = currentDur > 0 ? Math.round((currentPos / currentDur) * 100) : 0
    var showNav = cfg.showNavButtons !== false
    var showSel = cfg.showPlaylistSelect !== false && playlistKeys.length > 1
    var showProg = cfg.showProgress !== false
    var showTrk = cfg.showTrackList !== false

    var artUrl = resolveArtwork(t.artwork_url)

    var el = document.getElementById('sc-player-root')
    if (!el) {
      el = document.createElement('div')
      el.id = 'sc-player-root'
      document.body.appendChild(el)
    }

    el.innerHTML =
      '<div class="sc-player sc-player--' + position + '" style="' + cssVars + '" role="region" aria-label="SoundCloud Player">' +
        '<iframe id="sc-widget" class="sc-player__iframe" src="' + escapeHtml(cfg.scEmbedUrl || '') + '" allow="autoplay" title="SoundCloud Player" tabindex="-1"></iframe>' +
        '<div id="scp-error-container"></div>' +

        '<div class="sc-player__bar">' +
          '<div class="sc-player__info">' +
            '<div class="sc-player__artwork">' +
              (t.permalink_url 
                ? '<a href="' + escapeHtml(t.permalink_url) + '" target="_blank" rel="noopener noreferrer" title="View on SoundCloud">' +
                    (artUrl ? '<img src="' + escapeHtml(artUrl) + '" alt="" loading="lazy" />' : '') +
                    '<div class="sc-player__artwork-placeholder" style="' + (artUrl ? 'display:none' : '') + '">' + ICONS.music + '</div>' +
                  '</a>'
                : '<div class="sc-player__artwork-placeholder">' + ICONS.music + '</div>'
              ) +
            '</div>' +
            '<div class="sc-player__text">' +
              (t.permalink_url
                ? '<a href="' + escapeHtml(t.permalink_url) + '" target="_blank" rel="noopener noreferrer" class="sc-player__title" title="View on SoundCloud">' + escapeHtml(t.title || 'No track selected') + '</a>'
                : '<div class="sc-player__title">' + escapeHtml(t.title || 'No track selected') + '</div>'
              ) +
              '<div class="sc-player__artist">' +
                (pl.url 
                  ? '<a href="' + escapeHtml(pl.url) + '" target="_blank" rel="noopener noreferrer" title="View ' + escapeHtml(pl.label) + ' on SoundCloud">' + escapeHtml(t.artist || '') + '</a>'
                  : escapeHtml(t.artist || '')
                ) +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div class="sc-player__controls">' +
            (showNav ? (
              '<button class="sc-player__btn sc-player__btn--prev" id="scp-prev" aria-label="Previous track"' + (!allTracks.length ? ' disabled' : '') + '>' + ICONS.prev + '</button>' +
              '<button class="sc-player__btn sc-player__btn--play" id="scp-play" aria-label="' + (isPlaying ? 'Pause' : 'Play') + '"' + (!widgetReady || !allTracks.length ? ' disabled' : '') + '>' + (isPlaying ? ICONS.pause : ICONS.play) + '</button>' +
              '<button class="sc-player__btn sc-player__btn--next" id="scp-next" aria-label="Next track"' + (!allTracks.length ? ' disabled' : '') + '>' + ICONS.next + '</button>'
            ) : '') +
            (showSel ? (
              '<select class="sc-player__select" id="scp-sel" aria-label="Select playlist">' +
                playlistKeys.map(function(k) {
                  return '<option value="' + escapeHtml(k) + '"' + (k === defaultKey ? ' selected' : '') + '>' + escapeHtml(playlists[k].label) + '</option>'
                }).join('') +
              '</select>'
            ) : '') +
          '</div>' +

          (showProg ? (
            '<div class="sc-player__progress" id="scp-prog" role="slider" aria-label="Playback progress" aria-valuenow="' + Math.round(currentPos) + '" aria-valuemin="0" aria-valuemax="' + Math.max(currentDur, 1) + '" tabindex="0">' +
              '<div class="sc-player__progress-fill" style="width:' + pct + '%" aria-hidden="true"></div>' +
              '<span class="sc-player__sr-only" id="scp-prog-text">' + formatTime(currentPos) + ' of ' + formatTime(currentDur) + '</span>' +
            '</div>'
          ) : '') +

          (showTrk && allTracks.length > 0 ? (
            '<button class="sc-player__tracks-btn" id="scp-trk" aria-label="Toggle track list" aria-expanded="false" aria-controls="scp-list">' +
              '<span class="sc-player__tracks-btn-icon" aria-hidden="true">☰</span>' +
              '<span class="sc-player__tracks-count">' + allTracks.length + '</span>' +
            '</button>'
          ) : '') +

          '<a href="' + escapeHtml(cfg.scAccountUrl || 'https://soundcloud.com/kleinundhaarig') + '" target="_blank" rel="noopener noreferrer" class="sc-player__logo" aria-label="Visit our SoundCloud">' +
            '<img src="assets/sc-logo.png" alt="SoundCloud" />' +
          '</a>' +
        '</div>' +

        (showTrk ? (
          '<div class="sc-player__tracks" id="scp-list" role="list" aria-label="Track list">' +
            allTracks.map(function(tr, i) {
              var active = i === currentIdx
              return '<button class="sc-player__track' + (active ? ' active' : '') + '" data-i="' + i + '" role="listitem"' + (active && isPlaying ? ' aria-current="true"' : '') + '>' +
                '<span class="sc-player__track-num" aria-hidden="true">' + (i + 1) + '</span>' +
                '<span class="sc-player__track-title">' + escapeHtml(tr.title) + '</span>' +
                '<span class="sc-player__track-dur">' + formatTime(tr.duration) + '</span>' +
                (active && isPlaying ? '<span class="sc-player__playing" aria-label="Currently playing">♫</span>' : '') +
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

      if (savedState && allTracks[currentIdx] && allTracks[currentIdx].permalink_url) {
        widget.load(allTracks[currentIdx].permalink_url, { autoPlay: false })
        if (currentPos > 0) {
          widget.seekTo(currentPos)
        }
      }

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
          if (i >= 0) {
            currentIdx = i
            // Refresh list to show active track correctly
            var list = document.getElementById('scp-list')
            if (list) {
              var tracks = list.querySelectorAll('.sc-player__track')
              for (var j = 0; j < tracks.length; j++) {
                tracks[j].classList.toggle('active', j === i)
              }
            }
          }
          widget.getDuration(function (d) { 
            currentDur = d 
            updateProgress()
          })
          updatePlayButton()
        }
      })
    })

    widget.bind(Events.ERROR, function () {
      renderError('SoundCloud widget encountered an error.')
    })

    progressTimer = setInterval(updateProgress, 500)
  }

  function updateProgress() {
    if (widget && widgetReady) {
      widget.getPosition(function (p) {
        currentPos = p
        saveState()
        var fill = document.querySelector('.sc-player__progress-fill')
        if (fill) {
          fill.style.width = (currentDur > 0 ? (currentPos / currentDur) * 100 : 0) + '%'
        }
        var prog = document.getElementById('scp-prog')
        if (prog) {
          prog.setAttribute('aria-valuenow', Math.round(p))
          prog.setAttribute('aria-valuemax', Math.max(currentDur, 1))
        }
        var progText = document.getElementById('scp-prog-text')
        if (progText) {
          progText.textContent = formatTime(currentPos) + ' of ' + formatTime(currentDur)
        }
      })
    }
  }

  /* ── Save state ─────────────────────────────────────────────────── */
  function saveState() {
    if (!persist) return
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        playlist: defaultKey,
        index: currentIdx,
        progress: currentPos
      }))
    } catch (e) {}
  }

  function findTrackIndex(id) {
    for (var i = 0; i < allTracks.length; i++) {
      if (allTracks[i].id === id) return i
    }
    return -1
  }

  function updatePlayButton() {
    var btn = document.getElementById('scp-play')
    if (btn) {
      btn.innerHTML = isPlaying ? ICONS.pause : ICONS.play
      btn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play')
    }
    var tracks = document.querySelectorAll('.sc-player__track')
    for (var i = 0; i < tracks.length; i++) {
      var idx = parseInt(tracks[i].getAttribute('data-i'), 10)
      var playing = tracks[i].querySelector('.sc-player__playing')
      if (idx === currentIdx && isPlaying && !playing) {
        var span = document.createElement('span')
        span.className = 'sc-player__playing'
        span.setAttribute('aria-label', 'Currently playing')
        span.textContent = '♫'
        tracks[i].appendChild(span)
      } else if ((idx !== currentIdx || !isPlaying) && playing) {
        playing.parentNode.removeChild(playing)
      }
    }
  }

  function renderError(msg) {
    var container = document.getElementById('scp-error-container')
    if (!container) return
    container.innerHTML = 
      '<div class="sc-player__error" role="alert">' +
        '<span>' + escapeHtml(msg || 'Player unavailable.') + '</span>' +
        '<button class="sc-player__error-close" id="scp-err-close" aria-label="Close error message">' + ICONS.close + '</button>' +
      '</div>'
    
    var closeBtn = document.getElementById('scp-err-close')
    if (closeBtn) {
      closeBtn.onclick = function() { container.innerHTML = '' }
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

    if (prog) {
      prog.onclick = function (e) {
        if (!widget || !currentDur) return
        var rect = prog.getBoundingClientRect()
        var pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        widget.seekTo(currentDur * pct)
      }
      prog.onkeydown = function(e) {
        if (!widget || !currentDur) return
        var step = currentDur * 0.05 // 5% step
        if (e.key === 'ArrowRight') {
          widget.seekTo(Math.min(currentDur, currentPos + step))
        } else if (e.key === 'ArrowLeft') {
          widget.seekTo(Math.max(0, currentPos - step))
        }
      }
    }

    if (trkBtn) trkBtn.onclick = function () {
      if (!list) return
      var isOpen = list.classList.contains('sc-player__tracks--open')
      list.classList.toggle('sc-player__tracks--open')
      trkBtn.setAttribute('aria-expanded', String(!isOpen))
      var icon = trkBtn.querySelector('.sc-player__tracks-btn-icon')
      if (icon) icon.innerHTML = isOpen ? '☰' : ICONS.close
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
        try { widget.play() } catch (e) {}
      }, cfg.autoplayDelay || 500)
    }
  }

  if (progressTimer) {
    window.addEventListener('beforeunload', function () {
      clearInterval(progressTimer)
    })
  }

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
