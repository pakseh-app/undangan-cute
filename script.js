/* =====================================================
   WULAN & PAKSEH — MAIN CONTROLLER
===================================================== */
(function () {
    'use strict';

    const $ = (id) => document.getElementById(id);
    const qs = (selector, root = document) => root.querySelector(selector);
    const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    document.addEventListener('DOMContentLoaded', function () {
        initOpening();
        initMusic();
        initCalendar();
        initGallery();
        initNavigation();
        initDoa();
        initCountdown();
        initScrollReveal();
    });

    /* =====================================================
       COVER / OPEN INVITATION
    ===================================================== */
    function initOpening() {
        const opening = $('openingPage');
        const invitation = $('invitation');
        const button = $('openInvitation');
        if (!opening || !invitation || !button) return;

        // Jangan biarkan browser mengembalikan posisi scroll lama.
        if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        document.body.classList.add('cover-active');

        button.addEventListener('click', function () {
            // Selalu mulai isi undangan dari halaman paling atas.
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            opening.classList.add('closing');
            opening.classList.add('hide');
            invitation.classList.add('show');
            invitation.classList.add('visible');
            document.body.classList.remove('cover-active');

            setTimeout(function () {
                opening.style.display = 'none';
            }, 1250);

            const music = $('backgroundMusic');
            const musicButton = $('musicButton');
            if (music) {
                music.play().then(function () {
                    if (musicButton) musicButton.classList.add('playing');
                }).catch(function () {
                    // Autoplay may be blocked by the browser.
                });
            }
        });
    }

    /* =====================================================
       MUSIC
    ===================================================== */
    function initMusic() {
        const music = $('backgroundMusic');
        const button = $('musicButton');
        if (!music || !button) return;

        button.addEventListener('click', function () {
            if (music.paused) {
                music.play().then(function () {
                    button.classList.add('playing');
                    button.textContent = '♫';
                }).catch(function () {});
            } else {
                music.pause();
                button.classList.remove('playing');
                button.textContent = '♪';
            }
        });
    }

    /* =====================================================
       CALENDAR — NOVEMBER 2026 / EVENT DATE 8
    ===================================================== */
    function initCalendar() {
        const grid = $('calendarGrid');
        const month = $('calendarMonth');
        const year = $('calendarYear');
        const eventText = $('eventDateText');
        if (!grid) return;

        const eventDate = 8;
        const date = new Date(2026, 10, eventDate);
        const monthName = date.toLocaleDateString('id-ID', { month: 'long' });
        const weekday = date.toLocaleDateString('id-ID', { weekday: 'long' });

        if (month) month.textContent = monthName.toUpperCase();
        if (year) year.textContent = '2026';
        if (eventText) eventText.textContent = `${weekday}, ${eventDate} ${monthName} 2026`;

        grid.innerHTML = '';

        // November 2026 starts on Sunday. The design uses M-S-S-R-K-J-S.
        // Convert JS Sunday=0 into Monday-first index.
        const firstDay = new Date(2026, 10, 1).getDay();
        const mondayIndex = firstDay === 0 ? 6 : firstDay - 1;
        const daysInMonth = new Date(2026, 11, 0).getDate();

        for (let i = 0; i < mondayIndex; i++) {
            const empty = document.createElement('span');
            empty.className = 'empty';
            empty.textContent = '';
            grid.appendChild(empty);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const cell = document.createElement('span');
            cell.textContent = day;

            if (day === eventDate) {
                cell.className = 'event-date';
                const number = document.createElement('b');
                number.textContent = day;
                cell.textContent = '';
                cell.appendChild(number);

                for (let p = 1; p <= 5; p++) {
                    const petal = document.createElement('i');
                    petal.className = `flower-petal petal-${p}`;
                    cell.appendChild(petal);
                }
            }

            grid.appendChild(cell);
        }
    }

    /* =====================================================
       GALLERY
    ===================================================== */
    function initGallery() {
        const track = $('galleryTrack');
        if (!track) return;

        const slides = qsa('.gallery-slide', track);
        const dots = qsa('.gallery-dot');
        const prev = $('galleryPrev');
        const next = $('galleryNext');
        if (!slides.length) return;

        let current = 0;

        // Mode galeri dibuat berbasis opacity. Ini lebih stabil di mobile dan
        // mencegah slide kedua+ menjadi kosong akibat transform/absolute layout.
        slides.forEach(slide => {
            const img = slide.querySelector('img');
            if (img) {
                img.loading = 'eager';
                img.decoding = 'async';
            }
        });

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, i) => {
                const active = i === current;
                slide.classList.toggle('active', active);
                slide.setAttribute('aria-hidden', active ? 'false' : 'true');
            });
            dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
        }

        if (prev) prev.addEventListener('click', () => show(current - 1));
        if (next) next.addEventListener('click', () => show(current + 1));
        dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));

        let timer = setInterval(() => show(current + 1), 4500);
        [track, prev, next, ...dots].forEach(el => {
            if (!el) return;
            el.addEventListener('mouseenter', () => clearInterval(timer));
            el.addEventListener('mouseleave', () => {
                clearInterval(timer);
                timer = setInterval(() => show(current + 1), 4500);
            });
        });

        show(0);
    }

    /* =====================================================
       BOTTOM NAVIGATION
    ===================================================== */
    function initNavigation() {
        const items = qsa('.nav-item');
        if (!items.length) return;

        items.forEach(item => {
            item.addEventListener('click', function (e) {
                const targetId = item.dataset.target;
                const target = targetId ? $(targetId) : null;
                if (!target) return;

                e.preventDefault();
                items.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });

        const sections = items
            .map(item => $(item.dataset.target))
            .filter(Boolean);

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    const id = entry.target.id;
                    items.forEach(item => item.classList.toggle('active', item.dataset.target === id));
                });
            }, { threshold: 0.35 });

            sections.forEach(section => observer.observe(section));
        }
    }

    /* =====================================================
       SCROLL REVEAL — ANIMASI SAAT SECTION MASUK VIEW
    ===================================================== */
    function initScrollReveal() {
        const groups = [
            '.home-content > *',
            '.guest-home > *',
            '.acara-content > *',
            '.agenda-section > *',
            '.gallery-section > .gallery-title',
            '.gallery-section > .gallery-subtitle',
            '.gallery-section > .gallery-slider',
            '.gallery-section > .gallery-dots',
            '.gallery-section > .gallery-caption',
            '.dresscode-section > *',
            '.gift-section > *',
            '.doa-section > *',
            '.ketemu-section > *'
        ];

        const elements = qsa(groups.join(', '));
        elements.forEach((el, index) => {
            if (el.classList.contains('scroll-reveal')) return;
            el.classList.add('scroll-reveal');
            el.style.setProperty('--reveal-delay', `${Math.min((index % 7) * 70, 420)}ms`);
        });

        if (!('IntersectionObserver' in window)) {
            elements.forEach(el => el.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

        elements.forEach(el => observer.observe(el));
    }

    /* =====================================================
       COUNTDOWN — SAMPAI KETEMU
       Target: 8 November 2026, 08.00 WIB
    ===================================================== */
    function initCountdown() {
        const days = $('countDays');
        const hours = $('countHours');
        const minutes = $('countMinutes');
        const seconds = $('countSeconds');
        if (!days || !hours || !minutes || !seconds) return;

        const targetTime = new Date('2026-11-08T08:00:00+07:00').getTime();

        function pad(value) {
            return String(Math.max(0, value)).padStart(2, '0');
        }

        function update() {
            const diff = targetTime - Date.now();

            if (diff <= 0) {
                days.textContent = '00';
                hours.textContent = '00';
                minutes.textContent = '00';
                seconds.textContent = '00';
                return;
            }

            const totalSeconds = Math.floor(diff / 1000);
            const d = Math.floor(totalSeconds / 86400);
            const h = Math.floor((totalSeconds % 86400) / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            const s = totalSeconds % 60;

            days.textContent = String(d);
            hours.textContent = pad(h);
            minutes.textContent = pad(m);
            seconds.textContent = pad(s);
        }

        update();
        const timer = setInterval(update, 1000);
        window.addEventListener('beforeunload', () => clearInterval(timer), { once: true });
    }

    /* =====================================================
       DOA — POPUP TULIS UCAPAN
    ===================================================== */
    /* =====================================================
       DOA — POPUP + CLOUD GOOGLE SHEETS
    ===================================================== */

    // =====================================================
    // GANTI URL INI SETELAH GOOGLE APPS SCRIPT SUDAH DEPLOY
    // Contoh: https://script.google.com/macros/s/XXXXX/exec
    // =====================================================
    const DOA_CLOUD_URL = 'https://script.google.com/macros/s/AKfycbxBeNT0C6B03O3u7Yda19Ovubvlk0fjV77oER3t341VtrvodpuamJjNUk3CXvGf7DdU/exec';

    function initDoa() {
        const openButton = $('openDoaButton');
        const modal = $('doaModal');
        const overlay = $('doaModalOverlay');
        const closeButton = $('closeDoaModal');
        const form = $('doaForm');
        const nameInput = $('doaName');
        const attendance = $('doaAttendance');
        const guests = $('doaGuests');
        const message = $('doaMessage');
        const counter = $('doaCharCount');
        const list = $('doaMessageList');
        const empty = $('doaEmptyMessage');
        const success = $('doaSuccess');

        if (!openButton || !modal || !form) return;

        function openModal() {
            modal.classList.add('show');
            modal.setAttribute('aria-hidden', 'false');
            setTimeout(() => {
                if (!nameInput) return;
                try { nameInput.focus({ preventScroll: true }); }
                catch (_) { nameInput.focus(); }
            }, 180);
        }

        function closeModal() {
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
        }

        openButton.addEventListener('click', openModal);
        if (overlay) overlay.addEventListener('click', closeModal);
        if (closeButton) closeButton.addEventListener('click', closeModal);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.classList.contains('show')) closeModal();
        });

        if (message && counter) {
            const updateCounter = () => {
                counter.textContent = `${message.value.length}/300`;
            };
            message.addEventListener('input', updateCounter);
            updateCounter();
        }

        // Ambil semua ucapan dari cloud saat halaman dibuka.
        loadCloudWishes(list, empty);

        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const name = (nameInput?.value || '').trim();
            const status = attendance?.value || 'Hadir';
            const totalGuests = guests?.value || '1';
            const text = (message?.value || '').trim();

            if (!name || !text) {
                if (nameInput && !name) nameInput.focus();
                else if (message) message.focus();
                return;
            }

            const data = {
                name,
                status,
                guests: totalGuests,
                message: text
            };

            const submitButton = form.querySelector('.doa-submit-button');
            const originalButtonHTML = submitButton ? submitButton.innerHTML : '';

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = 'MENGIRIM... <span>♥</span>';
            }

            try {
                if (!DOA_CLOUD_URL) {
                    // Mode lokal: tetap tampil, tetapi belum tersimpan cloud.
                    addWish(data, list, empty);
                } else {
                    await saveWishToCloud(data);
                    addWish(data, list, empty);
                }

                if (success) {
                    success.textContent = DOA_CLOUD_URL
                        ? '✓ Ucapan berhasil disimpan ❤️'
                        : '✓ Ucapan tampil (cloud belum dihubungkan)';
                    success.classList.add('show');
                    setTimeout(() => success.classList.remove('show'), 2500);
                }

                form.reset();
                if (counter) counter.textContent = '0/300';
                setTimeout(closeModal, 600);
            } catch (error) {
                console.error('Gagal menyimpan ucapan:', error);
                if (success) {
                    success.textContent = '✕ Ucapan gagal disimpan. Coba lagi.';
                    success.classList.add('show');
                    setTimeout(() => success.classList.remove('show'), 3000);
                }
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonHTML;
                }
            }
        });
    }

    async function loadCloudWishes(list, empty) {
        if (!DOA_CLOUD_URL || !list) return;

        try {
            const response = await fetch(`${DOA_CLOUD_URL}?action=getWishes`, {
                method: 'GET',
                cache: 'no-store'
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const result = await response.json();
            if (!result.success || !Array.isArray(result.wishes)) return;

            // Hapus ucapan cloud yang sebelumnya ditampilkan, tetapi pertahankan
            // kartu contoh bawaan desain.
            list.querySelectorAll('.doa-wish-cloud').forEach(el => el.remove());

            if (empty) {
                empty.style.display = result.wishes.length ? 'none' : 'none';
            }

            // Backend sudah mengurutkan terbaru -> terlama.
            [...result.wishes].reverse().forEach(item => {
                addWish(item, list, empty, true);
            });
        } catch (error) {
            console.error('Gagal mengambil ucapan dari cloud:', error);
        }
    }

    async function saveWishToCloud(data) {
        const body = new URLSearchParams();
        body.set('action', 'addWish');
        body.set('nama', data.name);
        body.set('kehadiran', data.status);
        body.set('jumlah', data.guests);
        body.set('pesan', data.message);

        // application/x-www-form-urlencoded adalah request sederhana,
        // sehingga tidak memicu preflight CORS seperti JSON.
        const response = await fetch(DOA_CLOUD_URL, {
            method: 'POST',
            body,
            mode: 'cors'
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const result = await response.json();
        if (!result.success) throw new Error(result.error || 'Server menolak data');
        return result;
    }

    function addWish(data, list, empty, fromCloud = false) {
        if (!list) return;
        if (empty) empty.style.display = 'none';

        const card = document.createElement('article');
        card.className = `doa-wish-card ${fromCloud ? 'doa-wish-cloud' : 'doa-wish-new'}`;

        const avatar = document.createElement('div');
        avatar.className = 'doa-wish-avatar';
        avatar.textContent = (data.name || '?').charAt(0).toUpperCase();

        const content = document.createElement('div');
        content.className = 'doa-wish-content';

        const head = document.createElement('div');
        head.className = 'doa-wish-head';

        const name = document.createElement('strong');
        name.textContent = data.name || 'Tamu';

        const status = document.createElement('span');
        status.className = 'doa-wish-status';
        status.textContent = data.status || 'Hadir';

        head.appendChild(name);
        head.appendChild(status);

        const text = document.createElement('p');
        text.textContent = data.message || data.pesan || '';

        const meta = document.createElement('small');
        meta.textContent = `${data.guests || data.jumlah || '1'} tamu`;

        content.appendChild(head);
        content.appendChild(text);
        content.appendChild(meta);
        card.appendChild(avatar);
        card.appendChild(content);

        list.prepend(card);
        setTimeout(() => card.classList.remove('doa-wish-new'), 700);
    }

})();
