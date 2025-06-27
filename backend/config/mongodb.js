import mongoose from "mongoose";
import { UserModel, ClientModel, ProjectModel, TaskModel, InvoiceModel, ExpenseModel, TimeEntryModel } from '../models/index.js';

const connectDB = async () => {
    try {

        //mongoose.connection.on("connected", () => console.log("MongoDB connected"));

        await mongoose.connect(`${process.env.MONGODB_URI}/freelancer`);
        console.log("MongoDB connected");
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

export default connectDB;