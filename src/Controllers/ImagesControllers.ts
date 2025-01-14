import { v4 as uuid } from "uuid";
import multer from "multer";
import firebaseApp from "../Config/firebase";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
  deleteObject,
} from "firebase/storage";
type saveImgRes = {
  status: 201 | 400 | 500;
  imgName?: string;
  downloadUrl?: string;
  error?: unknown;
};
type deleteImgRes = {
  status: 204 | 500;
  message: string | unknown;
};
firebaseApp;
class ImageControllers {
  private firebaseStorage = getStorage();
  public readonly multerStorage = multer({ storage: multer.memoryStorage() });
  private maxImageSize = 1024 * 1024;
  private allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];

  private static instance: ImageControllers;
  static getInstance(): ImageControllers {
    if (!ImageControllers.instance) {
      ImageControllers.instance = new ImageControllers();
      return ImageControllers.instance;
    } else {
      return ImageControllers.instance;
    }
  }
  async validateImage(img: any): Promise<Boolean> {
    if (
      this.allowedMimeTypes.includes(img.mimetype) &&
      img.size <= this.maxImageSize
    ) {
      return true;
    } else {
      return false;
    }
  }
  async saveImage(img: any): Promise<saveImgRes> {
    const isImageValid = await this.validateImage(img);
    if (isImageValid === false) {
      return {
        status: 400,
        error: `Invalid Image Max Image Size is 1Mb and this is allowed types ${this.allowedMimeTypes}`,
      };
    }
    try {
      const imgName = uuid();
      const storageRef = ref(
        this.firebaseStorage,
        `socialMedia-app/${imgName}`
      );
      const metaData = {
        contentType: img.mimetype,
      };
      const snapShot = await uploadBytesResumable(
        storageRef,
        img.buffer,
        metaData
      );
      const downloadUrl = await getDownloadURL(snapShot.ref);
      return {
        status: 201,
        imgName: imgName,
        downloadUrl: downloadUrl,
      };
    } catch (error) {
      return {
        status: 500,
        error: error,
      };
    }
  }
  async deleteImage(imgName: string): Promise<deleteImgRes> {
    try {
      const storageRef = ref(
        this.firebaseStorage,
        `socialMedia-app/${imgName}`
      );
      await deleteObject(storageRef);
      return {
        status: 204,
        message: "image deleted successfully",
      };
    } catch (error) {
      return {
        status: 500,
        message: error,
      };
    }
  }
}
export default ImageControllers.getInstance();
