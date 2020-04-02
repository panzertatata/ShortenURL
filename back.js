var express = require('express');
var app = express();
var body = require('body-parser')
app.use(body())

//Check URL
function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    console.log(!!pattern.test(str));
    return !!pattern.test(str);
}

app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html')
})

app.post('/gen',function(req,res){
    console.log(req.body)
    if(validURL(req.body.URL)){
        //console.log("This is a URL")
        //Generate_URL
        targetURL = req.body.URL;
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < 12; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        //console.log("Storing a URL")
        //Store the URL
        var MongoClient = require('mongodb').MongoClient
        var url = "mongodb://localhost:27017/"
        MongoClient.connect(url, function(err, db) {
            if (err) throw err
            var dbo = db.db("Shorten_URL")
            console.log('connecting to mongo is complete')
            var data = {
                Long_URL: targetURL,
                Short_URL: result
            }
            dbo.collection('URL').insertOne(data,function(err,res){
                if (err) throw err
                console.log('insert ' + res.insertedCount + ' item(s)')
                db.close()
            })
        })   
    }
    else{
        console.log("This isn't a URL")
    }
})

// app.get('*',function(req,res){
//     const 
// })

app.listen(3000, function () {
    console.log('App listening on port 3000!');
})