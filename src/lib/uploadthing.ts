import { UTApi } from "uploadthing/server";

export const utapi = new UTApi();

/**
 * Upload a file to UploadThing from the server
 * @param {File | Blob} file - The file to upload
 * @returns {Promise<string>} The public URL of the uploaded file
 */
export async function uploadToUploadThing(file: File | Blob): Promise<string> {
  // utapi.uploadFiles expects an array of files
  const response = await utapi.uploadFiles([file as any]);
  
  if (!response || response.length === 0) {
    throw new Error("Upload failed: No response from UTApi");
  }

  const result = response[0];

  if (result.error) {
    throw new Error(`Upload failed: ${result.error.message}`);
  }

  if (!result.data) {
    throw new Error("Upload failed: No data returned from UTApi");
  }

  return result.data.url;
}
