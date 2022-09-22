const Item = require('../models/Item');
const ItemInstance = require('../models/ItemInstance');
const Brand = require('../models/Brand');
const Category = require('../models/Category');

const { body, validationResult } = require('express-validator');
const async = require('async');

const getCategories = (template) => {
    return (req, res, next) => {
        async.parallel(
            {
                list_items(callback) {
                    Item.find({}, 'title')
                    .exec(callback);
                },
                list_categories(callback) {
                    Category.find()
                        .sort({ 'name': 'ascending' })
                        .exec(callback);
                }
            },
            (err, results) => {
                if (err) {
                    return next(err);
                }
    
                res.render(template, {
                    title: 'Category List',
                    error: err,
                    category_list: results.list_categories,
                    item_list: results.list_items,
                });
            }
        );
    };
}

// displays all catogories on homepage
exports.index = getCategories('index');

// display category list
exports.category_list = getCategories('category_list');

// display detail page for a specific category
// TODO: do I need category_items displayed in the template?
exports.category_detail = (req, res, next) => {
    async.parallel(
        {
            category(callback) {
                Category.findById(req.params.id).exec(callback);
            },
            category_items(callback) {
                Item.find({ genre: req.params.id }).exec(callback);
            }
        },
        (err, results) => {
            if (err) {
                return next(err);
            }

            if (results.category === null) {
                const err = new Error('Category not found');
                err.status = 404;
                return next(err);
            }

            res.render('category_detail', {
                title: 'Category Detail',
                category: results.category,
                category_items: results.category_items,
            });
        }
    );
};

// display category create form on GET
exports.category_create_get = (req, res, next) => {
    res.render('category_form', { title: 'Create Category'});
}

exports.category_create_post = [
    // validate and sanitize the name field
    body('name', 'Category name required')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('description', 'Category description required')
        .trim()
        .isLength({ min: 1})
        .escape(),

    // process request after validation and sanitization
    (req, res, next) => {
        // validation errors from request
        const errors = validationResult(req);

        // create a category object
        const category = new Category({
            name: req.body.name.toUpperCase(),
            description: req.body.description
        });

        if (!errors.isEmpty()) {
            // error; render the form again with sanitized values/error message
            res.render('category_form', {
                title: 'Create Category',
                category,
                errors: errors.array()
            });
            return;
        } else {
            // data from form is valid
            // check if category with same name already exists
            Category.findOne({ name: req.body.name.toUpperCase() })
                .exec((err, found_category) => {
                    if (err) {
                        return next(err);
                    }

                    if (found_category) {
                        // category exists; redirect to its detail page
                        res.redirect(found_category.url);
                    } else {
                        // save category and redirect to homepage
                        category.save((err) => {
                            if (err) {
                                return next(err);
                            }
                            res.redirect(category.url);
                        });
                    }
                });
        }
    }
]

exports.category_delete_get = (req, res, next) => {
    async.parallel(
        {
            category(callback) {
                Category.findById(req.params.id).exec(callback);
            },
            category_items(callback) {
                Item.find({ category: req.params.id }).exec(callback);
            }
        },
        (err, results) => {
            if (err) {
                return next(err);
            }
    
            // no results
            if (results.category === null) {
                res.redirect('/');
            }
    
            // successful, so render
            res.render('category_delete', {
                title: 'Delete Category',
                category: results.category,
                category_items: results.category_items,
            });
        }
    );
}

exports.category_delete_post = (req, res, next) => {
    // firts we validate that an id has been provided; sent via the body parameters (HTML input name), rather than usind the version in the URL
    async.parallel(
        {
            category(callback) {
                Category.findById(req.body.categoryid).exec(callback);
            },
            category_items(callback) {
                Item.find({ category: req.body.categoryid }).exec(callback);
            }
        },
        (err, results) => {
            if (err) {
                return next(err);
            }

            // success
            if (results.category_items.length > 0) {
                // category has items; render in the same way as for GET route
                res.render('category_delete', {
                    title: 'Delete Category',
                    category: results.category,
                    category_items: results.category_items,
                });
                return;
            }

            // category has no items; delete object and redirect to the list of categories (index page)
            Category.findByIdAndRemove(req.body.categoryid, (err) => {
                if (err) {
                    return next(err);
                }

                res.redirect('/');
            });
        }
    );
}

exports.category_update_get = (req, res, next) => {
    res.send('xxx');
}

exports.category_update_post = (req, res, next) => {
    res.send('xxx');
}
