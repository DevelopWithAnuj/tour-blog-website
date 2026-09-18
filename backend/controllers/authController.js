import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';
import { HttpStatus } from '../utils/constants.js';
// Auth controller placeholder
export function login(req, res) {
  res.json({ message: 'Login route placeholder' });
}

export function logout(req, res) {
  res.json({ message: 'Logout route placeholder' });
}

export function getCurrentUser(req, res) {
  res.json({ message: 'Current user route placeholder' });
}
