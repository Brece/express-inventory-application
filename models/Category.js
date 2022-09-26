const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name: { type: String, required: true, maxLength: 100 },
    description: { type: String, required: true, minLength: 1 },
    item_count: { type: Number, default: 0, min: 0 }
});

// virtual category url
CategorySchema
    .virtual('url')
    .get(function() {
        return `/category/${this._id}`;
    });

module.exports = mongoose.model('Category', CategorySchema);
