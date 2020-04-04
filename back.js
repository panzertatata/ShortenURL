var express = require('express');
var app = express();
var body = require('body-parser');
var jwt = require('jsonwebtoken');
app.use(body())

const url = "mongodb://localhost:27017/"
const website = "localhost:3000/goto/"
const username_Admin = "admin"
const password_Admin = "root"

//Check URL
function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    console.log(!!pattern.test(str));
    return !!pattern.test(str);
}

//Check Token
function ensureToken(req, res, next) {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }
}

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html')
})

app.get('/admin', function (req, res) {
    res.sendFile(__dirname + '/admin.html')
})

app.post('/gen', function (req, res) {
    console.log(req.body)
    if (validURL(req.body.URL)) {
        //console.log('generating code')
        targetURL = req.body.URL;
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < 12; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        //console.log('Storing code')
        var MongoClient = require('mongodb').MongoClient
        MongoClient.connect(url, function (err, db) {
            if (err) throw err
            var dbo = db.db("Shorten_URL")
            console.log('connecting mongoDB is complete')
            var data = {
                Long_URL: targetURL,
                Short_URL: result
            }
            dbo.collection('URL').insertOne(data, function (err, res) {
                if (err) throw err
                console.log('insert ' + res.insertedCount + ' item(s)')
                db.close()
            })
        })
        res.json({
            message: website + result
        })
    } else {
        console.log("This isn't a URL")
        res.json({
            message: "Please enter URL"
        })
    }
})

app.get('/goto/:code', function (req, res) {
    var MongoClient = require('mongodb').MongoClient
    MongoClient.connect(url, function (err, db) {
        if (err) throw err
        var dbo = db.db("Shorten_URL")
        var query = {
            Short_URL: req.params.code
        }
        console.log(req.params.code)
        dbo.collection('URL').find(query).toArray(function (err, result) {
            if (err) throw err
            if (result === undefined || result.length == 0) {
                console.log('URL not found')
            } else {
                if (result[0].Long_URL[0] === 'h' && result[0].Long_URL[1] === 't' && result[0].Long_URL[2] === 't' && result[0].Long_URL[3] === 'p' && result[0].Long_URL[4] === 's') {
                    console.log(result[0].Long_URL)
                    res.redirect(result[0].Long_URL)
                } else {
                    console.log(result[0].Long_URL)
                    res.redirect('https://' + result[0].Long_URL)
                }
            }
        })
    })
})

app.post('/login', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    //console.log('user ='+req.body.username,' password ='+req.body.password)
    if (username == username_Admin && password == password_Admin) {
        const token = jwt.sign({
            data: 'URL'
        }, 'Using for admin only');
         console.log(token)
         res.json({
             message: 'Authenticated! Use this token in the "Authorization" header',
             token: token
        });
        res.redirect(website+'/statistic')
    } else {
        res.json({
            message: 'Incorrect username or password',
        });
    }
})

app.get('/statistic', ensureToken, (req, res) => {
    console.log('statistic')
    jwt.verify(req.token, 'Using for admin only', function (err, data) {
        if (err) {
            res.sendStatus(403);
        } else {
            res.json({});
        }
    });
})

app.listen(3000, function () {
    console.log('App listening on port 3000!');
})