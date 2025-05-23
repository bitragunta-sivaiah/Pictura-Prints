import mongoose from "mongoose";


export const connectDB = async() =>{
    try {
        console.log(process.env.MONGODB)
        await mongoose.connect(process.env.MONGODB)
        console.log('DataBase Running....')
    } catch (error) {
        console.log(error)
    }
}