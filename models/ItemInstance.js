const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemInstanceSchema = new Schema({
    size: { type: String, required: true, minLength: 1 },
    price: { type: Number, required: true },
    inStock: { type: Number, required: true },
    item: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
});

// virtual item instance url
ItemInstanceSchema
    .virtual('url')
    .get(function() {
        return `/iteminstance/${this._id}`;
    });

module.exports = mongoose.model('ItemInstance', ItemInstanceSchema);
