
/**
 * Middleware untuk penanganan error terpusat.
 */
const errorMiddleware = (err, req, res, next) => {
  // Log error untuk debugging di server
  console.error('--- TERJADI ERROR GLOBAL ---');
  console.error(`Path: ${req.path}`);
  console.error(`Method: ${req.method}`);
  console.error(`Error Message: ${err.message}`);
  console.error(err.stack); // Stack trace membantu melacak asal error
  console.error('----------------------------');

  // Set default status code dan pesan
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Perlakuan khusus untuk error database umum
  if (err.name === 'SequelizeUniqueConstraintError' || err.code === 'ER_DUP_ENTRY') {
    statusCode = 409; // Conflict
    message = 'Data already exists (e.g., email already registered).';
  } else if (err.code === 'ER_BAD_FIELD_ERROR' || err.code === 'ER_NO_SUCH_TABLE') {
    // Error kolom atau tabel tidak ditemukan
    statusCode = 500;
    message = 'Database schema error. Please contact support.';
  } else if (err.message.includes('Database error')) { // Error yang kita lempar dari model
    statusCode = 500;
    // message = err.message; // Bisa pakai pesan asli dari model
  }


  // Tentukan jenis respons: JSON untuk API, render halaman untuk permintaan halaman
  if (req.accepts('html')) {
    // Jika request mengharapkan HTML (misalnya dari browser langsung)
    // Render halaman error khusus
    // Pastikan Anda memiliki views/error.ejs atau 404.ejs yang bisa menangani ini
    const commonData = res.locals; // Gunakan res.locals untuk data umum
    return res.status(statusCode).render('404', { // Bisa render 'error.ejs' jika ada
      ...commonData,
      title: `Error ${statusCode}`,
      error: message,
      // Jika Anda punya template error yang lebih canggih, teruskan lebih banyak detail
    });
  } else {
    // Jika request mengharapkan JSON (misalnya dari panggilan AJAX/API)
    return res.status(statusCode).json({
      message: message,
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Tampilkan stack trace di dev
    });
  }
};

module.exports = errorMiddleware;