/* =====================================================
   DATA UNDANGAN
===================================================== */

/*
    CUKUP UBAH BARIS INI.

    Format:
    TAHUN-BULAN-TANGGAL

    Contoh:

    8 November 2026
    "2026-11-08"

    21 Juli 2030
    "2030-07-21"

    14 Februari 2031
    "2031-02-14"
*/

const weddingDate = "2026-11-08";



/* =====================================================
   DATA ACARA
===================================================== */

const weddingData = {

    akad: {
        time: "08.00 WIB",
        place: "Ballroom Melati",
        address: "Hotel Ambhara, Jakarta Selatan"
    },

    reception: {
        time: "11.00 WIB",
        place: "Ballroom Melati",
        address: "Hotel Ambhara, Jakarta Selatan"
    }

};



/* =====================================================
   FORMAT TANGGAL
===================================================== */

function getWeddingDate() {

    /*
        Tambahkan waktu lokal supaya tidak
        bergeser satu hari karena timezone.
    */

    const parts = weddingDate.split("-");

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    return new Date(
        year,
        month - 1,
        day
    );
}



/* =====================================================
   NAMA BULAN
===================================================== */

const monthNames = [

    "JANUARI",
    "FEBRUARI",
    "MARET",
    "APRIL",
    "MEI",
    "JUNI",
    "JULI",
    "AGUSTUS",
    "SEPTEMBER",
    "OKTOBER",
    "NOVEMBER",
    "DESEMBER"

];



/* =====================================================
   NAMA HARI
===================================================== */

const dayNames = [

    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu"

];



/* =====================================================
   SET TANGGAL OTOMATIS
===================================================== */

function setupWeddingDate() {

    const date = getWeddingDate();

    const year = date.getFullYear();

    const month = date.getMonth();

    const day = date.getDate();

    const dayName = dayNames[
        date.getDay()
    ];


    /*
        HOME
    */

    const homeDate =
        document.getElementById(
            "homeWeddingDate"
        );


    if (homeDate) {

        homeDate.textContent =
            `${dayName}, ${day} ${monthNames[month].charAt(0) + monthNames[month].slice(1).toLowerCase()} ${year}`;

    }


    /*
        ACARA - BULAN
    */

    const calendarMonth =
        document.getElementById(
            "calendarMonth"
        );


    if (calendarMonth) {

        calendarMonth.textContent =
            monthNames[month];

    }


    /*
        ACARA - TAHUN
    */

    const calendarYear =
        document.getElementById(
            "calendarYear"
        );


    if (calendarYear) {

        calendarYear.textContent =
            year;

    }


    /*
        TANGGAL ACARA
    */

    const eventDateText =
        document.getElementById(
            "eventDateText"
        );


    if (eventDateText) {

        eventDateText.innerHTML =
            `${dayName}, ${day} ${monthNames[month].charAt(0) + monthNames[month].slice(1).toLowerCase()} ${year} — akad ${weddingData.akad.time},<br>resepsi ${weddingData.reception.time}`;

    }

}



/* =====================================================
   BUAT KALENDER OTOMATIS
===================================================== */

function createCalendar() {

    const calendarGrid =
        document.getElementById(
            "calendarGrid"
        );


    if (!calendarGrid) {
        return;
    }


    /*
        Bersihkan kalender lama
    */

    calendarGrid.innerHTML = "";


    const date =
        getWeddingDate();


    const year =
        date.getFullYear();


    const month =
        date.getMonth();


    const eventDay =
        date.getDate();


    /*
        Hari pertama bulan.

        JavaScript:
        Minggu = 0
        Senin = 1
        ...
        Sabtu = 6
    */

    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    /*
        Jumlah hari bulan.
    */

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    /*
        Karena kalender kita memakai:

        M S S R K J S

        maka urutannya:
        Minggu, Senin, Selasa,
        Rabu, Kamis, Jumat, Sabtu

        Kita tetap menggunakan
        index JavaScript.
    */


    /*
        Kotak kosong sebelum tanggal 1.
    */

    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const empty =
            document.createElement(
                "span"
            );

        empty.className =
            "empty";

        calendarGrid.appendChild(
            empty
        );

    }


    /*
        Buat tanggal 1 sampai akhir bulan.
    */

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {


        const dateElement =
            document.createElement(
                "span"
            );


        /*
            Kalau tanggal ini adalah
            tanggal pernikahan.
        */

        if (day === eventDay) {

            dateElement.className =
                "event-date";


            /*
                Bunga / kelopak.
            */

            const petal1 =
                document.createElement("i");

            petal1.className =
                "flower-petal petal-1";


            const petal2 =
                document.createElement("i");

            petal2.className =
                "flower-petal petal-2";


            const petal3 =
                document.createElement("i");

            petal3.className =
                "flower-petal petal-3";


            const petal4 =
                document.createElement("i");

            petal4.className =
                "flower-petal petal-4";


            const petal5 =
                document.createElement("i");

            petal5.className =
                "flower-petal petal-5";


            /*
                Angka tanggal.
            */

            const number =
                document.createElement(
                    "b"
                );

            number.textContent =
                day;


            dateElement.appendChild(
                petal1
            );

            dateElement.appendChild(
                petal2
            );

            dateElement.appendChild(
                petal3
            );

            dateElement.appendChild(
                petal4
            );

            dateElement.appendChild(
                petal5
            );

            dateElement.appendChild(
                number
            );

        } else {

            dateElement.textContent =
                day;

        }


        calendarGrid.appendChild(
            dateElement
        );

    }

}


