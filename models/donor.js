const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    contactDetails: {
        phone: {
            type: String,
            required: true
        },
    },
    mandatedByLaw: {
        type: Boolean,
        default: false
    },
    csrPolicy: {
        interest: {
            type: String,
            required: true
        }
    },
    annualCsrSpend: {
        total: {
            type: Number,
            required: true
        },
        drinkingWater: {
            type: Number,
            required: true
        }
    },
    unspentCsr: {
        type: Number,
        required: true
    },
    historyOfProgramsInDW: {
        type: Boolean,
        default: false
    },
    methodOfExecution: {
        type: String,
        enum: ['In-house', 'With Partners'],
        required: true
    },
    geographiesOfInterest: {
        type: [String],
        required: true
    }
});

module.exports = mongoose.model('Donor', donorSchema);
