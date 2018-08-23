const express=require('express');
const app=express();
const uuid=require('uuid');
const session=require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser=require('body-parser');
const passport=require('passport');
const LocalStrategy=require('passport-local').Strategy;
const axios=require('axios');
const bcrypt = require('bcrypt-nodejs');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(session({
    genid:(req)=>{
        console.log('session middleware');
        console.log(req.sessionID);
        return  uuid();
    },
    store: new FileStore(),
    secret:'mmurali',
    resave: false,
    saveUninitialized: true
}));
// configure passport.js to use the local strategy
passport.use(new LocalStrategy(
    { usernameField: 'email' },
    (email, password, done) => {
      console.log('Inside local strategy callback')
      axios.get(`http://localhost:5000/users?email=${email}`)
.then(res=>{
    const user = res.data[0]
    if (!user) {
      return done(null, false, { message: 'Invalid credentials.\n' });
    }
    if (!bcrypt.compareSync(password, user.password)) {
        return done(null, false, { message: 'Invalid credentials.\n' });
      }
    return done(null, user);
})
.catch(err=>console.log(err))
      // here is where you make a call to the database
      // to find the user based on their username or email address
      // for now, we'll just pretend we found that it was users[0]
      const user = users[0] 
      if(email === user.email && password === user.password) {
        console.log('Local strategy returned true')
        return done(null, user)
      }
    }
  ));

  // tell passport how to serialize the user
passport.serializeUser((user, done) => {
    console.log('Inside serializeUser callback. User id is save to the session file store here')
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    axios.get(`http://localhost:5000/users/${id}`)
    .then(res => done(null, res.data) )
    .catch(err=>done(err,false))
  });

  app.use(passport.initialize());
  app.use(passport.session());
const users=[
    {
        id:1,
        email:'murali@gmail.com',
        password:'test'
    }
];
app.get('/',(req,res)=>{
    const uniqueId=uuid();
    console.log('inside home request',req.sessionID);

    res.send(`welcome to the home page\n `);
})

app.get('/login',(req,res)=>{
    console.log(req.sessionID)
    res.send('login page');
})

app.post('/login',(req,res,next)=>{
    console.log('Inside POST /login callback')
    passport.authenticate('local', (err, user, info) => {
    //   console.log('Inside passport.authenticate() callback');
    //   console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`)
    //   console.log(`req.user: ${JSON.stringify(req.user)}`)
    //   req.login(user, (err) => {
    //     console.log('Inside req.login() callback')
    //     console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`)
    //     console.log(`req.user: ${JSON.stringify(req.user)}`)
    //     return res.send('You were authenticated & logged in!\n');
    //   })
    if(info) return res.send(info.message);
    if(err) return next(err);
    if(!user) return res.redirect('/login');
    req.login(user, (err) => {
        if (err) { return next(err); }
        return res.redirect('/authrequired');
      })
    })(req, res, next);
})
app.get('/authrequired', (req, res) => {
    // console.log('Inside GET /authrequired callback')
    // console.log(`User authenticated? ${req.isAuthenticated()}`)
    if(req.isAuthenticated()) {
      res.send('you hit the authentication endpoint\n')
    } else {
      res.redirect('/')
    }
  })
  
app.get('/logout',(req,res)=>{
   req.logOut();
   req.session = null;
   res.redirect('/');
})

app.listen(3002,()=>{
   
    console.log(`node server running on port 3002 `)
})