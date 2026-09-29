import { Router } from 'express';
import {
  getTourById,
  getTourCategories,
  getTours,
} from '../controllers/tour.Controller.js';

const router = Router();

router.route('/').get(getTours);
router.route('/categories').get(getTourCategories);
router.route('/:id').get(getTourById);

export default router;
