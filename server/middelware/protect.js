
//function to check if the user is authenticated or not if yes we move to run the next function
const protect = (req,res,next) => {
 if(req.oidc.isAuthenticated()) {
    next();
 }else {
    res.status(401).json({message: "Unauthorized"});
 }
};

export default protect