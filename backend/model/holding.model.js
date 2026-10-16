import mongoose from "mongoose";

const holdingSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    name: {
        type : String,
    },
    qty: {
        type : Number,
    },
    avg :{
        type : Number,
    },
    price : {
        type : Number,
    },
    net : {
        type : String,
    },
    day : {
        type : String,
    },
    isLoss: {
        type: Boolean,
        default: false,
    },
});


export const Holding = mongoose.model("Holding", holdingSchema);