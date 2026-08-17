const pochitaApp = {
  init() {
    this.cacheDOM();
    this.bindEvents();
    this.initHeroTimer();
    this.initTrendingTimer();
    this.initSwiper();
    this.initProductGallery();
    this.initProductTimer();
    this.initQuantitySelector();
    this.initProductTabs();
  },

  cacheDOM() {
    this.doc = document;
    this.hamburger = this.doc.querySelector(".hamburger");
    this.closeMenuBtn = this.doc.querySelector(".close-menu-btn");
    this.mainNav = this.doc.querySelector(".main-nav");
    this.overlay = this.doc.querySelector(".nav-overlay");
    this.megaToggles = this.doc.querySelectorAll(".has-mega-menu > a");
    this.searchInput = this.doc.querySelector(".search-input");
    this.searchBtn = this.doc.querySelector(".search-btn");
  },

  bindEvents() {
    if (this.hamburger)
      this.hamburger.addEventListener("click", () => this.openMobileMenu());
    if (this.closeMenuBtn)
      this.closeMenuBtn.addEventListener("click", () => this.closeMobileMenu());
    if (this.overlay)
      this.overlay.addEventListener("click", () => this.closeMobileMenu());

    if (this.megaToggles.length > 0) {
      this.megaToggles.forEach((toggle) => {
        toggle.addEventListener("click", (e) => this.handleAccordion(e));
      });
    }

    if (this.searchBtn)
      this.searchBtn.addEventListener("click", (e) => this.processSearch(e));
    if (this.searchInput)
      this.searchInput.addEventListener("keypress", (e) =>
        this.processSearch(e)
      );
  },

  openMobileMenu() {
    if (this.mainNav) this.mainNav.classList.add("active");
    if (this.overlay) this.overlay.classList.add("active");
  },

  closeMobileMenu() {
    if (this.mainNav) this.mainNav.classList.remove("active");
    if (this.overlay) this.overlay.classList.remove("active");

    setTimeout(() => {
      this.megaToggles.forEach((toggle) =>
        toggle.parentElement.classList.remove("open")
      );
    }, 300);
  },

  handleAccordion(event) {
    if (window.innerWidth <= 768) {
      event.preventDefault();
      const parentLi = event.currentTarget.parentElement;
      this.megaToggles.forEach((toggle) => {
        if (toggle.parentElement !== parentLi)
          toggle.parentElement.classList.remove("open");
      });
      parentLi.classList.toggle("open");
    }
  },

  processSearch(event) {
    if (event.type === "click" || event.key === "Enter") {
      const query = this.searchInput.value.trim();
      if (query)
        window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  },

  formatTimePersian(time) {
    let paddedTime = time < 10 ? `0${time}` : time.toString();
    return paddedTime.replace(/[0-9]/g, (w) =>
      String.fromCharCode(w.charCodeAt(0) + 1728)
    );
  },

  initHeroTimer() {
    const hHours = this.doc.getElementById("h-hours");
    const hMins = this.doc.getElementById("h-mins");
    const hSecs = this.doc.getElementById("h-secs");

    if (!hHours || !hMins || !hSecs) return;

    let timeInSeconds = 12 * 3600 + 45 * 60 + 30;

    const updateTimer = () => {
      if (timeInSeconds <= 0) return clearInterval(timerInterval);
      timeInSeconds--;
      hHours.textContent = this.formatTimePersian(
        Math.floor(timeInSeconds / 3600)
      );
      hMins.textContent = this.formatTimePersian(
        Math.floor((timeInSeconds % 3600) / 60)
      );
      hSecs.textContent = this.formatTimePersian(timeInSeconds % 60);
    };

    const timerInterval = setInterval(updateTimer, 1000);
  },

  initTrendingTimer() {
    const tHours = this.doc.getElementById("t-hours");
    const tMins = this.doc.getElementById("t-mins");
    const tSecs = this.doc.getElementById("t-secs");

    if (!tHours || !tMins || !tSecs) return;

    let timeInSeconds = 24 * 3600;

    const updateTimer = () => {
      if (timeInSeconds <= 0) return clearInterval(timerInterval);
      timeInSeconds--;
      tHours.textContent = this.formatTimePersian(
        Math.floor(timeInSeconds / 3600)
      );
      tMins.textContent = this.formatTimePersian(
        Math.floor((timeInSeconds % 3600) / 60)
      );
      tSecs.textContent = this.formatTimePersian(timeInSeconds % 60);
    };

    const timerInterval = setInterval(updateTimer, 1000);
  },

  initSwiper() {
    if (
      typeof Swiper !== "undefined" &&
      this.doc.querySelector(".trending-swiper")
    ) {
      new Swiper(".trending-swiper", {
        slidesPerView: 1.2,
        spaceBetween: 16,
        grabCursor: true,
        navigation: {
          nextEl: ".trending-next",
          prevEl: ".trending-prev",
        },
        breakpoints: {
          480: { slidesPerView: 2, spaceBetween: 20 },
          768: { slidesPerView: 3, spaceBetween: 24 },
          1024: { slidesPerView: 4, spaceBetween: 28 },
          1400: { slidesPerView: 5, spaceBetween: 32 },
        },
      });
    }
  },

  initProductGallery() {
    const mainImage = this.doc.getElementById("primary-image");
    const thumbnails = this.doc.querySelectorAll(".thumbnail-box");

    if (!mainImage || thumbnails.length === 0) return;

    thumbnails.forEach((thumb) => {
      thumb.addEventListener("click", (e) => {
        const currentThumb = e.currentTarget;
        const newImageSrc = currentThumb.getAttribute("data-image");

        if (newImageSrc) {
          mainImage.src = newImageSrc;
          thumbnails.forEach((t) => t.classList.remove("active"));
          currentThumb.classList.add("active");
        }
      });
    });
  },

  initProductTimer() {
    const pHours = this.doc.getElementById("p-hours");
    const pMins = this.doc.getElementById("p-mins");
    const pSecs = this.doc.getElementById("p-secs");

    if (!pHours || !pMins || !pSecs) return;

    let timeInSeconds = 12 * 3600 + 45 * 60 + 30;

    const updateTimer = () => {
      if (timeInSeconds <= 0) return clearInterval(timerInterval);
      timeInSeconds--;
      pHours.textContent = this.formatTimePersian(
        Math.floor(timeInSeconds / 3600)
      );
      pMins.textContent = this.formatTimePersian(
        Math.floor((timeInSeconds % 3600) / 60)
      );
      pSecs.textContent = this.formatTimePersian(timeInSeconds % 60);
    };

    const timerInterval = setInterval(updateTimer, 1000);
  },

  initQuantitySelector() {
    const minusBtn = this.doc.querySelector(".minus-btn");
    const plusBtn = this.doc.querySelector(".plus-btn");
    const qtyInput = this.doc.querySelector(".qty-input");

    if (!minusBtn || !plusBtn || !qtyInput) return;

    minusBtn.addEventListener("click", () => {
      let currentValue = parseInt(qtyInput.value);
      if (currentValue > 1) {
        qtyInput.value = currentValue - 1;
      }
    });

    plusBtn.addEventListener("click", () => {
      let currentValue = parseInt(qtyInput.value);
      let max = parseInt(qtyInput.getAttribute("max")) || 10;
      if (currentValue < max) {
        qtyInput.value = currentValue + 1;
      }
    });
  },

  initProductTabs() {
    const tabBtns = this.doc.querySelectorAll(".tab-btn");
    const tabContents = this.doc.querySelectorAll(".tab-content");

    if (tabBtns.length === 0 || tabContents.length === 0) return;

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const targetId = e.currentTarget.getAttribute("data-tab");

        tabBtns.forEach((t) => t.classList.remove("active"));
        tabContents.forEach((c) => c.classList.remove("active"));

        e.currentTarget.classList.add("active");
        this.doc.getElementById(targetId).classList.add("active");
      });
    });
  },
  initSwiper() {
    if (typeof Swiper === "undefined") return;

    if (this.doc.querySelector(".trending-swiper")) {
      new Swiper(".trending-swiper", {
        slidesPerView: 1.2,
        spaceBetween: 16,
        grabCursor: true,
        navigation: {
          nextEl: ".trending-next",
          prevEl: ".trending-prev",
        },
        breakpoints: {
          480: { slidesPerView: 2, spaceBetween: 20 },
          768: { slidesPerView: 3, spaceBetween: 24 },
          1024: { slidesPerView: 4, spaceBetween: 28 },
          1400: { slidesPerView: 5, spaceBetween: 32 },
        },
      });
    }

    if (this.doc.querySelector(".related-swiper")) {
      new Swiper(".related-swiper", {
        slidesPerView: 1.2,
        spaceBetween: 16,
        grabCursor: true,
        navigation: {
          nextEl: ".related-next",
          prevEl: ".related-prev",
        },
        breakpoints: {
          480: { slidesPerView: 2, spaceBetween: 20 },
          768: { slidesPerView: 3, spaceBetween: 24 },
          1024: { slidesPerView: 4, spaceBetween: 28 },
          1400: { slidesPerView: 4, spaceBetween: 32 },
        },
      });
    }
  },
};

document.addEventListener("DOMContentLoaded", () => pochitaApp.init());
