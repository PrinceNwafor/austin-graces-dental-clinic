/* ==========================================================================
   AUSTIN GRACES DENTAL CLINIC — main.js
   ----------------------------------------------------------------------------
   EDIT CLINIC DETAILS IN ONE PLACE (the CLINIC object below):
   - whatsapp : number in international format, NO "+", NO spaces (Nigeria = 234…)
   - phone    : tel: link target
   All "Chat on WhatsApp" buttons and the booking flow read from here.
   ========================================================================== */
(function () {
  'use strict';

  /* ---- SINGLE SOURCE OF TRUTH — replace with final clinic details ---- */
  var CLINIC = {
    name:        'Austin Graces Dental Clinic',
    whatsapp:    '2349085005646',         // 0908 500 5646  →  234 908 500 5646
    phone:       '+2349085005646',
    phoneText:   '0908 500 5646',
    location:    'Enugu, Nigeria'
  };
  window.CLINIC = CLINIC;

  var WA_BASE = 'https://wa.me/' + CLINIC.whatsapp;
  function waLink(msg) { return WA_BASE + (msg ? '?text=' + encodeURIComponent(msg) : ''); }

  /* --------------------------------------------------------------------------
     1. WHATSAPP LINK WIRING
     Any element with [data-wa] gets a wa.me href built from its message text.
     -------------------------------------------------------------------------- */
  function wireWhatsApp() {
    document.querySelectorAll('[data-wa]').forEach(function (el) {
      var msg = el.getAttribute('data-wa') ||
        ('Hello ' + CLINIC.name + ', I would like to book a dental appointment.');
      el.setAttribute('href', waLink(msg));
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener');
    });
    // tel: links
    document.querySelectorAll('[data-tel]').forEach(function (el) {
      el.setAttribute('href', 'tel:' + CLINIC.phone);
    });
  }

  /* --------------------------------------------------------------------------
     2. DEMO RIBBON dismiss
     -------------------------------------------------------------------------- */
  var ribbonX = document.querySelector('.ribbon__x');
  if (ribbonX) ribbonX.addEventListener('click', function () {
    document.body.classList.add('ribbon-hidden');
  });

  /* --------------------------------------------------------------------------
     3. NAV — scroll shadow + mobile menu
     -------------------------------------------------------------------------- */
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('nav--scrolled', window.scrollY > 20); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  var burger = document.querySelector('.burger');
  var mnav = document.querySelector('.mobile-nav');
  var mnavX = document.querySelector('.mobile-nav__x');
  function openMenu() { if (mnav) { mnav.classList.add('mobile-nav--open'); document.body.style.overflow = 'hidden'; } }
  function closeMenu() { if (mnav) { mnav.classList.remove('mobile-nav--open'); document.body.style.overflow = ''; } }
  if (burger) burger.addEventListener('click', openMenu);
  if (mnavX) mnavX.addEventListener('click', closeMenu);
  document.querySelectorAll('.mobile-nav a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* --------------------------------------------------------------------------
     4. REVEAL ON SCROLL
     -------------------------------------------------------------------------- */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('reveal--in'); ro.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { ro.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('reveal--in'); });
  }

  /* --------------------------------------------------------------------------
     5. ACCORDION (FAQ)
     -------------------------------------------------------------------------- */
  document.querySelectorAll('.acc__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.acc');
      var panel = item.querySelector('.acc__panel');
      var open = item.classList.contains('acc--open');
      document.querySelectorAll('.acc').forEach(function (i) {
        i.classList.remove('acc--open');
        var p = i.querySelector('.acc__panel'); if (p) p.style.maxHeight = '0';
      });
      if (!open) { item.classList.add('acc--open'); if (panel) panel.style.maxHeight = panel.scrollHeight + 'px'; }
    });
  });

  /* --------------------------------------------------------------------------
     6. COUNTERS
     -------------------------------------------------------------------------- */
  function countTo(el, target, dur) {
    var start = null;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(target * eased).toLocaleString() + (el.dataset.suffix || '');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var nums = document.querySelectorAll('[data-count]');
  if (nums.length && 'IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { countTo(en.target, parseInt(en.target.dataset.count, 10), 1600); co.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (el) { co.observe(el); });
  }

  /* --------------------------------------------------------------------------
     7. TOAST
     -------------------------------------------------------------------------- */
  function toast(msg, type) {
    var old = document.querySelector('.toast'); if (old) old.remove();
    var t = document.createElement('div');
    t.className = 'toast' + (type === 'error' ? ' toast--error' : '');
    t.innerHTML = '<span>' + (type === 'error' ? '!' : '✓') + '</span><span>' + msg + '</span>';
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('toast--show'); });
    setTimeout(function () { t.classList.remove('toast--show'); setTimeout(function () { t.remove(); }, 300); }, 3800);
  }

  /* --------------------------------------------------------------------------
     8. BOOKING ENGINE  (Service → Date & Time → Details → Confirm → WhatsApp)
     -------------------------------------------------------------------------- */
  var booking = document.querySelector('.booking');
  if (booking) initBooking(booking);

  function initBooking(root) {
    var panels = Array.prototype.slice.call(root.querySelectorAll('.bpanel'));
    var steps = Array.prototype.slice.call(root.querySelectorAll('.bstep'));
    var success = root.querySelector('.booking__success');
    var stepper = root.querySelector('.booking__steps');
    var body = root.querySelector('.booking__body');
    var current = 0;
    var state = { service: null, date: null, time: null, name: '', phone: '', patient: null, notes: '' };

    /* preselect service via [data-book="Service name"] buttons elsewhere on page */
    document.querySelectorAll('[data-book]').forEach(function (b) {
      b.addEventListener('click', function () {
        var val = b.getAttribute('data-book');
        if (val) {
          var tile = root.querySelector('.opt[data-group="service"][data-value="' + val + '"]');
          if (tile) selectOpt(tile, 'service');
        }
      });
    });

    /* dates: next 12 open days (skip Sundays) */
    var dateRow = root.querySelector('.date-row');
    if (dateRow) {
      var dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      var mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      var base = new Date(); var added = 0, off = 1;
      while (added < 12) {
        var d = new Date(base); d.setDate(base.getDate() + off); off++;
        if (d.getDay() === 0) continue;
        var label = dow[d.getDay()] + ', ' + mon[d.getMonth()] + ' ' + d.getDate();
        var pill = document.createElement('button');
        pill.type = 'button'; pill.className = 'date-pill'; pill.dataset.date = label;
        pill.innerHTML = '<div class="dow">' + dow[d.getDay()] + '</div><div class="day">' + d.getDate() + '</div><div class="mon">' + mon[d.getMonth()] + '</div>';
        pill.addEventListener('click', (function (p) {
          return function () {
            dateRow.querySelectorAll('.date-pill').forEach(function (x) { x.classList.remove('date-pill--sel'); });
            p.classList.add('date-pill--sel'); state.date = p.dataset.date;
            var tw = root.querySelector('[data-time-wrap]'); if (tw) tw.style.display = 'block';
            root.querySelectorAll('.time-slot--sel').forEach(function (s) { s.classList.remove('time-slot--sel'); });
            state.time = null; validate();
          };
        })(pill));
        dateRow.appendChild(pill); added++;
      }
    }

    /* time slots */
    root.querySelectorAll('.time-slot').forEach(function (slot) {
      if (slot.classList.contains('time-slot--off')) return;
      slot.addEventListener('click', function () {
        root.querySelectorAll('.time-slot').forEach(function (s) { s.classList.remove('time-slot--sel'); });
        slot.classList.add('time-slot--sel'); state.time = slot.textContent.trim(); validate();
      });
    });

    /* option tiles (service) */
    function selectOpt(tile, group) {
      root.querySelectorAll('.opt[data-group="' + group + '"]').forEach(function (t) { t.classList.remove('opt--sel'); });
      tile.classList.add('opt--sel'); state[group] = tile.dataset.value; validate();
    }
    root.querySelectorAll('.opt').forEach(function (tile) {
      tile.addEventListener('click', function () { selectOpt(tile, tile.dataset.group); });
    });

    /* detail fields */
    var fName = root.querySelector('#bk-name'), fPhone = root.querySelector('#bk-phone'), fNotes = root.querySelector('#bk-notes');
    [fName, fPhone, fNotes].forEach(function (f) {
      if (f) f.addEventListener('input', function () {
        state.name = fName && fName.value.trim() || '';
        state.phone = fPhone && fPhone.value.trim() || '';
        state.notes = fNotes && fNotes.value.trim() || '';
        validate();
      });
    });
    root.querySelectorAll('input[name="bk-patient"]').forEach(function (r) {
      r.addEventListener('change', function () { state.patient = r.value; validate(); });
    });

    /* nav buttons */
    root.querySelectorAll('[data-next]').forEach(function (b) { b.addEventListener('click', function () { goTo(current + 1); }); });
    root.querySelectorAll('[data-prev]').forEach(function (b) { b.addEventListener('click', function () { goTo(current - 1); }); });

    var confirmBtn = root.querySelector('[data-confirm]');
    if (confirmBtn) confirmBtn.addEventListener('click', function () {
      if (!validate()) return;
      renderSummary();
      if (stepper) stepper.style.display = 'none';
      if (body) body.style.display = 'none';
      if (success) success.classList.add('booking__success--active');
      // build WhatsApp message + wire the send button
      var msg = 'Hello ' + CLINIC.name + ', I would like to book a dental appointment.%0A%0A'
        .replace('%0A%0A', '\n\n')
        + '• Treatment: ' + (state.service || '-') + '\n'
        + '• Preferred date: ' + (state.date || '-') + '\n'
        + '• Preferred time: ' + (state.time || '-') + '\n'
        + '• Name: ' + (state.name || '-') + '\n'
        + '• Phone: ' + (state.phone || '-') + '\n'
        + '• Patient: ' + (state.patient || '-')
        + (state.notes ? '\n• Note: ' + state.notes : '')
        + '\n\nPlease confirm if this time is available. Thank you!';
      var send = root.querySelector('[data-wa-send]');
      if (send) { send.setAttribute('href', waLink(msg)); send.setAttribute('target', '_blank'); send.setAttribute('rel', 'noopener'); }
      root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    function goTo(i) {
      if (i < 0 || i >= panels.length) return;
      if (i > current && !validate()) { toast('Please complete this step first.', 'error'); return; }
      current = i;
      panels.forEach(function (p, idx) { p.classList.toggle('bpanel--active', idx === current); });
      steps.forEach(function (s, idx) {
        s.classList.toggle('bstep--active', idx === current);
        s.classList.toggle('bstep--done', idx < current);
      });
      if (current === panels.length - 1) renderSummary();
      validate();
      root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function validate() {
      var ok = true;
      if (current === 0) ok = !!state.service;
      else if (current === 1) ok = !!state.date && !!state.time;
      else if (current === 2) ok = !!state.name && !!state.phone && !!state.patient;
      var panel = panels[current];
      if (panel) {
        var adv = panel.querySelector('[data-next],[data-confirm]');
        if (adv) { adv.disabled = !ok; adv.style.opacity = ok ? '1' : '.5'; adv.style.cursor = ok ? 'pointer' : 'not-allowed'; }
      }
      return ok;
    }

    function renderSummary() {
      var map = {
        '[data-s-service]': state.service || '—',
        '[data-s-date]': state.date || '—',
        '[data-s-time]': state.time || '—',
        '[data-s-name]': state.name || '—',
        '[data-s-phone]': state.phone || '—',
        '[data-s-patient]': state.patient || '—'
      };
      Object.keys(map).forEach(function (sel) {
        root.querySelectorAll(sel).forEach(function (el) { el.textContent = map[sel]; });
      });
    }

    validate();
  }

  /* --------------------------------------------------------------------------
     9. INIT
     -------------------------------------------------------------------------- */
  wireWhatsApp();

})();
