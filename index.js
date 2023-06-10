require('dotenv').config()
const express=require('express')
const mongoose = require('mongoose');
const app=express()
express.json()
const methodOverride = require('method-override')
const cookieParser=require('cookie-parser')

const jwtAuth=require('./middlewares/login').jwtAuth
//custom middlewares



//middleware
app.use(express.static('public')); 
app.set('view-engine',"ejs")
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))
app.use(cookieParser())
//import routers
const loginRouter=require('./controllers/auth/login')
const registerRouter=require('./controllers/auth/register')
const couresRouter=require('./controllers/courses')
const lessonsRouter=require('./controllers/lessons')
const profileRouter=require('./controllers/profile')
const usersRouter=require('./controllers/users')
    
  
//database connection
const connectDB=async()=>{
  try{
    const con=await mongoose.connect(process.env.CONN)
    console.log(`connected to DB`);
  }catch(err){
    console.log('Error connecting to database')
    console.log(err)
    process.exit(1)
  }
}
//home page router
app.get('/',(req,res)=>{
  res.render('home.ejs')
})

app.use('/login',loginRouter)
app.use('/profile',profileRouter)
app.use('/register',registerRouter)
app.use('/courses',jwtAuth,couresRouter)
app.use('/lessons',jwtAuth,lessonsRouter)
app.use('/users',jwtAuth,usersRouter)
app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.send('Logout successful');
});

      
//running the sever
connectDB().then(()=>{
  app.listen(process.env.PORT||5000,()=>{
    console.log(`serve is running on port ${process.env.PORT}`)
    
  })
})  