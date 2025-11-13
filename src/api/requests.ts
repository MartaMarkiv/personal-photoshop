import { HUGGINGFACE_API, REPLICATE_API } from "../config";

export const sendEditRequest = async (
  image: string,
  maskImage: string,
): Promise<Response> => {
  return await fetch(HUGGINGFACE_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_HUGGINGFACE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: image,
      mask_image: maskImage,
      prompt: "remove unwanted objects and fill naturally",
    }),
  });
};

export const sendEditReplicateRequest = async (imageBase64: string, maskBase64: string): Promise<Response> => {
  return await fetch(REPLICATE_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${import.meta.env.VITE_REPLICATE_API_TOKEN}`,
    },
    body: JSON.stringify({
      version: "stability-ai/stable-diffusion-inpainting",
      input: {
        image: imageBase64,
        mask: maskBase64,
        prompt: "remove unwanted objects and fill naturally",
      },
    }),
  });
};