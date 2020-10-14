const express = require('express'),
    app = express(),
    port = 8000,
    mongoose = require('mongoose'),
    flash = require('express-flash'),
    session = require('express-session'),
    server = app.listen(port, console.log('Listening on port ${port}'));

app.use(express.static(__dirname+ '/static'));
app.use(express.urlencoded({extended: true}));

app.use(flash());
app.use(session({
    secret: 'max_ruben',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

mongoose.connect('mongodb://127.0.0.1/MessageBoard', {useNewUrlParser: true, useUnifiedTopology: true});

const CommentSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: [true, "Must enter a comment to submit"]
    },
    name: {
        type: String,
        required: [true, "you must enter a name"]
    }
}, {timestamps: true});

const MessageSchema = new mongoose.Schema({
    message: {
        type: String,
        required: [true, "Must enter a message"]
    },
    name: {
        type: String,
        required: [true, "you must enter a name"]
    },
    comments: [CommentSchema]
}, {timestamps: true});
const Message = mongoose.model('Message', MessageSchema);
const Comment = mongoose.model('Comment', CommentSchema);


app.get('/', (req, res) => {
    Message.find()
        .then(message => {
            res.render('index', {allMessages: message});
        })
        .catch(err => console.log(err));
})

app.post('/message', (req,res) => {
    Message.create(req.body)
        .then(message => {
            console.log(message);
            res.redirect('/');
        })
        .catch( err => {
            for( var key in err.errors){
                req.flash('createMessage', err.errors[key].message);
            }
            res.redirect('/');
        })
})

app.post('/comment/:id', (req,res) => {
    Comment.create(req.body)
        .then(comment => {
            Message.findOneAndUpdate({_id: req.params.id}, {$push:{comments: comment}})
                .then(result => {
                    console.log(result);
                    res.redirect('/');
                })
                .catch(err => console.log(err));
            
        })
        .catch( err => {
            for( var key in err.errors){
                req.flash('createComment', err.errors[key].message);
            }
            res.redirect('/');
        })
})