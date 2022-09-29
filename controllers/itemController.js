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
                url: req.url,
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
                title: 'Product Detail',
                item: results.item,
                item_instance: results.item_instance,
                url: req.url,
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
                url: req.url,
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
        // create new item object with sanitized/trimmed data 
        const item = new Item({
            title: req.body.title,
            description: req.body.description,
            productID: req.body.productID,
            brand: req.body.brand,
            category: typeof req.body.category === 'undefined' ? [] : req.body.category,
            image: {
                name: req.file.originalname,
                size: req.file.size,
                data: req.file.buffer,
                contentType: req.file.mimetype
            },
        });
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
                        url: req.url,
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
            
            /*
            * item_count feature removed
            // increment category item_count 
            item.category.forEach((categoryID) => {
                Category.findOneAndUpdate({ _id: categoryID }, { $inc: { 'item_count': 1 }})
                    .exec((err) => {
                        if (err) {
                            return next(err);
                        }
                    });
            });
            */

            res.redirect(item.url);
        });
    }
]

exports.item_delete_get = (req, res, next) => {
    async.parallel(
        {
            item(callback) {
                Item.findById(req.params.id).exec(callback);
            },
            iteminstances(callback) {
                ItemInstance.find({ item: req.params.id })
                    .populate('item')
                    .exec(callback);
            }
        },
        (err, results) => {
            if (err) {
                return next(err);
            }

            if (results.item === null) {
                // no results
                res.redirect('/item');
                return;
            }

            // success; render
            res.render('item_delete', {
                title: 'Delete Product',
                item: results.item,
                iteminstances: results.iteminstances,
                url: req.url,
            });
        }
    )
}

exports.item_delete_post = (req, res, next) => {
    // first we validate that an ID has been provided via the HTML body (not from the URL)
    async.parallel(
        {
            item(callback) {
                Item.findById(req.body.itemid).exec(callback);
            },
            iteminstances(callback) {
                ItemInstance.find({ item: req.body.itemid })
                    .populate('item')
                    .exec(callback);
            }
        },
        (err, results) => {
            if (err) {
                return next(err);
            }

            if (results.iteminstances.length > 0) {
                // iteminstances exist; render the same way as fot GET route
                res.render('item_delete', {
                    title: 'Delete Product',
                    item: results.item,
                    iteminstances: results.iteminstances,
                    url: req.url,
                });
                return;
            }

            // no instances; delete item and redirect to the item list
            Item.findByIdAndRemove(req.body.itemid, (err) => {
                if (err) {
                    return next(err);
                }

                /*
                * item_count feature removed
                // decrement category item_count
                results.item.category.forEach((categoryID) => {
                    Category.findOneAndUpdate({ _id: categoryID }, { $inc: { 'item_count': -1 }})
                        .exec((err) => {
                            if (err) {
                                return next(err);
                            }
                        });
                });
                */

                // success
                res.redirect('/item');
            });
        }
    );
}

exports.item_update_get = (req, res, next) => {
    async.parallel(
        {
            item(callback) {
                Item.findById(req.params.id)
                    .populate('brand')
                    .populate('category')
                    .exec(callback);
            },
            brands(callback) {
                Brand.find({}, 'name _id').exec(callback);
            },
            categories(callback) {
                Category.find({}, 'name _id').exec(callback);
            }
        },
        (err, results) => {
            if (err) {
                return next(err);
            }

            // no results
            if (results.item === null) {
                const err = new Error('Product not found');
                err.status = 404;
                return next(err);
            }

            // success; mark categories as checked
            for (const category of results.categories) {
                for (const itemCategory of results.item.category) {
                    if (itemCategory._id.toString() === category._id.toString()) {
                        category.checked = true;
                    }
                }
            }

            // mark selected brand
            for(const brand of results.brands) {
                if (brand._id.toString() === results.item.brand._id.toString()) {
                    brand.selected = true;
                }
            }

            res.render('item_form', {
                title: 'Update Product',
                item: results.item,
                brands: results.brands,
                categories: results.categories,
                update: true,
                errors: undefined,
                url: req.url,
            });
        }
    );
}

exports.item_update_post = [
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
        // create item object with escaped/trimmed data and old ID
        const item = new Item({
            title: req.body.title,
            description: req.body.description,
            productID: req.body.productID,
            brand: req.body.brand,
            category: typeof req.body.category === 'undefined' ? [] : req.body.category,
            image: {
                name: req.file.originalname,
                size: req.file.size,
                data: req.file.buffer,
                contentType: req.file.mimetype
            },
            _id: req.params.id,
        });

        // extract the validation errors from a erquest
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // there are errors; render the form again with sanitized values/error messages
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
                    if (err) {
                        next(err);
                    }

                    // mark our selected categories as checked
                    for (const category of results.categories) {
                        if (item.category.includes(category._id)) {
                            category.checked = true;
                        }
                    }

                    // mark selected brand
                    for(const brand of results.brands) {
                        if (brand._id.toString() === results.item.brand._id.toString()) {
                            brand.selected = true;
                        }
                    }
                    
                    res.render('item_form', {
                        title: 'Create Product',
                        item,
                        brands: results.brands,
                        categories: results.categories,
                        update: true,
                        errors: errors.array(),
                        url: req.url,
                    });
                }
                );
                return;
        }

        // data from form is valid; update document
        Item.findByIdAndUpdate(req.params.id, item, {}, (err, theitem) => {
            if (err) {
                return next(err);
            }

            // succesful; redirect to item detail page
            res.redirect(item.url);
        });
    }
];
