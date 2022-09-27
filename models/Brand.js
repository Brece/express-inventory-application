const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BrandSchema = new Schema({
    name: { type: String, required: true, maxLength: 100 },
    description: { type: String, required: true, minLength: 1 },
    location: { type: String, required: true, minLength: 1 },
    image: { data: Buffer, contentType: String, name: String, size: Number },
    protected: { type: Boolean, default: false }
});

// virtual brand url
BrandSchema
    .virtual('url')
    .get(function() {
        return `/brand/${this._id}`;
    });

module.exports = mongoose.model('Brand', BrandSchema);
