const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemInstanceSchema = new Schema({
    size: { type: String, required: true, minLength: 1 },
    price: { type: String, required: true },
    in_stock: { type: Number, required: true, default: 1 },
    item: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    protected: { type: Boolean, default: false }
});

// virtual item instance url
ItemInstanceSchema
    .virtual('url')
    .get(function() {
        return `/iteminstance/${this._id}`;
    });

module.exports = mongoose.model('ItemInstance', ItemInstanceSchema);
