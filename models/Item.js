const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    title: { type: String, required: true, maxLength: 100 },
    description: { type: String, required: true, minLength: 1 },
    productID: { type: Number, default: new Date().getTime(), required: true },
    brand: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
    category: [{ type: Schema.Types.ObjectId, ref: 'Category', required: true }],
    image: { data: Buffer, contentType: String, name: String, size: Number },
    protected: { type: Boolean, default: false }
});

// virtual item url
ItemSchema
    .virtual('url')
    .get(function() {
        return `/item/${this._id}`;
    });

module.exports = mongoose.model('Item', ItemSchema);
