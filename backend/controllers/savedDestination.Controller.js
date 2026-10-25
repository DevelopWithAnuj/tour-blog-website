import { Tour } from '../models/Tour.models.js';
import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';
import { HttpStatus } from '../utils/constants.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const MAX_SAVED_DESTINATIONS = 30;

const getSavedDestinations = asyncHandler(async (req, res) => {
  res
    .status(HttpStatus.OK)
    .json(
      new ApiResponse(
        HttpStatus.OK,
        { savedDestinations: req.user.savedDestinations || [] },
        'Saved destinations fetched'
      )
    );
});

const saveDestination = asyncHandler(async (req, res) => {
  const requestedName = String(req.body.destination).trim();
  const tour = await Tour.findOne({
    destination: {
      $regex: `^${escapeRegex(requestedName)}$`,
      $options: 'i',
    },
    isActive: true,
  }).select('destination');

  if (!tour) {
    throw new ApiError(HttpStatus.NOT_FOUND, 'Destination not found');
  }

  const savedDestinations = req.user.savedDestinations || [];
  if (
    !savedDestinations.includes(tour.destination) &&
    savedDestinations.length >= MAX_SAVED_DESTINATIONS
  ) {
    throw new ApiError(
      HttpStatus.CONFLICT,
      `You can save at most ${MAX_SAVED_DESTINATIONS} destinations`
    );
  }

  if (!savedDestinations.includes(tour.destination)) {
    if (!Array.isArray(req.user.savedDestinations)) {
      req.user.savedDestinations = [];
    }
    req.user.savedDestinations.push(tour.destination);
    await req.user.save();
  }

  res
    .status(HttpStatus.OK)
    .json(
      new ApiResponse(
        HttpStatus.OK,
        { savedDestinations: req.user.savedDestinations },
        'Destination saved'
      )
    );
});

const removeSavedDestination = asyncHandler(async (req, res) => {
  const requestedName = String(req.body.destination).trim().toLowerCase();
  const savedDestinations = req.user.savedDestinations || [];
  const existingName = savedDestinations.find(
    (destination) => destination.toLowerCase() === requestedName
  );

  if (existingName) {
    req.user.savedDestinations = savedDestinations.filter(
      (destination) => destination !== existingName
    );
    await req.user.save();
  }

  res
    .status(HttpStatus.OK)
    .json(
      new ApiResponse(
        HttpStatus.OK,
        { savedDestinations: req.user.savedDestinations || [] },
        'Destination removed'
      )
    );
});

export { getSavedDestinations, saveDestination, removeSavedDestination };
