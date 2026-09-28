import mongoose from 'mongoose';
import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';
import { HttpStatus } from '../utils/constants.js';

const healthCheck = asyncHandler(async (req, res) => {
  const dbUp = mongoose.connection.readyState === 1
  const status = dbUp ? HttpStatus.OK :503
  res.status(status).json(
    new ApiResponse(status, {
      message: dbUp ? 'Server is running': 'Database disconnected'
    })
  );
});

export { healthCheck };
