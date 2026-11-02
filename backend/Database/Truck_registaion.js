const mongoose = require("mongoose");



const New_truck_schema = new mongoose.Schema({
    Truck_num: {
        type: String,
        required: true
    },
    Truck_brand: {
        type: String,
        required: true
    },
    Truck_model: {
        type: String,
        required: true
    },
    Manufacturing_year: {
        type: String,
        required: true
    },
    Owner_name: {
        type: String,
        required: true
    },
    Milage: {
        type: String,
        required: true
    },
    Driver_name: {
        type: String,
        required: true
    },
    DOB: {
        type: String,
        required: true
    },
    License_num: {
        type: String,
        required: true
    },
    License_expiry: {
        type: String,
        required: true
    }
})

let New_truck = mongoose.model("New_truck", New_truck_schema);

module.exports = New_truck;
