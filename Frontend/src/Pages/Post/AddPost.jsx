import React, { useState } from 'react'
import SetupAxiosInstances from '../../Components/Instances/SetupAxiosInstances';
import Navbar from '../../Components/Navbar/Navbar';
import { useNavigate } from 'react-router-dom';

function AddPost() {
  let [form,setForm] = useState({
    title:'',
    upload:'',
    desc:''
  })
  let navigate = useNavigate();
  const axiosInstances = SetupAxiosInstances(navigate);
  function handleChange(e){
    const {name,value} = e.target;
    setForm({...form,[name]:value});
  }
  async function handleSubmit(e){
    e.preventDefault();
    await axiosInstances.post('/user/add-post',form)
    .then((res)=>{
     if(res.data == 'Success'){
      alert("Post added Successfully.")
      navigate('/user/my-posts');
     }
    })
    .catch((e)=>{
      console.log("failed to add new post axios error: ",e);
    })
  }
  return (
    <>
     <Navbar/>
     <div className="flex justify-center">
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <h2 className="text-3xl mb-4">Add New Post</h2>
          <label htmlFor="title">Title: 
          <input type="text" name="title" placeholder="Title of the Post" value={form.title} onChange={handleChange} className="rounded-md border-gray-400 border p-2 mb-2 w-full" id='title'/>
          </label>
          <label htmlFor="img">Image Url: 
          <input type="text" name="upload" placeholder="Image of the Post" value={form.upload} onChange={handleChange} className="rounded-md border-gray-400 border p-2 mb-2 w-full" id='img'/>
          </label>
          <label htmlFor="desc">Description: 
          <input type="text" name="desc" placeholder="Description of the Post" value={form.desc} onChange={handleChange} className="rounded-md border-gray-400 border p-2 mb-2 w-full" id='desc' />
          </label>
        </div>
        <div>
          <button type="submit" className="bg-blue-500 text-white rounded-md px-4 py-2 w-full hover:bg-blue-600">Add Post</button>
        </div>      
        </form>
    </div>
    </>
  )
}

export default AddPost