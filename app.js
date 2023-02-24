const express = require('express');
const bodyParser = require('body-parser');

 const date = require(__dirname + "/date.js");

const mongoose = require('mongoose');
const _ = require ('lodash');
const getDate = require('./date');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded( {extended: true}));
app.use(express.static("public"));


//to connect or port mongodb to to-do-listDB
mongoose.set('strictQuery',false);
mongoose.connect("mongodb://127.0.0.1:27017/listDB",{useNewUrlParser: true,  keepAlive: true, useUnifiedTopology: true});
//default schema
const itemSchema = {
    name: String
};

const Items = mongoose.model("item",itemSchema);

const item1 = new Items ({
    name: "Welcome to your todolist!"
});
const item2 = new Items ({
    name: "Hit the + button to add a new item."
});
const item3 = new Items ({
    name: "<--Hit this to delete an item."
});

const defaultItems=[item1,item2,item3];

const listSchema = {
    name: String,
    items: [itemSchema]
}

const List = mongoose.model("list",listSchema);

//to get current day
const Today = getDate();

app.get("/",function(req, res){
    
    Items.find({},function(err,foundItem){
        //check data inserted or not if it is then don`t inserted repeatedly
      
        if(defaultItems.length==0){ 
            Items.insertMany(defaultItems,function(err){
                if (err){
                    console.log(err);
                }
                else{
                    console.log("Default items saved successfully in todolistDB.");
                }
                });
                //if it is inserted then go back to root route
                res.redirect("/");
            }    
        else{
           
          res.render("list", {listOfitem: Today , newitemsList: foundItem});
        }         
      }); 
    
    

   

    // let day = date();

    // res.render("list",{listOfitem: day,newitemsList: Enter});
    // res.send();

});


// app.post("/work",function(req,res){
//     let work=req.body.enter;
//     workItem.push(work);

//     res.redirect("/work");
// })

app.post("/",function(req,res){
   
    const enterItem = req.body.enter;
    const listName = req.body.list;
    const item = new Items({
        name: enterItem
    });
    if (listName===Today){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name: listName},function(err,results){
            results.items.push(item);
            results.save();
            
            res.redirect("/"+ listName);
        });
    }

        
   
    // console.log(Enter); 
});

app.post("/delete",function(req,res){
    const ItemId= req.body.check;
    const listName= req.body.cblist;
    //const Today = getDate();
    if(listName=== Today ){
        Items.findByIdAndRemove(ItemId,function(err){
            if(err){
                console.log(err);
            }
            else {
                console.log("Item deleted sucessfully");
                res.redirect("/");
            }
            
        });
    }
    else{
        List.findOneAndUpdate({name: listName},{$pull: {items: { _id: ItemId}}},function(err,results){
            if(!err){
                res.redirect("/"+ listName);
            }
        });
    }
});


app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName},function(err,results){
        if(!err){
            if(!results){
                const item = new List({
                    name: customListName,
                    items: defaultItems
                    
                });
                item.save();
                res.redirect("/"+ customListName);
            }
            else{
                res.render("list",{listOfitem: customListName, newitemsList: results.items});
            }

        }
    });
    
});




app.listen(3000,function(){
    console.log("It is working");
})
