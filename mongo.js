import mongoose from "mongoose"

import { Person } from "./personModel.js";

if (process.argv.length < 3) {
    console.log("Provide db password as parameter");
    process.exit(1);
}

const password = process.argv[2];
const mongoUrl = `mongodb+srv://fullstack-user:${password}@cluster0.fzi5mkm.mongodb.net/notesApp?retryWrites=true&w=majority`

if (process.argv.length === 3) {
    showContacts()
} else if (process.argv.length === 5) {
    const name = process.argv[3];
    const phone = process.argv[4];
    saveContact(name, phone);
} else {
    console.log("Accepted parameters are (1) password, (2) person name, (3) phone number");
    process.exit(1)
}

async function showContacts() {
    await mongoose.connect(mongoUrl);

    try {
        const persons = await Person.find({})

        console.log("Phonebook:");
        persons.forEach(p => console.log(`${p.name} ${p.phone}`));
    } catch(error) {
        console.log("Something bad happened during persons retrieval", error);
    } finally {
        await mongoose.connection.close();
    }
}


async function saveContact(name, number) {
    await mongoose.connect(mongoUrl);

    try {
        const person = new Person({
            name: name,
            phone: number
        })


        const result = await person.save()
        console.log("Person saved", result);
    } catch(error) {
        console.log("Something bad happened during persons retrieval", error);
    } finally {
        await mongoose.connection.close();
    }
}