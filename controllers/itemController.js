const Item = require('../models/Item');
const ItemInstance = require('../models/ItemInstance');
const Brand = require('../models/Brand');
const Category = require('../models/Category');

const async = require('async');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

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

exports.item_create_post = [
    /**
     * convert category to an array; important for form reload when data is not valid
     * you could also use the body validator .toArray() of express-validator
     */
    (req, res, next) => {
        if (!Array.isArray(req.body.category)) {
            req.body.category = typeof req.body.category === 'undefined' ? [] : [req.body.category];
        }
        next();
    },

    // validate and sanitize input values
    body('title', 'Product title is required')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('description', 'Product description is required')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('productID')
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage('Product ID is required')
        .isInt()
        .withMessage('Product ID has to be a number'),
    body('brand*').escape(),
    body('category*').escape(),
    // (*) wildcart in the sanitizer to individually validate each of the category array entries

    // process request after validation and sanitization
    (req, res, next) => {
        // get all brands and categories
        async.parallel(
            {
                brands(callback) {
                    Brand.find({}, 'name _id').exec(callback);
                },
                categories(callback) {
                    Category.find({}, 'name _id').exec(callback);
                }
            },
            (err, results) => {
                if (err) {
                    next(err);
                }

                // create item object with escaped and trimmed data
                const item = new Item({
                    title: req.body.title,
                    description: req.body.description,
                    productID: req.body.productID,
                    category: [],
                });

                // get the brand path
                for (const brand of results.brands) {
                    if (brand.name === req.body.brand) {
                        item.brand = ObjectId(brand._id);
                    }
                }
                // get the category paths
                if (req.body.category.length > 0) {
                    for (const category of results.categories) {
                        for (checked_category of req.body.category) {
                            if (checked_category === category.name) {
                                item.category.push(ObjectId(category._id));
                            }
                        }
                    }
                }                
                // extract errors from validation
                const errors = validationResult(req);

                if (!errors.isEmpty()) {
                    // there are errors; render form again with satinized values/error messages
            
                    // get all brands and categories again
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
                            console.log(results.categories);
                            if (err) {
                                next(err);
                            }

                            // mark our selected categories as checked
                            for (const category of results.categories) {
                                if (item.category.includes(category._id)) {
                                    category.checked = true;
                                }
                            }
                            
                            res.render('item_form', {
                                title: 'Create Product',
                                item,
                                brands: results.brands,
                                categories: results.categories,
                                update: false,
                                errors: errors.array(),
                            });
                        }
                        );
                        return;
                    }
            
                // data from form is valid; save the item
                item.save((err) => {
                    if (err) {
                        next(err);
                    }
                    
                    res.redirect(item.url);
                });
            }
        );
    }
]

exports.item_delete_get = (req, res, next) => {
    res.send('xxx');
}

exports.item_delete_post = (req, res, next) => {
    res.send('xxx');
}

exports.item_update_get = (req, res, next) => {
    // TODO: get array of checked categories; add property checked: Boolean
    res.send('xxx');
}

exports.item_update_post = (req, res, next) => {
    res.send('xxx');
}
