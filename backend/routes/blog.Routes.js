import { Router } from "express";
import { getBlogCategories, getPostBySlug, getPosts } from '../controllers/blog.Controller.js'

const router = Router()

router.route('/').get(getPosts)
router.route('/categories').get(getBlogCategories)
router.route('/:slug').get(getPostBySlug)

export default router
