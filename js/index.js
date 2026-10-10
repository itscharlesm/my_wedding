/* ==========================================================================
   The Wedding of April Joy & Emilio — interactions
   Everything you might want to personalize lives in CONFIG below.
   ========================================================================== */

const CONFIG = {
    // ISO string with explicit +08:00 offset so the countdown is correct
    // for every visitor, regardless of their own timezone.
    weddingISO: '2026-11-14T14:00:00+08:00',
    calendarYear: 2026,
    calendarMonth: 10, // 0-indexed: 10 = November
    calendarHighlightDay: 14,
    eventTitle: "April Joy & Emilio's Wedding",
    eventLocation: 'Our Mother of Perpetual Help Parish (Redemptorist Church), Davao City'
};

/* ==========================================================================
   0. The gate — tap to open the invitation, unlocks audio
   ========================================================================== */

const gate = document.getElementById('gate');
const enterBtn = document.getElementById('enterBtn');
const bgMusic = document.getElementById('bgMusic');
const soundToggle = document.getElementById('soundToggle');
const soundIcon = document.getElementById('soundIcon');

enterBtn.addEventListener('click', () => {
    bgMusic.volume = 0.45;
    bgMusic.play().catch(() => {
        /* Autoplay can still be blocked on some browsers — the sound
           toggle lets guests start it manually if that happens. */
    });
    gate.classList.add('gate-hidden');
}, { once: true });

soundToggle.addEventListener('click', () => {
    if (bgMusic.paused) {
        bgMusic.play().catch(() => {});
        soundToggle.classList.remove('muted');
        soundIcon.textContent = '♪';
    } else {
        bgMusic.pause();
        soundToggle.classList.add('muted');
        soundIcon.textContent = '♪̸';
    }
});

/* ==========================================================================
   1. Bottom nav — switches the visible panel
   ========================================================================== */

const navButtons = document.querySelectorAll('.nav-btn');
const panels = document.querySelectorAll('.panel');

navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.target;

        navButtons.forEach((b) => b.classList.toggle('active', b === btn));
        panels.forEach((p) => p.classList.toggle('active', p.id === `panel-${target}`));
    });
});

/* ==========================================================================
   2. Countdown
   ========================================================================== */

(function startCountdown() {
    const target = new Date(CONFIG.weddingISO).getTime();
    const elDays = document.getElementById('cdDays');
    const elHours = document.getElementById('cdHours');
    const elMinutes = document.getElementById('cdMinutes');
    const elSeconds = document.getElementById('cdSeconds');

    function pad(n) {
        return String(n).padStart(2, '0');
    }

    function tick() {
        const diff = Math.max(0, target - Date.now());
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        elDays.textContent = pad(days);
        elHours.textContent = pad(hours);
        elMinutes.textContent = pad(minutes);
        elSeconds.textContent = pad(seconds);
    }

    tick();
    setInterval(tick, 1000);
})();

/* ==========================================================================
   3. Calendar grid for November 2026, with the 14th highlighted
   ========================================================================== */

(function buildCalendar() {
    const grid = document.getElementById('calendarGrid');
    const monthLabel = document.getElementById('calendarMonth');
    const { calendarYear: year, calendarMonth: month, calendarHighlightDay: highlight } = CONFIG;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    monthLabel.textContent = `${monthNames[month]} ${year}`;

    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = document.createDocumentFragment();

    for (let i = 0; i < firstWeekday; i += 1) {
        const span = document.createElement('span');
        span.className = 'empty';
        cells.appendChild(span);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
        const span = document.createElement('span');
        span.textContent = day;
        if (day === highlight) span.classList.add('highlight');
        cells.appendChild(span);
    }

    grid.appendChild(cells);
})();

/* ==========================================================================
   4. Add to calendar — downloads a .ics file guests can open directly
   ========================================================================== */

document.getElementById('addToCalendarBtn').addEventListener('click', () => {
    const start = new Date(CONFIG.weddingISO);
    const end = new Date(start.getTime() + 4 * 60 * 60 * 1000); // 4-hour block

    function toICSDate(d) {
        return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }

    const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Wedding//EN',
        'BEGIN:VEVENT',
        `DTSTART:${toICSDate(start)}`,
        `DTEND:${toICSDate(end)}`,
        `SUMMARY:${CONFIG.eventTitle}`,
        `LOCATION:${CONFIG.eventLocation}`,
        'DESCRIPTION:We can\'t wait to celebrate with you!',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wedding.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});


/* ==========================================================================
   4. Add to calendar
      - normal browsers: download a .ics file
      - Messenger / Facebook / Instagram in-app browsers: they can't download
        blob files (they show the raw text), so open Google Calendar instead
   ========================================================================== */

(function setupAddToCalendar() {
    const btn = document.getElementById('addToCalendarBtn');
    const hint = document.getElementById('calendarHint');

    const inAppBrowser = /FBAN|FBAV|FB_IAB|FBIOS|Messenger|Instagram/i.test(navigator.userAgent);

    function toICSDate(d) {
        return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }

    const start = new Date(CONFIG.weddingISO);
    const end = new Date(start.getTime() + 4 * 60 * 60 * 1000); // 4-hour block
    const description = "We can't wait to celebrate with you!";

    function openGoogleCalendar() {
        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: CONFIG.eventTitle,
            dates: `${toICSDate(start)}/${toICSDate(end)}`,
            details: description,
            location: CONFIG.eventLocation
        });
        window.location.href = 'https://calendar.google.com/calendar/render?' + params.toString();
    }

    function downloadICS() {
        const ics = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Wedding//EN',
            'BEGIN:VEVENT',
            `UID:wedding-${CONFIG.weddingISO}@invitation`,
            `DTSTAMP:${toICSDate(new Date())}`,
            `DTSTART:${toICSDate(start)}`,
            `DTEND:${toICSDate(end)}`,
            `SUMMARY:${CONFIG.eventTitle}`,
            `LOCATION:${CONFIG.eventLocation}`,
            `DESCRIPTION:${description.replace(/'/g, "\\'")}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'wedding.ics';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    if (inAppBrowser && hint) hint.hidden = false;

    btn.addEventListener('click', () => {
        if (inAppBrowser) {
            openGoogleCalendar();
        } else {
            downloadICS();
        }
    });
})();