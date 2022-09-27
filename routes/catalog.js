const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 500000,
    },
});

// import controller modules
const category_controller = require('../controllers/categoryController');
const item_controller = require('../controllers/itemController');
const iteminstance_controller = require('../controllers/iteminstanceController');
const brand_controller = require('../controllers/brandController');

// rendering services
router.get('/', category_controller.index);

// API
// category
router.get('/category/create', category_controller.category_create_get);
router.post('/category/create', upload.single('image'), category_controller.category_create_post);
router.get('/category/:id/delete', category_controller.category_delete_get);
router.post('/category/:id/delete', category_controller.category_delete_post);
router.get('/category/:id/update', category_controller.category_update_get);
router.post('/category/:id/update', upload.single('image'), category_controller.category_update_post);
router.get('/category/:id', category_controller.category_detail);

// brand
router.get('/brand/create', brand_controller.brand_create_get);
router.post('/brand/create', upload.single('image'),brand_controller.brand_create_post);
router.get('/brand/:id/delete', brand_controller.brand_delete_get);
router.post('/brand/:id/delete', brand_controller.brand_delete_post);
router.get('/brand/:id/update', brand_controller.brand_update_get);
router.post('/brand/:id/update', upload.single('image'), brand_controller.brand_update_post);
router.get('/brand/:id', brand_controller.brand_detail);
router.get('/brand', brand_controller.brand_list);

// item
router.get('/item/create', item_controller.item_create_get);
router.post('/item/create', upload.single('image'), item_controller.item_create_post);
router.get('/item/:id/delete', item_controller.item_delete_get);
router.post('/item/:id/delete', item_controller.item_delete_post);
router.get('/item/:id/update', item_controller.item_update_get);
router.post('/item/:id/update', upload.single('image'), item_controller.item_update_post);
router.get('/item/:id', item_controller.item_detail);
router.get('/item', item_controller.item_list);

// item instance
router.get('/iteminstance/create', iteminstance_controller.iteminstance_create_get);
router.post('/iteminstance/create', iteminstance_controller.iteminstance_create_post);
router.post('/api/iteminstance/:id/delete', iteminstance_controller.iteminstance_delete_protected_post);
router.post('/iteminstance/:id/delete', iteminstance_controller.iteminstance_delete_post);
router.get('/iteminstance/:id/update', iteminstance_controller.iteminstance_update_get);
router.post('/iteminstance/:id/update', iteminstance_controller.iteminstance_update_post);
router.get('/iteminstance/:id', iteminstance_controller.iteminstance_detail);

module.exports = router;
