import express from "express";
import {
  applyJob,
  createJob,
  deleteJob,
  getJobById,
  getJobs,
  getJobsByUser,
  likeJob,
  searchJobs,
} from "../controllers/jobController.js";
import protect from "../middelware/protect.js";

const router = express.Router();
//protect is a midellware checking if the user is authenticated before passing to createJob function
router.post("/jobs", protect, createJob);
router.get("/jobs", getJobs);
router.get("/jobs/user/:id", protect, getJobsByUser);
router.get("/jobs/search", searchJobs);
//apply for a job
router.put("/jobs/apply/:id", protect, applyJob);
//like or unlike a job 
router.put("/jobs/like/:id", protect, likeJob);

//get job by id
router.get("/jobs/:id", protect , getJobById);

//delete a job
router.delete("/jobs/:id", protect, deleteJob);

export default router;
