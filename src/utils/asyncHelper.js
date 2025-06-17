// asyncHandler adalah sebuah fungsi yang menerima fungsi lain (fn) sebagai argumennya.
const asyncHandler = (fn) => 
  
  // asyncHandler mengembalikan sebuah fungsi baru. 
  // Fungsi inilah yang akan dijalankan oleh Express ketika sebuah route diakses.
  // Fungsi ini menerima parameter standar middleware Express: req, res, dan next.
  (req, res, next) =>
  
    // Promise.resolve() digunakan untuk "membungkus" hasil dari eksekusi fn(req, res, next).
    // 1. Jika `fn` (fungsi controller asli Anda) berjalan lancar dan mengembalikan sebuah promise
    //    yang berhasil (resolved), maka tidak terjadi apa-apa, dan kode controller berjalan seperti biasa.
    // 2. Jika `fn` adalah fungsi async dan terjadi error di dalamnya (misalnya, query database gagal),
    //    maka promise tersebut akan ditolak (rejected).
    Promise.resolve(fn(req, res, next))
    
      // .catch(next) adalah bagian kuncinya.
      // Jika promise dari `fn` ditolak (rejected), .catch() akan menangkap error tersebut.
      // Kemudian, ia akan memanggil fungsi `next()` dengan error sebagai argumennya (`next(error)`).
      // Memanggil `next()` dengan argumen error akan membuat Express melewatkan semua middleware
      // dan route lainnya, lalu langsung menuju ke middleware penanganan error terpusat 
      // yang sudah kita buat di `errorMiddleware.js`.
      .catch(next);

module.exports = asyncHandler;