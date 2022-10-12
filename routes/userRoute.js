const express = require('express')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')

const router = express.Router()

router.post('/signup', authController.signUp)
router.post('/login', authController.logIn)

// router.post('/forgotPassword', authController.forgotPassword)
// router.patch('/resetPassword/:token', authController.resetPassword)

// Protect all routes after this middleware
// --------Middleware xác thực người dùng đang đăng nhập
router.use(authController.protect)

router.get('/logout', authController.logOut)
router.patch('/updateMyPassword', authController.updatePassword)

router.patch('/updateMe', userController.uploadUserAvatar, userController.resizeUserAvatar, userController.updateMe)
router.get('/me', userController.getMe, userController.getUser)
router.patch('/deleteMe', userController.deleteMe, userController.deleteSoftUser)

// ------------- admin 
router.get('/not-active', authController.restrictTo('admin', 'superadmin'), userController.getAllUsersNotActive)

router.route('/:id')
    .get(authController.restrictTo('admin', 'superadmin'), userController.getUser)
    .patch(authController.restrictTo('superadmin'), userController.updateUser)
    .delete(authController.restrictTo('superadmin'), userController.deleteUser)

router.patch('/:id/soft-delete', authController.restrictTo('superadmin'), userController.deleteSoftUser)
router.patch('/:id/restore', authController.restrictTo('superadmin'), userController.restoreUser)


router.route('/')
    .get(authController.restrictTo('admin', 'superadmin'), userController.getAllUsers)
    .post(authController.restrictTo('admin', 'superadmin'), userController.createUser)

module.exports = router