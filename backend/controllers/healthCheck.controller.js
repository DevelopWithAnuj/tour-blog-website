import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';
import { HttpStatus } from '../utils/constants.js';

const healthCheck = asyncHandler(async (req, res) => {
  res.status(HttpStatus.OK).json(
    new ApiResponse(HttpStatus.OK, {
      message: 'Server is running',
    })
  );
});

export { healthCheck };
