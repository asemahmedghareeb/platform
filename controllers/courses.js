const express=require('express')
const router = express.Router();
const Course = require('../models/course');
const Lesson = require('../models/lesson');
require('dotenv').config()
const stripe=require('stripe')(process.env.STRIPE_KEY)
router.use(express.static('public')); 
const {checkuser,adminOnly,userOnly}=require('../middlewares/midddlewares')
router.get('/',async(req,res)=>{
  const courses=await Course.find()
  res.render('courses.ejs',{courses:courses})
})

router.use(checkuser) 

router.get("/create-checkout-session/:id",userOnly, async (req, res) => {
  let course=await Course.findById(req.params.id)

  let userCourses=req.user.courses
  console.log(userCourses)
  
  
  try { 
    if(userCourses.includes(course.title)){
      console.log(bug)
       throw new Error()
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
         { 
          price_data: {
            currency: "usd",
            product_data: {
              name:course.title,
            },
            unit_amount: course.price,
          },
          quantity: 1,
        }
      ], 
        success_url:`http://localhost:8080/users/newCourse/${req.params
      .id}`,
        cancel_url: 'http://localhost:8080/courses',
      })
    res.json({ url: session.url })
  } catch (e) {
    
    res.status(500).json({ error: e.message })
  }
})

router.get('/',async(req,res)=>{
  const courses=await Course.find()
  res.render('courses.ejs',{courses:courses})
})

router.use(adminOnly);
router.get('/dashboard',async(req,res)=>{
  try{
    const courses=await Course.find()
    res.render('dashboards/coursesDashboard.ejs',{courses:courses})
  }catch(err){
    res.send({error:err})
  }
 
})
 
router.delete('/delete/:id',async(req,res)=>{
  try{

    await Course.findByIdAndDelete(req.params.id)
    let lessons =await Lesson.deleteMany({course:req.params.id})
  }catch(err){
    res.send({error:err})
    
  }
  res.redirect('/courses/dashboard')
    
})  

    
router.get('/update/:id',async(req,res)=>{
  try{
    const course=await Course.findById(req.params.id)
    res.render('updatecourse.ejs',{course:course})

  }catch(err){
    res.send({error:err})
  }
})
  

router.put('/update/:id',async(req,res)=>{
  try{

    const course=await Course.findById(req.params.id)
    course.title=req.body.title
    course.description=req.body.description
    course.price=req.body.price
    await course.save()
     
  }catch(err){
    res.send({error:err})
  }
  res.redirect('/courses/dashboard') 
})
    
  
router.post('/new',async(req,res)=>{
  try{

    const course= new Course({
      title:req.body.title,
      description:req.body.description,
      price:(req.body.price)*100
    })
    await course.save()

  }catch(err){
    res.send({error:err})
  }
    res.redirect('/courses/dashboard') 
})
module.exports=router       
