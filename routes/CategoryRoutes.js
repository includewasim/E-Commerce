import express from 'express';
import { requireSignin, isAdmin } from '../middlewares/authMiddleware.js';
import { createCategoryController, updateCategoryController, getAllCategoryController, getCategoryController, deleteCategoryController } from '../controllers/categoryController.js';

const router = express.Router();

router.post('/create-category', requireSignin, isAdmin, createCategoryController);

router.put('/update-category/:id', requireSignin, isAdmin, updateCategoryController)

router.get('/getAllCategory', getAllCategoryController)

router.get('/get-category/:slug', getCategoryController)

router.delete('/delete-category/:id', requireSignin, isAdmin, deleteCategoryController)
export default router;
