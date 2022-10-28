//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://francis:fran123@atlascluster.rx8ptnl.mongodb.net/todolistDB");

const itemSchema ={
  name: String,
};

const Item = mongoose.model("Item", itemSchema); 

const eat = new Item({
  name: "Welcome to your todolist!"
});

const read = new Item({
  name: "Click + button to add item"
});

const dance = new Item({
  name: "<-- click this to delete>"
});

const defaultItems = [eat, read, dance];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItem){
    if(foundItem.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Insert success");
        }
      })
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItem});
    }
  });
});

app.post("/", function(req, res){

  const newItem = req.body.newItem;
  const listName = req.body.list;

  if(listName === "Today"){
    Item.insertMany({name: newItem}, function (err) {
      if(err){
        console.log(err);
      }else{
        console.log("New Item Added");
      }
      res.redirect("/");
    })
  }else{
    List.findOne({name: listName}, function(err, foundList){
      if(foundList){
        foundList.items.push({name: newItem});
        foundList.save();
        res.redirect("/" + listName);
      }else{
        console.log(err);
      }
    })
  }

});

app.post("/delete", function(req, res){
  const itemID = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(itemID, function(err){
      if(!err){
        console.log("Successfully remove from the list");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemID}}}, function(err, result){
      if(!err){
        res.redirect("/" + listName);
      }
    })
  }

  
});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/:page", function(req, res){
  const pageName = _.capitalize(req.params.page);

  List.findOne({name: pageName}, function(err, result){
    if(!err){
      if(!result){
        const list = new List({
          name: pageName,
          items: defaultItems
        });
      
        list.save();
        res.redirect("/"+ pageName);
      }else{
        res.render("list", {listTitle: result.name, newListItems: result.items});
      }
    }
    
  })

});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
};

app.listen(port, function() {
  console.log("Server has started");
});
