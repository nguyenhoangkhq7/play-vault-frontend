export async function uploadImagesToCloudinary(files) {
  const uploadedUrls = [];
  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "playvault_images_storage");

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dqnj8bsgu/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      uploadedUrls.push(data.secure_url);
    } catch (error) {
      console.error("Lỗi tải ảnh lên:", error);
    }
  }
  return uploadedUrls;
}
