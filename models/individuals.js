const mongoose = require("mongoose");

const individualSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        required:true
    }
})

const Individual = mongoose.model("Individual",individualSchema);

module.exports = Individual;