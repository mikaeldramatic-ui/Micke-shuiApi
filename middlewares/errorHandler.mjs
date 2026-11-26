import { sendResponse } from '../utils/sendResponse.mjs';

export const errorHandler = () => ({
  onError: (request) => {
    const error = request.error;
    
    let statusCode = error.statusCode || 500;

    if (statusCode === 415 || statusCode === 422) {
      statusCode = 400;
    } 

    console.error(error);

    const message = statusCode < 500 ? error.message : "Internal server error";

    request.response = sendResponse(statusCode, { error: message });
  },
});
