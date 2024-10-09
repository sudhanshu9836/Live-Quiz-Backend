const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Data = require('./seed')

const mongoUrl = "mongodb://localhost:27017/live-Quiz-data";


main()
 .then(()=>{
    console.log("connected to Db")
 }).catch((err)=>{
    console.log(err)
 });


 async function main(){
   await mongoose.connect(mongoUrl);
};

const initDb = async ()=>{
    await Quiz.deleteMany({});  
    await Quiz.insertMany(Data.sampleData)
    console.log("data was initialized")
    console.log(Data.sampleData);
 }
 
 initDb();