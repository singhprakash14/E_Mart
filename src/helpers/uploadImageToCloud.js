const cloudinaryURL = `https://api.cloudinary.com/v1_1/ddhslwi0k/image/upload`;

const uploadImage = async (image) => {
  const formData = new FormData();
  formData.append("file", image); 
  formData.append("upload_preset", "shop_bag_products");  // Ensure the upload preset exists in Cloudinary

  try {
    const dataResponse = await fetch(cloudinaryURL, {
      method: "POST",
      body: formData,
    });

    if (!dataResponse.ok) {
      const errorDetails = await dataResponse.json();
      console.error("Upload failed: ", errorDetails);
      throw new Error("Failed to upload image");
    }

    return dataResponse.json();
  } catch (error) {
    console.error("Error uploading image: ", error);
    throw error;
  }
};

export default uploadImage;
