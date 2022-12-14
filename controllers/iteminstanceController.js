const Item = require('../models/Item');
const ItemInstance = require('../models/ItemInstance');

const { body, check, validationResult } = require('express-validator');

exports.iteminstance_detail = (req, res, next) => {
    // populate all nested references
    ItemInstance.findById(req.params.id)
        .populate({
            path: 'item',
            populate: {
                path: 'brand category'
            }
        })
        .exec((err, iteminstance) => {
            if (err) {
                return next(err);
            }

            // no results
            if (iteminstance === null) {
                const err = new Error('Product instance not found');
                err.status = 404;
                return next(err);
            }

            // successful; render
            res.render('iteminstance_detail', {
                title: iteminstance.item.title,
                description: iteminstance.item.description,
                productID: iteminstance.item.productID,
                brand: iteminstance.item.brand.name,
                categories: iteminstance.item.category,
                size: iteminstance.size,
                price: iteminstance.price,
                in_stock: iteminstance.in_stock,
                id: iteminstance._id,
                iteminstance,
                url: req.url,
            });
        });
}

exports.iteminstance_create_get = (req, res, next) => {
    Item.find({ _id: req.query.itemid })
        .exec((err, item) => {
            if (err) {
                return next(err);
            }

            res.render('iteminstance_form', {
                title: item[0].title,
                item: item[0],
                iteminstance: undefined,
                update: false,
                errors: false,
                url: req.url,
            });
        });
}

exports.iteminstance_create_post = [
    // validate and sanitized data
    body('size', 'Product size is required')
        .trim()
        .escape(),
    body('price', 'Product price is required')
        .trim()
        .escape(),
    body('in_stock')
        .escape()
        .isInt()
        .withMessage('In stock needs to be a type of "number"'),
    
    // process request after validation and sanitization
    (req, res, next) => {
        // ectract validation errors from request
        const errors = validationResult(req);

        // create iteminstance object 
        const iteminstance = new ItemInstance({
            size: req.body.size,
            price: req.body.price,
            in_stock: req.body.in_stock,
            item: req.body.itemid,
        });

        if (!errors.isEmpty()) {
            // there are errors; render form again with sanitized values and error messages
            Item.find({ _id: req.query.itemid })
                .exec((err, item) => {
                    if (err) {
                        return next(err);
                    }

                    res.render('iteminstance_form', {
                        title: item[0].title,
                        item: item[0],
                        iteminstance,
                        update: false,
                        errors: errors.array(),
                        url: req.url,
                    });
                });
            return;
        }

        // data from form is valid
        iteminstance.save((err) => {
            if (err) {
                return next(err);
            }
            // success
            res.redirect(iteminstance.url);
        });
    }
]

exports.iteminstance_delete_protected_post = [
    // validate and sanitize input value
    check('admin')
        .escape()
        .equals('admin123')
        .withMessage(`You don't have the permission`),
    (req, res, next) => {
        // extract validation errors
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const err = new Error(`Wrong password. You don't have permission`);
            err.status = 403;
            return next(err);
        }

        ItemInstance.findById(req.body.documentid)
            .populate('item')
            .exec((err, item_instance) => {
                if (err) {
                    return next(err);
                }

                // success; delete document
                ItemInstance.findByIdAndRemove(req.body.documentid, (err) => {
                    if (err) {
                        return next(err);
                    }
                    
                    res.redirect(item_instance.item.url);
                });
        });
    }
]

exports.iteminstance_delete_post = (req, res, next) => {
    ItemInstance.findById(req.body.documentid)
            .populate('item')
            .exec((err, item_instance) => {
                if (err) {
                    return next(err);
                }

                // security to protect private documents from HTML hacks
                if (!item_instance.protected) {
                    // success; delete document
                    ItemInstance.findByIdAndRemove(req.body.documentid, (err) => {
                        if (err) {
                            return next(err);
                        }
                        
                        res.redirect(item_instance.item.url);
                    });
                } else {
                    res.redirect(item_instance.url);
                }
        });
}

exports.iteminstance_update_get = (req, res, next) => {
    ItemInstance.findById(req.params.id)
        .populate('item')
        .exec((err, iteminstance) => {
            if (err) {
                return next(err);
            }

            // no results
            if (iteminstance === null) {
                const err = new Error('Product instance not found');
                err.status = 404;
                return next(err);
            }

            //success; render form
            res.render('iteminstance_form', {
                title: iteminstance.item.title,
                iteminstance,
                item: iteminstance.item,
                update: true,
                errors: false,
                url: req.url,
            });
        });
}

exports.iteminstance_update_post = [
    // validate and sanitized data
    body('size', 'Product size is required')
        .trim()
        .escape(),
    body('price', 'Product price is required')
        .trim()
        .escape(),
    body('in_stock')
        .escape()
        .isInt()
        .withMessage('In stock needs to be a type of "number"'),
    
    // process request after validation and sanitization
    (req, res, next) => {
        // extract validation errors
        const errors = validationResult(req);

        // create new instance object with sanitized values and old ID
        const iteminstance = new ItemInstance({
            size: req.body.size,
            price: req.body.price,
            in_stock: req.body.in_stock,
            item: req.body.itemid,
            _id: req.body.iteminstanceid
        });

        if (!errors.isEmpty()) {
            // there are errors; render form again with sanitized values and error messages
            Item.find({ _id: req.query.itemid })
                .exec((err, item) => {
                    if (err) {
                        return next(err);
                    }

                    res.render('iteminstance_form', {
                        title: item[0].title,
                        item: item[0],
                        iteminstance,
                        update: true,
                        errors: errors.array(),
                        url: req.url,
                    });
                });
            return;
        }

        // data from form is valid; update the document
        ItemInstance.findByIdAndUpdate(req.body.iteminstanceid, iteminstance, {}, (err) => {
            if (err) {
                return next(err);
            }

            // success; redirect to item instance detail page
            res.redirect(iteminstance.url);
        });
    }
]
