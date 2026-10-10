// @desc    Upload image(s)
// @route   POST /api/upload
// @access  Admin
export const uploadImage = (req, res) => {
  try {
    if (!req.file && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded',
      });
    }

    if (req.file) {
      const fileUrl = `/uploads/${req.file.filename}`;
      return res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        url: fileUrl,
      });
    }

    if (req.files) {
      const urls = req.files.map((file) => `/uploads/${file.filename}`);
      return res.status(200).json({
        success: true,
        message: 'Images uploaded successfully',
        urls,
      });
    }
  } catch (error) {
    console.error('Error in uploadImage:', error);
    res.status(500).json({
      success: false,
      message: 'Image upload failed',
      error: error.message,
    });
  }
};
