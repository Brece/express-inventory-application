const Brand = require('../models/Brand');
const Item = require('../models/Item');

const { body, validationResult } = require('express-validator');
const async = require('async');

exports.brand_list = (req, res, next) => {
    Brand.find()
        .sort({ 'name': 'ascending' })
        .exec((err, list_brands) => {
            if (err) {
                return next(err);
            }

            res.render('brand', {
                title: 'Brand List',
                brand_list: list_brands,
                url: req.url,
            });
        });
}

exports.brand_detail = (req, res, next) => {
    async.parallel(
        {
            brand(callback) {
                Brand.findById(req.params.id).exec(callback);
            },
            brand_items(callback) {
                Item.find({ brand: req.params.id }).exec(callback);
            }
        },
        (err, results) => {
            if (err) {
                return next(err);
            }

            if (results.brand === null) {
                // no results
                const err = new Error('Brand not found');
                err.status = 404;
                return next(err);
            }
            // successful, so render
            res.render('brand_detail', {
                title: 'Brand Detail',
                brand: results.brand,
                brand_items: results.brand_items,
                url: req.url,
            });
        }
    );
}

exports.brand_create_get = (req, res, next) => {
    res.render('brand_form', {
        title: 'Create Brand',
        update: false,
        errors: false,
        brand: undefined,
        url: req.url,
    });
}

exports.brand_create_post = [
    // validate and sanitize input values
    body('name', 'Brand name required')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('description', 'Brand description required')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('location', 'Brand loaction required')
        .trim()
        .isLength({ min: 1 })
        .escape(),

    // process after validation and sanitization
    (req, res, next) => {
        // extract the validation errors from request
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // there are errors; render form with sanitized input values
            res.render('brand_form', {
                title: 'Create Brand',
                brand: req.body,
                update: false,
                errors: errors.array(),
                url: req.url,
            });
            return;
        }

        // data is valid; create brand object
        const brand = new Brand({
            name: req.body.name,
            description: req.body.description,
            location: req.body.location,
            image: {
                name: req.file.originalname,
                size: req.file.size,
                data: req.file.buffer,
                contentType: req.file.mimetype
            },
        });

        brand.save((err) => {
            if (err) {
                return next(err);
            }

            // successful; redirect to brand detail page
            res.redirect(brand.url);
        });
    }
]

exports.brand_delete_get = (req, res, next) => {
    async.parallel(
        {
            brand(callback) {
                Brand.findById(req.params.id).exec(callback);
            },
            brand_items(callback) {
                Item.find({ brand: req.params.id }).exec(callback);
            }
        },
        (err, results) => {
            if (err) {
                return next(err);
            }

            // no results
            if (results.brand === null) {
                res.redirect('/brand');
                return;
            }

            // successful, so render
            res.render('brand_delete', {
                title: 'Delete Brand',
                brand: results.brand,
                brand_items: results.brand_items,
                url: req.url,
            });
        }
    );
}

exports.brand_delete_post = (req, res, next) => {
    // first validate that an id has been provided; sent via the body parameters
    async.parallel(
        {
            brand(callback) {
                Brand.findById(req.body.brandid).exec(callback);
            },
            brand_items(callback) {
                Item.find({ brand: req.body.brandid }).exec(callback);
            }
        },
        (err, results) => {
            if (err) {
                return next(err);
            }

            // security to protect private documents from HTML hacks
            if (!results.brand.protected) {
                // success
                if (results.brand_items.length > 0) {
                    // brand has items; render in the same way as for GET route
                    res.render('brand_delete', {
                        title: 'Delete Brand',
                        brand: results.brand,
                        brand_items: results.brand_items,
                        url: req.url,
                    });
                    return;
                }
                
                // brand has no items; delete and redirect
                Brand.findByIdAndRemove(req.body.brandid, (err) => {
                    if (err) {
                        return next(err);
                    }
                    
                    res.redirect('/brand');
                });
            } else {
                res.redirect(results.brand.url);
            }
        }
    );
}

exports.brand_update_get = (req, res, next) => {
    Brand.findById(req.params.id)
        .exec((err, brand) => {
            if (err) {
                return next(err);
            }
            // no results
            if (brand === null) {
                const err = new Error('Brand not found');
                err.status = 404;
                return next(err);
            }
            // success; render update form
            res.render('brand_form', {
                title: 'Update Brand',
                brand,
                update: true,
                errors: false,
                url: req.url,
            });
        });
}

exports.brand_update_post = [
    // validate and sanitize input values
    body('name', 'Brand name required')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('description', 'Brand description required')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('location', 'Brand loaction required')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    // process request after validation and sanitization
    (req, res, next) => {
        // extract validation errors
        const errors = validationResult(req);

        // create brand object with escaped/trimmed data and old ID
        const brand = new Brand({
            name: req.body.name,
            description: req.body.description,
            location: req.body.location,
            image: {
                name: req.file.originalname,
                size: req.file.size,
                data: req.file.buffer,
                contentType: req.file.mimetype
            },
            _id: req.params.id,
        });

        if (!errors.isEmpty()) {
            // there are errors; render form again with sanitized values/error message
            res.render('brand_form', {
                title: 'Update Brand',
                brand,
                update: true,
                errors: errors.array(),
                url: req.url,
            });
            return;
        }

        // data from form is valid; update document
        Brand.findByIdAndUpdate(req.params.id, brand, {}, (err, thebrand) => {
            if (err) {
                return next(err);
            }

            // successful; redirect to brand detail page
            res.redirect(brand.url);
        });
    }
]
