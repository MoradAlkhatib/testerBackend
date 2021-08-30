const express = require("express");
const axios = require("axios");
require("dotenv").config();
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT;
const mongoose = require('mongoose');
const { response } = require("express");


//connected mongoDb 
mongoose.connect(process.env.REACT_APP_DB).then(response=>{
    console.log("MongoDb Connected");
}).catch(err=>{console.error('mongoDb Not Connected.....'+err);})

//mongoDb Schema
let UserSchema=mongoose.Schema({
   email:String,
   juiceName:String,
   juiceUrl:String,
   juiceDes:String
})

// mongoDb Model 
let UserModel=mongoose.model('Juice',UserSchema);




app.get("/", (req, res) => {
  res.send("Hello On Home");
});
// get All Juice 
app.get("/juice", (req, res) => {
  axios
    .get(
      `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=margarita`
    )
    .then((result) => {
      let juiceArr = result.data.drinks.map((item) => {
        return new Juice(item.strDrink, item.strDrinkThumb, item.strCategory);
      });

      res
        .json(juiceArr)

        
    }).catch((err) => {
        console.error(`Some Thing Happen In Juice Api...${err}`);
      });
});

// add to favorite
app.post("/add-fav",(req,res)=>{
    let test=new UserModel({
       email:req.body.email,
       juiceName:req.body.name,
       juiceUrl:req.body.url,
       juiceDes:req.body.des
    })
    res.send('Success Adding'+ test)
    test.save();

})

//get all favorite
app.get('/favorite/:email',(req,res)=>{
    let email=req.params.email;
    UserModel.find({email:email} , function(err , data){
        if(err){
            console.log(err)
        }
        else{
            res.json(data);
        }
    })

})

// delete from favorite
app.delete('/delete-fav/:id',(req,res)=>{
   let id=req.params.id;
    UserModel.findByIdAndDelete(id, function (err, docs) {
        if (err){
            console.log(err)
        }
        else{
          if(docs.length>0){
            console.log("Deleted : ", docs);
             res.send('Deleted Successfully')
          }
          else{
            res.send('Your Id is UnCorrect')
          }
            
        }
    });

})

// update juice data
app.put('/update-fav' ,(req,res)=>{
   let id=req.body.id;

   let newBody={
    juiceName:req.body.name,
    juiceUrl:req.body.url,
    juiceDes:req.body.des
   }
    UserModel.findByIdAndUpdate(id ,{$set:newBody},{new:true},(err,data)=>{
        if (err){
            console.log(err)
        }
        else{
            console.log("update : ", data);
             res.send({message:'update Successfully' ,data:data})
        }
    })

})

class Juice {
  constructor(name, image, description) {
    this.name = name;
    this.image = image;
    this.description = description;
  }
}

app.listen(port, () => {
  console.log(`On Port ${port}`);
});
