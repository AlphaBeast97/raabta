import ImageKit, { toFile } from "@imagekit/nodejs";

let imagekit = null;

const getImageKit = () => {
  if (!imagekit) {
    imagekit = new ImageKit({ privateKey: process.env.IMAGEKIT_PRIVATE_KEY });
  }
  return imagekit;
};

const hasImageKitConfig = () => {
  return Boolean(process.env.IMAGEKIT_PRIVATE_KEY);
};

// Creates a unique filename for uploaded images
const createFileName = (originalName = "upload") => {
  const safeName = originalName.replace(/[^a-zA-Z0-9]/g, "_");
  return `chat-${Date.now()}-${safeName}`;
};

// Uploads a file to ImageKit and returns the uploaded file's URL
const uploadChatMedia = async (file) => {
  const imageKitInstance = getImageKit();
  const fileName = createFileName(file.originalname);

  const result = await imageKitInstance.files.upload({
    file: await toFile(file.buffer, fileName, { type: file.mimetype }),
    fileName,
    folder: "/chat",
  });

  return result.url;
};

export { hasImageKitConfig, uploadChatMedia };
