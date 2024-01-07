import mongoose from "mongoose";

const url = process.env.MONGODB_URI;

await mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: function(val) {
        return /\d{2}\d?-\d+/.test(val)
      },
      message: props => `${props.value} is not a valid phone number`
    }
  }
});

personSchema.set("toJSON", {
  transform: function (doc, returnedObject) {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

export const Person = mongoose.model("Person", personSchema);
