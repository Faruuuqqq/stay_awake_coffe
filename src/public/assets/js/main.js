(function() {
  "use strict";

  /**
   * Fungsi utility untuk menampilkan notifikasi SweetAlert2.
   * Ini akan tersedia secara global di window object.
   * @param {string} message Pesan yang akan ditampilkan.
   * @param {string} type Tipe notifikasi: 'success', 'error', 'info', 'warning', 'question'.
   * @param {string} [title='Pemberitahuan'] Opsi: Judul notifikasi.
   */
  /**
   * Fungsi utility untuk menampilkan notifikasi SweetAlert2.
   */
  window.showAlert = function(message, type = 'info', title = 'Pemberitahuan') {
    let iconType;
    let customTitle = title;

    switch (type) {
      case 'success':
        iconType = 'success';
        customTitle = 'Berhasil!';
        break;
      case 'error':
        iconType = 'error';
        customTitle = 'Kesalahan!';
        break;
      case 'warning':
        iconType = 'warning';
        customTitle = 'Peringatan!';
        break;
      case 'info':
        iconType = 'info';
        customTitle = 'Informasi';
        break;
      case 'question':
        iconType = 'question';
        customTitle = 'Pertanyaan';
        break;
      default:
        iconType = 'info';
        break;
    }

    if (typeof Swal === 'undefined') {
      console.error("SweetAlert2 is not loaded. Falling back to alert.");
      alert(`${customTitle}: ${message}`);
      return;
    }

    Swal.fire({
      icon: iconType,
      title: customTitle,
      text: message,
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'btn btn-primary' // Sesuaikan dengan kelas tombol Bootstrap Anda
      },
      buttonsStyling: false // Penting agar customClass berfungsi
    });
  };

  /**
   * Menerapkan kelas .scrolled ke body saat halaman digulir.
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (selectHeader && !selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    if (selectBody) {
        window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
    }
  }

  /**
   * Menginisialisasi slider Swiper.
   * Mencari elemen dengan kelas .init-swiper dan mengurai konfigurasi dari .swiper-config.
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
          console.error("Error parsing Swiper config for element:", swiperElement, e);
          return;
        }

        // Ini adalah inisialisasi Swiper dasar
        new Swiper(swiperElement, config);

      } else {
          console.warn("Swiper config element (class='swiper-config') not found inside an element with class 'init-swiper'. This Swiper instance might not be configured properly:", swiperElement);
      }
    });
  }

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    const body = document.querySelector('body');
    if (body) {
        body.classList.toggle('mobile-nav-active');
    }
    if (mobileNavToggleBtn) {
        mobileNavToggleBtn.classList.toggle('bi-list');
        mobileNavToggleBtn.classList.toggle('bi-x');
    }
  }

  /**
   * Hide mobile nav on same-page/hash links and close on click outside
   */
  if (mobileNavToggleBtn) { // Hanya tambahkan event listener jika tombol toggle ada
    mobileNavToggleBtn.addEventListener('click', mobileNavToogle);

    document.querySelectorAll('#navmenu a').forEach(navmenuLink => {
      // Menangani klik pada link navigasi mobile untuk menutup menu
      navmenuLink.addEventListener('click', () => {
        const body = document.querySelector('body');
        if (body && body.classList.contains('mobile-nav-active')) {
          mobileNavToogle(); // Gunakan fungsi toggle untuk menutup
        }
      });
    });

    // Tutup mobile nav saat mengklik di luar area nav
    document.addEventListener('click', function(e) {
      const body = document.querySelector('body');
      const navmenu = document.querySelector('.navmenu');

      if (body && body.classList.contains('mobile-nav-active')) {
        if (!e.target.closest('.mobile-nav-toggle') && !e.target.closest('.navmenu')) {
          mobileNavToogle(); // Gunakan fungsi toggle untuk menutup
        }
      }
    });
  }


  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(toggleBtn => {
    toggleBtn.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  if (scrollTop) {
    scrollTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }


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

  /**
   * Init isotope layout and filters
   */
  function initIsotopeLayouts() {
    document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
      if (typeof Isotope === 'undefined' || typeof imagesLoaded === 'undefined') {
          console.warn("Isotope or ImagesLoaded library not found. Skipping Isotope initialization for:", isotopeItem);
          return;
      }

      let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
      let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
      let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

      let initIsotopeInstance; // Ganti nama variabel agar tidak ambigu
      imagesLoaded(isotopeItem.querySelector('.isotope-container'), function() {
        initIsotopeInstance = new Isotope(isotopeItem.querySelector('.isotope-container'), {
          itemSelector: '.isotope-item',
          layoutMode: layout,
          filter: filter,
          sortBy: sort
        });

        // Event listener untuk filter Isotope
        isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
          filters.addEventListener('click', function() {
            isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
            this.classList.add('filter-active');
            initIsotopeInstance.arrange({ // Gunakan initIsotopeInstance
              filter: this.getAttribute('data-filter')
            });
            if (typeof aosInit === 'function') {
              aosInit(); // Re-initialize AOS on filter change
            }
          }, false);
        });
      });
    });
  }


  /**
   * Init GLightbox
   */
  function initGlightbox() {
    if (typeof GLightbox !== 'undefined') {
      GLightbox({
        selector: '.glightbox'
      });
    } else {
        console.warn("GLightbox library not found.");
    }
  }

  /**
   * Init Pure Counter
   */
  function initPureCounter() {
    if (typeof PureCounter !== 'undefined') {
      new PureCounter();
    } else {
        console.warn("PureCounter library not found.");
    }
  }

  /**
   * Initialize Bootstrap tooltips (exposed globally for potential use)
   */
  window.initTooltips = function() { // FIX: Dibuat global secara eksplisit
    if (typeof bootstrap !== 'undefined' && typeof bootstrap.Tooltip !== 'undefined') {
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      if (tooltipTriggerList) {
        [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
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
  };
  
  window.updateCartItemCount = function() {
    const cartCountElement = document.querySelector('.cart-item-count');
    if (!cartCountElement) return; // Keluar jika elemen tidak ditemukan

    $.ajax({
        url: '/api/carts', // Endpoint untuk mendapatkan data keranjang
        type: 'GET',
        success: function(response) {
            // Asumsi 'response.data.items' adalah array produk di keranjang
            if (response.status === 'success' && response.data && response.data.items) {
                cartCountElement.textContent = response.data.items.length;
            } else {
                cartCountElement.textContent = '0';
            }
        },
        error: function(xhr) {
            // Jika error karena tidak login (401), set jumlah keranjang ke 0
            if (xhr.status === 401) {
                cartCountElement.textContent = '0';
                console.log('User not logged in, cart count set to 0.');
            } else {
                // Untuk error lain, log ke konsol
                console.error('Error fetching cart data:', xhr.responseText);
                cartCountElement.textContent = '0';
            }
        }
    });
  }
  /**
   * Consolidated Global Function Initialization on Window Load
   */
  function initGlobalFunctions() {
    // Jalankan toggleScrolled di awal
    toggleScrolled(); 
    // Inisialisasi semua Swiper (termasuk announcement-slider)
    initSwiper(); 
    // Inisialisasi AOS
    aosInit();
    // Inisialisasi GLightbox
    initGlightbox();
    // Inisialisasi PureCounter
    initPureCounter();
    // Inisialisasi Isotope Layouts
    initIsotopeLayouts();
    // Inisialisasi Tooltips
    window.initTooltips(); 
    // Toggle scroll top button
    toggleScrollTop(); 
  }

  // Tambahkan event listener untuk menjalankan semua fungsi global saat halaman dimuat
  window.addEventListener('load', initGlobalFunctions);
  document.addEventListener('scroll', toggleScrolled); // scroll tetap terpisah

    /**
   * ===================================================================
   * BAGIAN INTI: FORM HANDLING UNTUK LOGIN & REGISTER
   * Kode ini ditambahkan untuk menangani form dengan JQuery.
   * ===================================================================
   */
  $(document).ready(function() {
    // Handler untuk form registrasi
    const registerForm = $('#register-form');
    if (registerForm.length) {
        registerForm.on('submit', function(e) {
            e.preventDefault();
            const formData = $(this).serialize();

            $.ajax({
                url: '/auth/register', // Sesuaikan dengan URL route Anda
                type: 'POST',
                data: formData,
                success: function(response) {
                    if (response.status === 'success') {
                        window.showAlert('Registrasi berhasil! Silakan login.', 'success');
                        setTimeout(() => {
                            window.location.href = '/auth/login'; // Redirect ke halaman login
                        }, 2000);
                    }
                },
                error: function(xhr) {
                    const error = xhr.responseJSON || { message: 'Terjadi kesalahan saat registrasi.' };
                    window.showAlert(error.message, 'error');
                }
            });
        });
    }

    // Handler untuk form login
    const loginForm = $('#login-form');
    if (loginForm.length) {
        loginForm.on('submit', function(e) {
            e.preventDefault();
            const formData = $(this).serialize();

            $.ajax({
                url: '/auth/login', // Sesuaikan dengan URL route Anda
                type: 'POST',
                data: formData,
                success: function(response) {
                    // Server akan mengatur cookie, frontend hanya perlu redirect.
                    if (response.status === 'success') {
                        window.showAlert(response.message, 'success');
                        setTimeout(() => {
                            window.location.href = response.redirectUrl; // Redirect sesuai arahan server
                        }, 1500);
                    }
                },
                error: function(xhr) {
                    const error = xhr.responseJSON || { message: 'Login gagal. Periksa kembali email dan password.' };
                    window.showAlert(error.message, 'error');
                }
            });
        });
    }
        if (typeof window.updateCartItemCount === 'function') {
        window.updateCartItemCount();
    }
  });
  
  // ===================== AKHIR DARI BAGIAN INTI ======================

})();