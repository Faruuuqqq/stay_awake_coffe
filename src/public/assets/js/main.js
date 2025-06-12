(function() {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (selectHeader && !selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    if (selectBody) {
      window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
    }
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      const swiperConfigElement = swiperElement.querySelector(".swiper-config");
      if (swiperConfigElement) {
        let config = {};
        try {
          config = JSON.parse(
            swiperConfigElement.innerHTML.trim()
          );
        } catch (e) {
          console.error("Error parsing Swiper config:", e);
          return;
        }

        if (swiperElement.classList.contains("swiper-tab")) {
          if (typeof initSwiperWithCustomPagination !== 'undefined') {
              initSwiperWithCustomPagination(swiperElement, config);
          } else {
              console.warn("initSwiperWithCustomPagination is not defined.");
          }
        } else {
          new Swiper(swiperElement, config);
        }
      } else {
          console.warn("Swiper config element not found for:", swiperElement);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 600,
        easing: 'ease-in-out',
        once: true,
        mirror: false
      });
    }
  }
  window.addEventListener('load', aosInit);

  /**
   * Initiate glightbox
   */
  const glightbox = typeof GLightbox !== 'undefined' ? GLightbox({
    selector: '.glightbox'
  }) : null;


  /**
   * Initiate Pure Counter
   */
  if (typeof PureCounter !== 'undefined') {
    new PureCounter();
  }

  // Back to top button
  const scrollTop = document.querySelector('#scroll-top');
  if (scrollTop) {
    scrollTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Preloader
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  // Mobile nav toggle
  const mobileNavShow = document.querySelector('.mobile-nav-toggle');
  const mobileNavHide = document.querySelector('.mobile-nav-hide');

  if (mobileNavShow) {
    mobileNavShow.addEventListener('click', function(e) {
      const body = document.querySelector('body');
      if (body) body.classList.add('mobile-nav-active');
      this.classList.toggle('bi-list');
      this.classList.toggle('bi-x');
    });
  }

  if (mobileNavHide) {
    mobileNavHide.addEventListener('click', function(e) {
      const body = document.querySelector('body');
      if (body) body.classList.remove('mobile-nav-active');
      if (mobileNavShow) {
        mobileNavShow.classList.add('bi-list');
        mobileNavShow.classList.remove('bi-x');
      }
    });
  }

  // Toggle mobile nav on click of any mobile nav item
  document.querySelectorAll('.mobile-nav .nav-link').forEach(navlink => {
    const dropdownIndicator = navlink.querySelector('.toggle-dropdown');
    if (dropdownIndicator) {
      navlink.addEventListener('click', function(e) {
        e.preventDefault();
        this.nextElementSibling.classList.toggle('dropdown-active');
        dropdownIndicator.classList.toggle('bi-chevron-up');
        dropdownIndicator.classList.toggle('bi-chevron-down');
      });
    } else {
      // For non-dropdown links, close nav
      navlink.addEventListener('click', () => {
        const body = document.querySelector('body');
        if (body) body.classList.remove('mobile-nav-active');
        if (mobileNavShow) {
          mobileNavShow.classList.add('bi-list');
          mobileNavShow.classList.remove('bi-x');
        }
      });
    }
  });


  // Close mobile nav on click outside of nav
  document.addEventListener('click', function(e) {
    const body = document.querySelector('body');
    if (body && body.classList.contains('mobile-nav-active')) {
      if (!e.target.closest('.mobile-nav') && !e.target.closest('.mobile-nav-toggle')) {
        body.classList.remove('mobile-nav-active');
        if (mobileNavShow) {
          mobileNavShow.classList.add('bi-list');
          mobileNavShow.classList.remove('bi-x');
        }
      }
    }
  });

  // Logika yang Dikembalikan: priceRangeSlider, productCategoriesWidget, viewOptions
  const priceRangeSlider = document.getElementById('priceRangeSlider');
  if (priceRangeSlider) {
    console.log("Price range slider element found. Add custom logic here.");
  }

  document.querySelectorAll('.product-categories-widget .category-header').forEach(header => {
    header.addEventListener('click', function() {
      this.classList.toggle('collapsed');
      const targetId = this.dataset.bsTarget;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.classList.toggle('collapse');
        targetElement.classList.toggle('show');
      }
    });
  });

  document.querySelectorAll('.view-options .view-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.view-options .view-btn').forEach(otherBtn => otherBtn.classList.remove('active'));
      this.classList.add('active');
      console.log("View option clicked:", this.dataset.view);
    });
  });

  // Function to initialize Bootstrap tooltips
  function initTooltips() {
    if (typeof bootstrap !== 'undefined' && typeof bootstrap.Tooltip !== 'undefined') {
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle=\"tooltip\"]');
      if (tooltipTriggerList) {
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
      }
    } else {
      const cvvHint = document.querySelector('.cvv-hint');
      if (cvvHint) {
        cvvHint.addEventListener('mouseenter', function() {
          this.setAttribute('data-original-title', this.getAttribute('title'));
          this.setAttribute('title', '');
        });

        cvvHint.addEventListener('mouseleave', function() {
          this.setAttribute('title', this.getAttribute('data-original-title'));
        });
      }
    }
  }

  window.addEventListener('load', initTooltips);

  // --- GLOBAL TOAST NOTIFICATION FUNCTION (CUSTOM DESIGN) ---
  // Variabel-variabel ini akan diinisialisasi saat DOMContentLoaded
  let globalToastElement; // Menggunakan 'globalToastElement' sesuai id di header.ejs
  let globalToastTitle;
  let globalToastBody;
  let globalToastIcon;
  let globalToastCloseBtn;
  let globalToastHideTimeout;

  document.addEventListener('DOMContentLoaded', () => {
    globalToastElement = document.getElementById('globalToast'); // Mengambil elemen berdasarkan id="globalToast"
    if (globalToastElement) {
      globalToastTitle = document.getElementById('globalToastTitle');
      globalToastBody = document.getElementById('globalToastBody');
      globalToastIcon = document.getElementById('globalToastIcon');
      globalToastCloseBtn = globalToastElement.querySelector('.close-btn-custom');

      if (globalToastCloseBtn) {
        globalToastCloseBtn.addEventListener('click', () => {
          globalToastElement.classList.remove('show-custom');
          globalToastElement.classList.add('hide-custom');
          clearTimeout(globalToastHideTimeout);
        });
      }
    } else {
      console.error("Error: Global Toast element with ID 'globalToast' not found in the DOM.");
    }
  });

  /**
   * Menampilkan notifikasi Toast secara global dengan desain kustom.
   * Pastikan HTML toast container ada di partials/header.ejs
   * @param {string} message Pesan yang akan ditampilkan.
   * @param {string} type Tipe notifikasi: 'success', 'error', 'info', 'warning'.
   * @param {number} [delay=3000] Opsi: delay sebelum sembunyi (ms), default 3000.
   * @param {function} [callback=null] Opsi: fungsi yang dipanggil setelah toast disembunyikan.
   * @param {number} [maxLength=150] Opsi: Batas panjang pesan.
   */
  window.showToast = function(message, type = 'info', delay = 3000, callback = null, maxLength = 150) {
    if (!globalToastElement) {
      console.error("Global Toast element not initialized. Falling back to alert.");
      alert(type.toUpperCase() + ": " + message);
      if (callback) callback();
      return;
    }

    let displayMessage = message;
    if (message.length > maxLength) {
        displayMessage = message.substring(0, maxLength - 3) + '...';
    }

    globalToastElement.classList.remove('success-custom', 'error-custom', 'info-custom', 'warning-custom');
    globalToastElement.classList.add(`${type}-custom`);

    globalToastBody.textContent = displayMessage;
    globalToastTitle.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    
    if (globalToastIcon) {
        globalToastIcon.className = 'fas me-2'; // Reset FontAwesome icon
        if (type === 'success') {
            globalToastIcon.classList.add('fa-check-circle');
        } else if (type === 'error') {
            globalToastIcon.classList.add('fa-times-circle');
        } else if (type === 'warning') {
            globalToastIcon.classList.add('fa-exclamation-triangle');
        } else { // default to info
            globalToastIcon.classList.add('fa-info-circle');
        }
    }
    
    globalToastElement.classList.remove('hide-custom');
    globalToastElement.classList.add('show-custom');

    clearTimeout(globalToastHideTimeout);
    globalToastHideTimeout = setTimeout(() => {
      globalToastElement.classList.remove('show-custom');
      globalToastElement.classList.add('hide-custom');
      if (callback) {
          globalToastElement.addEventListener('transitionend', function onTransitionEnd() {
              callback();
              globalToastElement.removeEventListener('transitionend', onTransitionEnd);
          }, { once: true });
      }
    }, delay);
  };

})();