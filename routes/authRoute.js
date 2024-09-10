import express from 'express'
import { registerContoller, loginController, forgotPasswordController, updateProfileController, getOrdersController, getAllOrdersController, updateOrderStatusController } from '../controllers/authController.js'
import { requireSignin, isAdmin } from '../middlewares/authMiddleware.js'

const router = express.Router()

//REGISTER 
router.post('/register', registerContoller)
//LOGIN
router.post('/login', loginController)



//PROTECTED USER ROUTE
router.get('/user-auth', requireSignin, (req, res) => {
    res.status(200).send({ ok: true });
})

router.post('/forgot-password', forgotPasswordController);


//PROTECTED ADMIN ROUTE
router.get('/admin-auth', requireSignin, isAdmin, (req, res) => {
    res.status(200).send({ ok: true });
})

router.put('/profile', requireSignin, updateProfileController)

router.get('/orders', requireSignin, getOrdersController)

router.get('/all-orders', requireSignin, getAllOrdersController)
router.put('/order-status/:orderId', requireSignin, isAdmin, updateOrderStatusController)


export default router