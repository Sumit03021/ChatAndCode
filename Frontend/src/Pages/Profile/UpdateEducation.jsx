import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar/Navbar';
import SetupAxiosInstances from '../../Components/Instances/SetupAxiosInstances';
function UpdateEducation() {
  let [formdata,setFormData] = useState({
    school:{
      name:'',
      year:'',
      class:''
    },
    college:{
      name:'',
      year:'',
      class:''
    }
  })
  let navigate = useNavigate();
  const axiosInstances = SetupAxiosInstances(navigate);
  function handleChange(e){
    const {name,value} = e.target;
    if(name.startsWith('school.')){
      const schoolField = name.split('.')[1];
      setFormData({...formdata,school:{...formdata.school,[schoolField]:value}});
    }else if(name.startsWith('college.')){
      const collegeField = name.split('.')[1];
      setFormData({...formdata,college:{...formdata.college,[collegeField]:value}});
    }else{
      setFormData({...formdata,[name]:value});
    }
  }
  async function handleSubmit(e){
    e.preventDefault();
    await axiosInstances.put('/user/update-education',formdata)
    .then((res)=>{
      if(res.status == 200){
        navigate('/user/profile')
        alert("successfully updated the user's education.")
      }
    })
    .catch((e)=>{
      console.log("failed to update education axios error: ",e)
    })
  }

  return (
    <>
    <Navbar/>
    <div className="flex justify-center">
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <h2 className="text-3xl mb-4">Update Education</h2>
          <h2>School</h2>
          <label htmlFor="schoolname">School Name: 
          <input type="text" name="school.name" placeholder="School Name" value={formdata.school.name} onChange={handleChange} className="rounded-md border-gray-400 border p-2 mb-2 w-full" id='schoolname'/>
          </label>
          <label htmlFor="schoolyear">Year: 
          <input type="number" name="school.year" placeholder="Year of Passing" value={formdata.school.year} onChange={handleChange} className="rounded-md border-gray-400 border p-2 mb-2 w-full" id='schoolyear'/>
          </label>
          <label htmlFor="schoolclass">Class: 
          <input type="number" name="school.class" placeholder="Higher Schooling" value={formdata.school.class} onChange={handleChange} className="rounded-md border-gray-400 border p-2 mb-2 w-full" id='schoolclass' />
          </label>
          <h2>College</h2>
          <label htmlFor="collegename">College Name: 
          <input type="text" name="college.name" placeholder="College Name" value={formdata.college.name} onChange={handleChange} className="rounded-md border-gray-400 border p-2 mb-2 w-full" id='collegename'/>
          </label>
          <label htmlFor="collegeyear">Year: 
          <input type="number" name="college.year" placeholder="Year of Graduation" value={formdata.college.year} onChange={handleChange} className="rounded-md border-gray-400 border p-2 mb-2 w-full" id='collegeyear'/>
          </label>
          <label htmlFor="collegeclass">Field: 
          <input type="text" name="college.class" placeholder="Field" value={formdata.college.class} onChange={handleChange} className="rounded-md border-gray-400 border p-2 mb-2 w-full" id='collegeclass'/>
          </label>
        </div>
        <div>
          <button type="submit" className="bg-blue-500 text-white rounded-md px-4 py-2 w-full hover:bg-blue-600">Update Education</button>
        </div>      
        </form>
    </div>
    </>
    
  )
}

export default UpdateEducation