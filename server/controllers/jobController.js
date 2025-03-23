import asyncHanlder from "express-async-handler";
import User from "../models/userModel.js";
import Job from "../models/JobModel.js";

export const createJob = asyncHanlder(async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.oidc.user.sub });
    const isAuth = req.oidc.isAuthenticated() || user.email;
    if (!isAuth) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      title,
      description,
      location,
      salary,
      jobType,
      tags,
      skills,
      salaryType,
      negotiable,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    if (!description) {
      return res.status(400).json({ message: "description is required" });
    }
    if (!location) {
      return res.status(400).json({ message: "location is required" });
    }
    if (!salary) {
      return res.status(400).json({ message: "salary is required" });
    }
    if (!jobType) {
      return res.status(400).json({ message: "jobType is required" });
    }
    if (!tags) {
      return res.status(400).json({ message: "tags are required" });
    }
    if (!skills) {
      return res.status(400).json({ message: "skills are required" });
    }

    const job = new Job({
      title,
      description,
      location,
      salary,
      jobType,
      tags,
      skills,
      salaryType,
      negotiable,
      createdBy: user._id,
    });

    await job.save();

    return res.status(201).json(job);
  } catch (error) {
    console.log("Error in createJob", error);
    return res.status(500).json({ message: "Server Error" });
  }
});

//get all jobs
export const getJobs = asyncHanlder(async (req, res) => {
  try {
    //getting for the cretor of the job  his id , name and profile picture
    const jobs = await Job.find({})
      .populate("createdBy", "name  profilePicture")
      .sort({ createdAt: -1 }); //sort by the latest job created
    return res.status(200).json(jobs);
  } catch (error) {
    console.log("Error creating the job", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//get jobs by user
export const getJobsByUser = asyncHanlder(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const jobs = await Job.find({ createdBy: user._id })
      .populate("createdBy", "name profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json(jobs);
  } catch (error) {
    console.log("Error in getting job by user", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//searching a job
export const searchJobs = asyncHanlder(async (req, res) => {
  try {
    //those variables coming from the req.query
    const { tags, title, location } = req.query;
    //creating a variable called query having an empty object

    let query = {};
    if (tags) {
      //$in (Array Matching)
      //Used to match any value inside an array.
      // If tags are provided, split them by ',' and search using $in
      query.tags = { $in: tags.split(",") };
    }

    if (location) {
      //"i" option makes it case-insensitive (e.g., "Engineer" matches "engineer").
      //Matches: "New York", "New Jersey", "newsroom"
      //regex Used for partial and case-insensitive searches.
      query.location = { $regex: location, $options: "i" };
    }
    if (title) {
      query.title = { $regex: title, $options: "i" };
    }

    const jobs = await Job.find(query).populate(
      "createdBy",
      "name profilePicture"
    );

    res.status(200).json(jobs);
  } catch (error) {
    console.log("Error in searchjobs", error);
    return res.status(500).json({ message: "Server Error" });
  }
});

//apply for a job
export const applyJob = asyncHanlder(async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    //finding the connected user who will apply to the job
    const user = await User.findOne({ auth0Id: req.oidc.user.sub });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //if the the user already applied for this job
    if (job.applicants.includes(user._id)) {
      return res.status(400).json({ message: "Already applied for this job" });
    }

    //pushing the user to the applicants variable
    job.applicants.push(user._id);
    //saving the job another time to see the applicants
    await job.save();

    return res.status(200).json(job);
  } catch (error) {
    console.log("Error while applying to the job", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//Like or Unlike a job
export const likeJob = asyncHanlder(async (req, res) => {
  try {
    //Fetches a job from MongoDB by its _id
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const user = await User.findOne({ auth0Id: req.oidc.user.sub });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isLiked = job.likes.includes(user._id);

    //if the job is already liked by the user he remove the like
    if (isLiked) {
      //like.equals(user._id) ensures we remove only the specific user's like.
      job.likes = job.likes.filter((like) => !like.equals(user._id));
    } else {
      //if no like is done by the user he can like the job
      job.likes.push(user._id);
    }

    await job.save();

    return res.status(200).json(job);
  } catch (error) {
    console.log("Error in likejob");
    return res.status(500).json({ message: "Server Error" });
  }
});

//get job by id
export const getJobById = asyncHanlder(async (req, res) => {
  try {
    //to correctly extract the ID.
    const { id } = req.params;

    const job = await Job.findById(id).populate("createdBy", "name profilePicture");

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json(job);
  } catch (error) {
    console.log("error getting the job", error);
    return res.status(500).json({ message: "Server Error" });
  }
});

//delete a job 

export const deleteJob = asyncHanlder(async(req,res)=> {

    try{
        const {id} = req.params;
    
        const job = await Job.findById(id);
        const user = await User.findOne({auth0Id:req.oidc.user.sub});
    
        if(!job) {
            return res.status(404).json({message:"No job found"});
        };
        if(!user) {
            return res.status(400).json({message:"Unauthorized"});
        };
    
        //deleting the job after being founded
        await job.deleteOne(
            {
                _id: id,
            }
        )
        return res.status(200).json({message:"The job is deleted"})
    
    }catch(error){
        console.log("Job not deleted",error)
        return res.status(500).json({message:"Internal server Error"})
    }
   
})
