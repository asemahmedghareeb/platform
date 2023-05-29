const express=require('express')
const router = express.Router();
const User = require('../models/user');
const Course = require('../models/course');
router.get('/',async(req,res)=>{
    const Users=await User.find()
    console.log(Users)
  res.render('dashboards/usersDashboard.ejs',{users:Users})
})

router.delete('/:id',async(req,res)=>{
    const Users=await User.findByIdAndDelete(req.params.id)
    // console.log(Users)
    res.redirect('/users/')
})

 
router.post('/new',async(req,res)=>{
    const {name,password,email,role,course}=req.body

    const course2=await Course.findOne({title:course})
    
    console.log(course2)
    if(course2!==null){
        const user=new User({
            name:name,
            email:email,
            password:password, 
            role:role,
            courses:course,
            coursesId:course2.id
        })
        
          await user.save()
          console.log(user)
    }
    else 
        console.log('this course not found');

  res.redirect('/users/')
})




module.exports=router