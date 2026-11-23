import { sendResponse } from '../utils/sendResponse.mjs';

export const errorHandler = () => ({
  onError: (request) => {
    const error = request.error;
    const statusCode = error.statusCode || 500;

    console.error(error);

    const message = statusCode < 500 ? error.message : "Internal server error";

    request.response = sendResponse(statusCode, { error: message });
  },
});
