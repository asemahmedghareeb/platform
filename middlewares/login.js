const jwt=require('jsonwebtoken')
const User = require('../models/user');
function clearCookie(res){
res.clearCookie('token');
res.clearCookie('refreash');
}
 
exports.jwtAuth = async (req, res, next) => {
  const refreash = req.cookies.refreash;
  const token = req.cookies.token;
  if (refreash && token) {
    let userData;
    jwt.verify(token, process.env.MY_SECRET, (err, user) => {
      if (err) {
        clearCookie(res);
        next(err);
      } 
      userData=user;
    });
    
    jwt.verify(refreash, process.env.REFREASH, (err, user) => {
      if (err) {
        clearCookie(res);
        next(err);
      }
    });
    req.user = userData;
    next()
  } 
  else if (refreash) {
    //verifying refreash token
    jwt.verify(refreash, process.env.REFREASH, async (err, user) => {
      if (err) {
        clearCookie(res);
        next(err);
      } else {
        const u = await User.findById(user.id);
        let info;
        if(u){  
          info = {
            name: u.name,
            role: u.role,
            courses: u.courses,
          };
        }else{
          next()
        }
        //generating access token
        let accessToken = jwt.sign(info, process.env.MY_SECRET);

        res.cookie('token', accessToken, {
          httpOnly: true,
          expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
        });
        req.user = info;
        next();
      }
    });
  } else if (token) {
    jwt.verify(token, process.env.MY_SECRET, (err, user) => {
      if (err) {
        clearCookie(res);
        next(err);
      } else {
        req.user = user;
        next();
      }
    });
  } else {
    next();
  }
};

 
exports.checkuser=(req,res,next)=>{
    const token=req.cookies.token
    if(token){
      return next()
    }   
    return res.redirect('/login')
}



exports.adminOnly=(req, res, next) => {
    
  if(req.user.role==="admin")
  next();
  else{
    console.log("not allowed")
    res.redirect('/')
  }
}


exports.userOnly=(req, res, next)=> {
    
  if(req.user.role==="user")
  next();
  else{
    console.log("not allowed")
    res.redirect('/')
  }
}; 


exports.adminAndUser=(req,res,next)=>{
  if(req.user.role==="user"||req.user.role==="admin")
  next();
  else{
    console.log("not allowed")
    res.redirect('/')
  }
}