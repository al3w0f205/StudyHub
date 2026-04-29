import { UTApi } from "uploadthing/server";

export const utapi = new UTApi();

/**
 * Upload a file to UploadThing from the server
 * @param {File | Blob} file - The file to upload
 * @returns {Promise<string>} The public URL of the uploaded file
 */
export async function uploadToUploadThing(file) {
  const response = await utapi.uploadFiles(file);
  if (response.error) {
    throw new Error(`Upload failed: ${response.error.message}`);
  }
  return response.data.url;
}
