const Item = require('../models/Item');
const ItemInstance = require('../models/ItemInstance');
const Brand = require('../models/Brand');
const Category = require('../models/Category');

const async = require('async');
const { body, validationResult } = require('express-validator');

exports.item_list = (req, res, next) => {
    Item.find()
        .sort({ title: 1 })
        .populate('brand')
        .populate('category')
        .exec((err, list_items) => {
            if (err) {
                return next(err);
            }
            // successful, so render
            res.render('item', {
                title: 'Product List',
                item_list: list_items,
            });
        });
}

exports.item_detail = (req, res, next) => {
    async.parallel(
        {
            item(callback) {
                Item.findById(req.params.id)
                .populate('brand')
                .populate('category')
                .exec(callback);
            },
            item_instance(callback) {
                ItemInstance.find({ item: req.params.id }).exec(callback);
            }
        },
        (err, results) => {
            if (err) {
                return next(err);
            }

            if (results.item === null) {
                //no resulst
                const err = new Error('Product not found');
                err.status = 404;
                return next(err);
            }

            // successful, so render
            res.render('item_detail', {
                title: results.item.title,
                item: results.item,
                item_instance: results.item_instance,
            });
        }
    );
}

exports.item_create_get = (req, res, next) => {
    // get available brands and categories 
    async.parallel(
        {
            brands(callback) {
                Brand.find().exec(callback);
            },
            categories(callback) {
                Category.find().exec(callback);
            }
        },
        (err, results) => {
            if (err) {
                return next(err);
            }

            res.render('item_form', {
                title: 'Create Product',
                brands: results.brands,
                categories: results.categories,
                update: false,
                item: undefined,
                errors: undefined,
            });
        }
    );
}

exports.item_create_post = (req, res, next) => {
    res.send('xxx');
}

exports.item_delete_get = (req, res, next) => {
    res.send('xxx');
}

exports.item_delete_post = (req, res, next) => {
    res.send('xxx');
}

exports.item_update_get = (req, res, next) => {
    res.send('xxx');
}

exports.item_update_post = (req, res, next) => {
    res.send('xxx');
}
