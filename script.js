/* =====================================================
   juliete & romeo — MAIN CONTROLLER
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
        initGalleryLightbox();
        initLetterReveal();
        initNavigation();
        initDoa();
        initCountdown();
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
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
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

            // Aktifkan observer setelah halaman undangan benar-benar terlihat.
            setTimeout(initScrollReveal, 80);

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
       TANGGAL ACARA — FIXED / TIMEZONE SAFE
       Jangan hitung kalender berdasarkan timezone perangkat.
       Acara sudah pasti: Minggu, 8 November 2026.
    ===================================================== */
    function initCalendar() {
        const eventText = $('eventDateText');
        if (eventText) eventText.textContent = 'Minggu, 8 November 2026';

        // Tanggal sengaja dibuat statis agar HP dan PC tidak pernah
        // menghasilkan hari/tanggal yang berbeda karena timezone/browser.
        const day = $('eventDateDay');
        const month = $('eventDateMonth');
        const weekday = $('eventDateWeekday');
        const year = $('eventDateYear');
        if (day) day.textContent = '08';
        if (month) month.textContent = 'NOVEMBER';
        if (weekday) weekday.textContent = 'MINGGU';
        if (year) year.textContent = '2026';
    }

    /* =====================================================
       GALLERY
    ===================================================== */
    function initGallery() {
        const track = $('galleryTrack');
        if (!track) return;

        let slides = qsa('.gallery-slide', track);
        let dots = qsa('.gallery-dot');
        const prev = $('galleryPrev');
        const next = $('galleryNext');
        if (!slides.length) return;

        let current = 0;
        let timer = null;

        // Pastikan foto yang valid siap sebelum slider dipakai. Jika sebuah
        // file kosong/rusak, slide tersebut disembunyikan agar HP tidak
        // menampilkan frame kosong.
        slides.forEach((slide, index) => {
            const img = slide.querySelector('img');
            if (!img) return;
            img.loading = 'eager';
            img.decoding = 'async';
            img.addEventListener('error', () => {
                slide.classList.add('image-error');
                slide.dataset.broken = 'true';
                rebuild();
            }, { once: true });
        });

        function rebuild() {
            slides = qsa('.gallery-slide:not(.image-error)', track);
            if (!slides.length) return;
            dots = qsa('.gallery-dot');
            dots.forEach((dot, i) => {
                dot.style.display = i < slides.length ? '' : 'none';
            });
            if (current >= slides.length) current = 0;
            show(current);
        }

        function show(index) {
            if (!slides.length) return;
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

        const startAuto = () => {
            clearInterval(timer);
            timer = setInterval(() => show(current + 1), 4500);
        };
        startAuto();

        [track, prev, next, ...dots].forEach(el => {
            if (!el) return;
            el.addEventListener('mouseenter', () => clearInterval(timer));
            el.addEventListener('mouseleave', startAuto);
            el.addEventListener('touchstart', () => clearInterval(timer), { passive: true });
            el.addEventListener('touchend', startAuto, { passive: true });
        });

        show(0);
        rebuild();
    }

    /* =====================================================
       GALLERY LIGHTBOX — klik foto untuk preview besar
    ===================================================== */
    function initGalleryLightbox() {
        const modal = $('galleryLightbox');
        const image = $('galleryLightboxImage');

        // Pindahkan lightbox langsung ke <body>.
        // Ini mencegah position:fixed terpengaruh oleh section/ancestor
        // yang memakai transform, sehingga preview selalu tepat di viewport HP.
        if (modal && modal.parentElement !== document.body) {
            document.body.appendChild(modal);
        }
        const counter = $('galleryLightboxCounter');
        if (!modal || !image) return;

        const items = () => qsa('.gallery-slide img, .gallery-more-item img')
            .filter(img => img && img.getAttribute('src'));
        let current = 0;

        function open(src) {
            const list = items();
            const index = list.findIndex(img => img.getAttribute('src') === src);
            current = index >= 0 ? index : 0;
            const target = list[current];
            if (!target) return;
            image.src = target.currentSrc || target.src;
            image.alt = target.alt || 'Preview foto';
            if (counter) counter.textContent = `${current + 1} / ${list.length}`;
            modal.classList.add('show');
            modal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('gallery-lock');
        }

        function close() {
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('gallery-lock');
            setTimeout(() => { if (!modal.classList.contains('show')) image.removeAttribute('src'); }, 250);
        }

        function move(step) {
            const list = items();
            if (!list.length) return;
            current = (current + step + list.length) % list.length;
            const target = list[current];
            image.src = target.currentSrc || target.src;
            image.alt = target.alt || 'Preview foto';
            if (counter) counter.textContent = `${current + 1} / ${list.length}`;
        }

        qsa('.gallery-slide img, .gallery-more-item').forEach(el => {
            el.addEventListener('click', () => {
                const src = el.tagName === 'IMG' ? el.getAttribute('src') : el.dataset.galleryPreview;
                if (src) open(src);
            });
        });

        const closeButton = $('galleryLightboxClose');
        const prev = $('galleryLightboxPrev');
        const next = $('galleryLightboxNext');
        if (closeButton) closeButton.addEventListener('click', close);
        if (prev) prev.addEventListener('click', () => move(-1));
        if (next) next.addEventListener('click', () => move(1));

        modal.addEventListener('click', e => {
            if (e.target === modal) close();
        });

        document.addEventListener('keydown', e => {
            if (!modal.classList.contains('show')) return;
            if (e.key === 'Escape') close();
            if (e.key === 'ArrowLeft') move(-1);
            if (e.key === 'ArrowRight') move(1);
        });

        let startX = 0;
        modal.addEventListener('touchstart', e => {
            startX = e.changedTouches[0].clientX;
        }, { passive: true });
        modal.addEventListener('touchend', e => {
            const dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 45) move(dx < 0 ? 1 : -1);
        }, { passive: true });
    }

    /* =====================================================
       LETTER-BY-LETTER TEXT REVEAL
       Teks muncul seperti sedang ditulis, per huruf.
    ===================================================== */
    function initLetterReveal() {
        /*
           GLOBAL LETTER REVEAL — V12
           Semua teks dari atas sampai bawah dianimasikan per huruf.
           Kita hanya membungkus TEXT NODE langsung, sehingga icon/HTML
           di dalam tombol, navbar, kartu, dll. tetap utuh.
        */
        const root = document.querySelector('.invitation') || document.body;
        const skipTags = new Set([
            'SCRIPT','STYLE','NOSCRIPT','SVG','PATH','IMG','INPUT','TEXTAREA',
            'SELECT','OPTION','VIDEO','AUDIO','CANVAS','PRE','CODE'
        ]);
        const skipClass = /(typing-letter|icon|fa-|material-icons|lucide|emoji|sparkle|heart-icon|nav-icon|gallery-dot|gallery-arrow)/i;
        const processed = [];

        const hasMeaningfulText = el => {
            let text = '';
            el.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) text += node.nodeValue || '';
            });
            return text.replace(/\s+/g, ' ').trim();
        };

        const wrapTextNode = (node, parent) => {
            const raw = node.nodeValue || '';
            if (!raw.trim()) return false;

            const fragment = document.createDocumentFragment();
            let letterIndex = 0;

            [...raw].forEach(char => {
                if (/\s/.test(char)) {
                    fragment.appendChild(document.createTextNode(char));
                    return;
                }
                const span = document.createElement('span');
                span.className = 'typing-letter';
                span.textContent = char;
                span.style.setProperty('--letter-index', letterIndex++);
                fragment.appendChild(span);
            });

            parent.replaceChild(fragment, node);
            return letterIndex > 0;
        };

        const walk = el => {
            if (!(el instanceof Element)) return;
            if (skipTags.has(el.tagName)) return;
            if (skipClass.test(el.className || '')) return;
            if (el.dataset.lettersReady === 'true') return;

            const directTextNodes = [...el.childNodes].filter(node =>
                node.nodeType === Node.TEXT_NODE && (node.nodeValue || '').trim()
            );

            let letterCount = 0;
            directTextNodes.forEach(node => {
                const before = node.nodeValue || '';
                if (wrapTextNode(node, el)) {
                    letterCount += [...before].filter(ch => !/\s/.test(ch)).length;
                }
            });

            if (letterCount > 0) {
                const speed = letterCount <= 18 ? 0.28 : letterCount <= 40 ? 0.19 : 0.115;
                el.style.setProperty('--letter-speed', `${speed}s`);
                el.style.setProperty('--letter-count', letterCount);
                el.dataset.lettersReady = 'true';
                el.classList.add('letter-reveal');
                processed.push(el);
            }

            // Lanjutkan ke elemen anak agar teks di dalam kartu/komponen
            // yang memiliki icon atau dekorasi juga tetap dianimasikan.
            [...el.children].forEach(walk);
        };

        walk(root);

        const trigger = el => {
            if (!el.classList.contains('is-typing')) el.classList.add('is-typing');
        };

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        trigger(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: .08, rootMargin: '0px 0px -6% 0px' });
            processed.forEach(el => observer.observe(el));
        } else {
            processed.forEach(trigger);
        }

        // Jalankan elemen yang sudah terlihat ketika undangan dibuka.
        setTimeout(() => {
            const vh = window.innerHeight || document.documentElement.clientHeight;
            processed.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < vh * .98 && rect.bottom > 0) trigger(el);
            });
        }, 220);
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
            '.couple-stack-section > .couple-section-title',
            '.couple-stack-section > .couple-person-block',
            '.couple-stack-section .person-parent',
            '.couple-stack-section .person-address',
            '.couple-stack-section .instagram-button',
            '.gallery-section > .gallery-title',
            '.gallery-section > .gallery-subtitle',
            '.gallery-section > .gallery-slider',
            '.gallery-section > .gallery-dots',
            '.gallery-section > .gallery-caption',
            '.dresscode-section > *',
            '.gift-section > *',
            '.doa-content > *',
            '.ketemu-content > *'
        ];

        const elements = qsa(groups.join(', '));
        if (!elements.length) return;

        elements.forEach((el, index) => {
            el.classList.add('scroll-reveal');
            el.style.setProperty('--reveal-delay', `${Math.min((index % 6) * 80, 400)}ms`);
        });

        const revealVisible = () => {
            const vh = window.innerHeight || document.documentElement.clientHeight;
            elements.forEach(el => {
                if (el.classList.contains('is-visible')) return;
                const rect = el.getBoundingClientRect();
                if (rect.top < vh * .92 && rect.bottom > vh * .05) {
                    el.classList.add('is-visible');
                }
            });
        };

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.05, rootMargin: '0px 0px -8% 0px' });
            elements.forEach(el => observer.observe(el));
        }

        // Fallback khusus mobile: beberapa WebView/Chrome lama tidak
        // selalu memicu observer ketika halaman baru saja dibuka.
        let ticking = false;
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                revealVisible();
                ticking = false;
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });

        // Reveal elemen yang memang sudah terlihat saat pertama dibuka.
        requestAnimationFrame(() => {
            revealVisible();
            setTimeout(revealVisible, 350);
        });
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