/* =====================================================
   OPEN INVITATION
===================================================== */

function setupOpening() {

    const openButton =
        document.getElementById("openInvitation");

    const openingPage =
        document.getElementById("openingPage");

    const invitation =
        document.getElementById("invitation");

    const music =
        document.getElementById("backgroundMusic");


    console.log("OPEN BUTTON:", openButton);
    console.log("OPENING PAGE:", openingPage);
    console.log("INVITATION:", invitation);


    if (!openButton) {

        console.error(
            "Tombol #openInvitation tidak ditemukan!"
        );

        return;
    }


    openButton.addEventListener("click", function (event) {

        event.preventDefault();
        event.stopPropagation();

        console.log("❤️ TOMBOL BUKA DIKLIK");


        /* ==========================
           MUSIK
        ========================== */

        if (music) {

            music.volume = 0.65;

            music.play()
                .then(function () {

                    console.log("🎵 Musik mulai");

                    if (typeof updateMusicButton === "function") {
                        updateMusicButton();
                    }

                })
                .catch(function (error) {

                    console.log(
                        "Musik tidak dapat autoplay:",
                        error
                    );

                });

        }


        /* ==========================
           TAMPILKAN UNDANGAN
        ========================== */

        if (invitation) {

            invitation.classList.add("show");

        }


        /* ==========================
           TUTUP HALAMAN PEMBUKA
        ========================== */

        if (openingPage) {

            openingPage.classList.add("hide");

        }


        /* ==========================
           AKTIFKAN SCROLL
        ========================== */

        document.body.style.overflowY = "auto";


        /* ==========================
           MASUK KE HOME
        ========================== */

        setTimeout(function () {

            const home =
                document.getElementById("home");

            if (home) {

                home.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }, 300);

    });

}



/* =====================================================
   MUSIC BUTTON
===================================================== */

function setupMusic() {

    const button =
        document.getElementById(
            "musicButton"
        );


    const music =
        document.getElementById(
            "backgroundMusic"
        );


    if (!button || !music) {
        return;
    }


    button.addEventListener(
        "click",
        function () {


            if (
                music.paused
            ) {

                music.play()
                    .then(() => {

                        updateMusicButton();

                    })
                    .catch(() => {});


            } else {

                music.pause();

                updateMusicButton();

            }

        }
    );


    updateMusicButton();

}



/* =====================================================
   UPDATE ICON MUSIK
===================================================== */

function updateMusicButton() {

    const button =
        document.getElementById(
            "musicButton"
        );


    const music =
        document.getElementById(
            "backgroundMusic"
        );


    if (!button || !music) {
        return;
    }


    if (music.paused) {

        button.innerHTML =
            "♪";

        button.classList.remove(
            "music-playing"
        );

    } else {

        button.innerHTML =
            "♫";

        button.classList.add(
            "music-playing"
        );

    }

}



/* =====================================================
   NAVBAR
===================================================== */

function setupNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(
        function (item) {


            item.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();


                    const targetId =
                        item.dataset.target;


                    const target =
                        document.getElementById(
                            targetId
                        );


                    if (!target) {
                        return;
                    }


                    /*
                        Scroll menuju section.
                    */

                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });


                    /*
                        Active navbar.
                    */

                    navItems.forEach(
                        function (nav) {

                            nav.classList.remove(
                                "active"
                            );

                        }
                    );


                    item.classList.add(
                        "active"
                    );

                }
            );

        }
    );

}



/* =====================================================
   NAVBAR OTOMATIS SESUAI SCROLL
===================================================== */

function setupScrollNavigation() {

    const sections =
        document.querySelectorAll(
            ".section"
        );


    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    if (
        !sections.length ||
        !navItems.length
    ) {

        return;

    }


    const observer =
        new IntersectionObserver(
            function (entries) {


                entries.forEach(
                    function (entry) {


                        if (
                            entry.isIntersecting
                        ) {


                            const id =
                                entry.target.id;


                            navItems.forEach(
                                function (item) {

                                    item.classList.remove(
                                        "active"
                                    );


                                    if (
                                        item.dataset.target === id
                                    ) {

                                        item.classList.add(
                                            "active"
                                        );

                                    }

                                }
                            );

                        }

                    }
                );

            },
            {
                threshold: 0.45
            }
        );


    sections.forEach(
        function (section) {

            observer.observe(
                section
            );

        }
    );

}



