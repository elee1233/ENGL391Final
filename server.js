const http = require('http');
const express = require("express");  
const path = require("path");
const app = express(); 
const bodyParser = require("body-parser");
require('dotenv').config({path: path.resolve(__dirname, "credentialsDontPost/.env")})
const readline = require("readline");
const interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const publicPath = path.resolve(__dirname, "templates/");
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:false}));

const Difficulties = {
    Easy: 0,
    Medium: 1,
    Hard: 2
};
//const host = 443
//console.log(`Web server is running at http://localhost:${host}`)
const prompt = "Stop to shutdown the server: ";
interface.question(prompt, value => {if (value == "stop"){
  process.stdout.write("Shutting down the server\n");
  process.exit(0)
}})

const { MongoClient, ServerApiVersion } = require('mongodb');
const { mainModule } = require('process');

//may need to change the uri? 
const uri = "mongodb+srv://"+ process.env.MONGO_DB_USERNAME +":"+process.env.MONGO_DB_PASSWORD +"@cluster0.onz3j2r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


process.stdin.setEncoding("utf8");

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  
app.listen(process.env.PORT||3000);

app.get("/", (request, response) => { 
  response.render("index.ejs");
});

app.get("/searchPlants", (request, response) => {
  response.render("searchPlants.ejs");
});
app.post("/processSearch", async function (request, response) {
//collect info
  const obj = {
    minSize: {$lte: request.body.minSpace/1},
    difficulty: {$lte: Difficulties[request.body.Difficulty]}, 
    sunlight: request.body.sunlight
  }
  console.log(obj)
  //send info to database
  await client.connect();
  const findResult = client.db(process.env.MONGO_DB_NAME).collection(process.env.MONGO_COLLECTION).find(obj);
  const findResult1 = await findResult.toArray(); 
  toSend = "<table border = '1px'> <tr><th>Name</th> <th>Difficulty</th> <th>Space Needed (inches)</th> <th >Sowing</th> <th >Care </th> <th>Harvest</th><th >Food Recs</th></tr>";
  findResult1.forEach((curr)=>toSend += "<tr><td>"+ curr.name+"</td>"+"<td>"+ curr.difficulty+"</td>" + "<td>"+ curr.minSize+"</td>" +"<td>"+ curr.sowingInstructions+"</td>" + "<td>"+ curr.careInstructions+"</td>"  + "<td>"+ curr.harvestingInstructions+"</td>" + "<td>"+ curr.foodRecommendations+"</td>"+  "</tr>" )
  toSend += "</table>"
  const varSend = {
    content: toSend
  }
  if (findResult != null){
    response.render("processSearchPlants.ejs",varSend);
  }
  else{
    response.send("<p>No results found</p> <a href = '/'>Home</a>");
  }
})

app.get("/tips", (request, response) =>{
  response.render("tips.ejs");
});
app.get("/sources", (request, response) =>{
  response.render("sources.ejs");
})
app.get("/aboutus", (request, response)=>{
  const obj = {
    content :"<img src = 'https://drive.google.com/file/d/1ckBW1ehX0szkuknoEjaKhOntoQHhhxqd/view?usp=sharing' alt = 'flowers'></img>"};
  response.render("aboutUs.ejs",obj);
})