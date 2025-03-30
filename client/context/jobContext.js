import React, { createContext, useContext, useEffect, useState } from "react";
import { useGlobalContext } from "./globalContext.js";
import axios from "axios";
import toast from "react-hot-toast";

const JobsContext = createContext();

axios.defaults.baseURL = "http://localhost:3001";
axios.defaults.withCredentials = true;

export const JobsContextProvider = ({ children }) => {
  //fetching the userProfile info first after fetching jobs and the userJobs
  const { userProfile } = useGlobalContext();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userJobs, setUserJobs] = useState([]);

  //getting jobs on the global app
  const getJobs = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/v1/jobs");
      setJobs(res.data);
    } catch (error) {
      console.log("Error getting jobs", error);
    } finally {
      setLoading(false);
    }
  };

  //creating job function on the global app
  const createJob = async (jobData) => {
    try {
      const res = await axios.post("/api/v1/jobs", jobData);

      toast.success("Job Created Successfully");

      //jobs are updated with the new job added in the top of the list
      setJobs((prevJobs) => [res.data, ...prevJobs]);

      //update user jobs too
      if (userProfile._id) {
        //jobs are updated with the new job added in the top of the list of jobs created
        //by this user
        setUserJobs((prevUserJobs) => [res.data, ...prevUserJobs]);
      }
    } catch (error) {
      console.log("Error creating a job", error);
    }
  };

  //getting job by user on the global app
  const getUserJobs = async (userId) => {
    setLoading(true);
    try {
      const res = await axios.get("/api/v1/jobs/user/" + userId);

      setUserJobs(res.data);
      setLoading(false);
    } catch (error) {
      console.log("Error getting user jobs", error);
    } finally {
      setLoading(false);
    }
  };

  //searching for job on global app
  const searchJobs = async (tags, location, title) => {
    setLoading(true);
    try {
      //we need to build a query string
      const query = URLSearchParams();
      if (tags) query.append("tags", tags); // exemple : search?tags=tags1?location=casa
      if (location) query.append("location", location);
      if (title) query.append("title", title);

      //send the request
      const res = await axios.get(`/api/v1/search?${query.toString()}`);

      //set jobs to the response data
      setJobs(res.data);
      setLoading(false);
    } catch (error) {
      console.log("Error while searching", error);
    } finally {
      setLoading(false);
    }
  };

  //get job by id
  const getJobById = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/v1/jobs/${id}`);
      setLoading(false);
      return res.data;
    } catch (error) {
      console.log("Error getting job by id", error);
    } finally {
      setLoading(false);
    }
  };
  //like a job
  const likeJob = async (jobId) => {
    try {
      const res = axios.put(`/api/v1/jobs/like/${jobId}`);
      toast.success("Job liked successfully");
      //getting the jobs after liking
      getJobs();
    } catch (error) {
      console.log("Error liking job", error);
    }
  };

  //apply to a job
  const applyJob = async (jobId) => {
    try {
      const res = axios.put(`/api/v1/jobs/apply/${jobId}`);
      toast.success("Applied to job successfully");

      //getting the jobs after applying
      getJobs();
    } catch (error) {
      console.log("Error applying to the job", error);
      //obtain the error from the server response and put it to the front
      toast.error(error.response.data.message);
    }
  };

  //delete job
  const deleteJob = async (jobId) => {
    try {
      const res = axios.delete(`/api/v1/jobs/${jobId}`);
      toast.success("Job deleted Successfully");
      //after deleting the job we filter it from the jobs data
      setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
    } catch (error) {
      console.log("Erro while deleting job", error);
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    getJobs();
  }, []);

  useEffect(() => {
    if (userProfile._id) {
      getUserJobs(userProfile._id);
    }
  }, [userProfile]);

  console.log("search jobs", jobs);

  return (
    <JobsContext.Provider
    //this is the properties that we want to access on all entire our applications 
      value={{
        jobs,
        loading,
        createJob,
        userJobs,
        searchJobs,
        getJobById,
        likeJob,
        applyJob,
        deleteJob,
      }}
    >
      {children}
    </JobsContext.Provider>
  );
};

export const useJobsContext = () => {
  return useContext(JobsContext);
};