/* =====================================================
   UPDATE DATA EVENT
===================================================== */

function setupEventData() {

    const akadPlace =
        document.querySelector(
            ".event-block:nth-of-type(1) .event-place"
        );


    /*
        Saat ini data acara sudah ditulis
        langsung di HTML.

        Bagian ini disiapkan agar nanti
        lokasi bisa dibuat sepenuhnya
        otomatis juga.
    */

}



/* =====================================================
   INIT
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        /*
            Tanggal otomatis.
        */

        setupWeddingDate();


        /*
            Buat kalender otomatis.
        */

        createCalendar();


        /*
            Tombol buka undangan.
        */

        setupOpening();


        /*
            Musik.
        */

        setupMusic();


        /*
            Navbar.
        */

        setupNavigation();


        /*
            Navbar mengikuti scroll.
        */

        setupScrollNavigation();


        /*
            Data acara.
        */

        setupEventData();

    }
);

/* =====================================================
   GALERI OTOMATIS
===================================================== */

function setupGallery() {

    const slides =
        document.querySelectorAll(".gallery-slide");

    const dots =
        document.querySelectorAll(".gallery-dot");

    const prev =
        document.getElementById("galleryPrev");

    const next =
        document.getElementById("galleryNext");

    if (!slides.length) return;

    let current = 0;

    let autoSlide;


    function showSlide(index) {

        if (index >= slides.length) {
            index = 0;
        }

        if (index < 0) {
            index = slides.length - 1;
        }

        current = index;


        slides.forEach((slide, i) => {

            slide.classList.toggle(
                "active",
                i === current
            );

        });


        dots.forEach((dot, i) => {

            dot.classList.toggle(
                "active",
                i === current
            );

        });

    }


    function nextSlide() {

        showSlide(current + 1);

    }


    function prevSlide() {

        showSlide(current - 1);

    }


    function startAutoSlide() {

        clearInterval(autoSlide);

        autoSlide = setInterval(
            nextSlide,
            3500
        );

    }


    if (next) {

        next.addEventListener(
            "click",
            function () {

                nextSlide();

                startAutoSlide();

            }
        );

    }


    if (prev) {

        prev.addEventListener(
            "click",
            function () {

                prevSlide();

                startAutoSlide();

            }
        );

    }


    dots.forEach((dot, index) => {

        dot.addEventListener(
            "click",
            function () {

                showSlide(index);

                startAutoSlide();

            }
        );

    });


    /* MULAI */

    showSlide(0);

    startAutoSlide();

}


document.addEventListener(
    "DOMContentLoaded",
    setupGallery
);

/* =====================================================
   KADO / REKENING
===================================================== */

function setupGift() {

    const openButton =
        document.getElementById("openGiftButton");

    const modal =
        document.getElementById("giftModal");

    const closeButton =
        document.getElementById("closeGiftModal");

    const overlay =
        document.getElementById("giftModalOverlay");

    const copyButton =
        document.getElementById("copyRekeningButton");

    const rekeningNumber =
        document.getElementById("rekeningNumber");

    const copySuccess =
        document.getElementById("copySuccess");


    if (!openButton || !modal) {
        return;
    }


    /* BUKA POPUP */

    openButton.addEventListener(
        "click",
        function () {

         modal.classList.add("show");

document.body.classList.add("gift-modal-open");

        }
    );


    /* TUTUP */

    function closeGift() {

        modal.classList.remove("show");

document.body.classList.remove("gift-modal-open");

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeGift
        );

    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeGift
        );

    }


    /* ESC */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                modal.classList.contains("show")
            ) {

                closeGift();

            }

        }
    );


    /* COPY */

    if (copyButton && rekeningNumber) {

        copyButton.addEventListener(
            "click",
            async function () {

                const number =
                    rekeningNumber.textContent
                        .replace(/\s/g, "")
                        .trim();


                try {

                    await navigator.clipboard.writeText(
                        number
                    );

                    showCopySuccess();

                } catch (error) {

                    /* fallback */

                    const textarea =
                        document.createElement("textarea");

                    textarea.value = number;

                    document.body.appendChild(
                        textarea
                    );

                    textarea.select();

                    document.execCommand("copy");

                    textarea.remove();

                    showCopySuccess();

                }

            }
        );

    }


    function showCopySuccess() {

        if (!copySuccess) return;

        copySuccess.classList.add("show");

        setTimeout(
            function () {

                copySuccess.classList.remove(
                    "show"
                );

            },
            2500
        );

    }

}


document.addEventListener(
    "DOMContentLoaded",
    setupGift
);