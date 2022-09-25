const Item = require('../models/Item');
const ItemInstance = require('../models/ItemInstance');
const Brand = require('../models/Brand');
const Category = require('../models/Category');

const async = require('async');
const { body, validationResult } = require('express-validator')

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
            });
        });
}

exports.iteminstance_create_get = (req, res, next) => {
    res.send('xxx');
}

exports.iteminstance_create_post = (req, res, next) => {
    res.send('xxx');
}

exports.iteminstance_delete_get = (req, res, next) => {
    res.send('xxx');
}

exports.iteminstance_delete_post = (req, res, next) => {
    res.send('xxx');
}

exports.iteminstance_update_get = (req, res, next) => {
    res.send('xxx');
}

exports.iteminstance_update_post = (req, res, next) => {
    res.send('xxx');
}
