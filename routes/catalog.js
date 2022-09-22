const express = require('express');
const router = express.Router();

// import controller modules
const category_controller = require('../controllers/categoryController');
const item_controller = require('../controllers/itemController');
const iteminstance_controller = require('../controllers/iteminstanceController');
const brand_controller = require('../controllers/brandController');

// rendering services
router.get('/', category_controller.index);
router.get('/category/:id', category_controller.category_detail);
router.get('/brand/:id', brand_controller.brand_detail);
router.get('/item/:id', item_controller.item_detail);
router.get('/iteminstance/:id', iteminstance_controller.iteminstance_detail);

// API
// category
router.get('/api/category/create', category_controller.category_create_get);
router.post('/api/category/create', category_controller.category_create_post);
router.get('/api/category/:id/delete', category_controller.category_delete_get);
router.post('/api/category/:id/delete', category_controller.category_delete_post);
router.get('/api/category/:id/update', category_controller.category_update_get);
router.post('/api/category/:id/update', category_controller.category_update_post);
router.get('/api/category', category_controller.category_list);

// brand
router.get('/api/brand/create', brand_controller.brand_create_get);
router.post('/api/brand/create', brand_controller.brand_create_post);
router.get('/api/brand/:id/delete', brand_controller.brand_delete_get);
router.post('/api/brand/:id/delete', brand_controller.brand_delete_post);
router.get('/api/brand/:id/update', brand_controller.brand_update_get);
router.post('/api/brand/:id/update', brand_controller.brand_update_post);
router.get('/api/brand', brand_controller.brand_list);

// item
router.get('/api/item/create', item_controller.item_create_get);
router.post('/api/item/create', item_controller.item_create_post);
router.get('/api/item/:id/delete', item_controller.item_delete_get);
router.post('/api/item/:id/delete', item_controller.item_delete_post);
router.get('/api/item/:id/update', item_controller.item_update_get);
router.post('/api/item/:id/update', item_controller.item_update_post);
router.get('/api/item', item_controller.item_list);

// item instance
router.get('/api/iteminstance/create', iteminstance_controller.iteminstance_create_get);
router.post('/api/iteminstance/create', iteminstance_controller.iteminstance_create_post);
router.get('/api/iteminstance/:id/delete', iteminstance_controller.iteminstance_delete_get);
router.post('/api/iteminstance/:id/delete', iteminstance_controller.iteminstance_delete_post);
router.get('/api/iteminstance/:id/update', iteminstance_controller.iteminstance_update_get);
router.post('/api/iteminstance/:id/update', iteminstance_controller.iteminstance_update_post);
router.get('/api/iteminstance', iteminstance_controller.iteminstance_list);

module.exports = router;
