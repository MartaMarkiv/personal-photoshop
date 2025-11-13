import { STABILITY_API } from "../config";

export const sendEditStabilityRequest = async (
  formData: FormData,
): Promise<Response> => {
  
  return await fetch(STABILITY_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_STABILITY_API_KEY}`,
      Accept: "image/*",
    },
    body: formData,
  });
};