import mongoose from "mongoose";

const personSchema = new mongoose.Schema({
    name: String,
    phone: String
})

export const Person = mongoose.model("Person", personSchema);