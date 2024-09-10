import express from 'express'
import { requireSignin, isAdmin } from '../middlewares/authMiddleware.js';
import { createProductController, getProductController, getSingleProductController, productPhotoController, deleteProductcontroller, updateProductController, productFiltersController, productCountController, productListController, searchController, relatedProductController, productCategoryController, braintreeTokenController, braintreePaymentsController } from '../controllers/productController.js'
import formidable from 'express-formidable';
const router = express.Router()

router.post('/create-product', requireSignin, isAdmin, formidable(), createProductController)
router.put('/update-product/:pid', requireSignin, isAdmin, formidable(), updateProductController)

router.get('/get-product', getProductController)
router.get('/get-singleProduct/:slug', getSingleProductController)
router.get('/get-photo/:pid', productPhotoController)
router.delete('/delete-product/:pid', requireSignin, isAdmin, deleteProductcontroller)
router.post('/product-filters', productFiltersController)
router.get('/product-count', productCountController)
router.get('/product-list/:page', productListController)
router.get('/search/:keyword', searchController)
router.get('/related-product/:pid/:cid', relatedProductController)
router.get('/product-category/:slug', productCategoryController)
router.get('/braintree/token', braintreeTokenController)
router.post('/braintree/payments', requireSignin, braintreePaymentsController)
export default router


