import React, { useEffect, useState } from 'react'
import Navbar from '../../Components/Navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import SetupAxiosInstances from '../../Components/Instances/SetupAxiosInstances';

function Notify() {
  let [data,setData] = useState([]);
  let navigate = useNavigate();
  const axiosInstances = SetupAxiosInstances(navigate);
  useEffect(()=>{
    getData();
  },[])
  async function getData(){
    await axiosInstances.get('/user/notifications')
    .then((res)=>{
     if(res.status == 200){
      setData(res.data);
     }
    })
    .catch((e)=>{
      console.log("failed to get notifications axios error: ",e);
    })
    }
    
  async function handleAccept(receiverId){
  await axiosInstances.post('/user/accept-request',{receiverId})
  .then((res)=>{
  if(res.data == 'Success'){
    alert("Friend request accepted successfully");
    getData();
  }else if(res.data == 'Already Exist'){
    alert("Already your friend in your Friendlist.")
  }
  })
  .catch((e)=>{
    console.log("failed to accept request axios error: ",e);
  })
  }

  async function handleReject(receiverId){
    await axiosInstances.post('/user/reject-request',{receiverId})
    .then((res)=>{
    if(res.data == 'Success'){
      alert("Friend request rejected successfully");
      getData();
    }
    })
    .catch((e)=>{
      console.log("failed to rejected request axios error: ",e);
    })
  }

  async function deleteNotification(id){
    await axiosInstances.delete(`/user/notification/${id}`)
    .then((res)=>{
      if(res.data == "Success"){
        alert("Successfully deleted Notification");
        getData();
      }
    })
    .catch((e)=>{
      console.log("failed to delete notification axios error: ",e);
    })
  }

  return (
    <>
    <Navbar/>
    <div>
    {
      data.map((item,index)=>{
        return(
          <div key={item._id} className='bg-gray-300 mt-2 py-2 px-4 rounded-md border-2 relative'>
            <button className='absolute bg-red-100 text-red-900 py-1 px-1 right-2 top-2 rounded-md' onClick={()=>deleteNotification(item._id)}>&#10060;</button>
            <h2>Name: {item.sender.firstName}</h2>
            <h2>last: {item.sender.lastName}</h2>
            <h2>User: {item.sender.userName}</h2>
            {item.status == 'sendRequest' ?(
              <>
            <button className='bg-green-300 text-green-900 rounded-md mt-2 py-2 px-4' onClick={()=>handleAccept(item.sender._id)}>Accept</button>
            <button className='bg-red-300 text-red-800 rounded-md mt-2 py-2 px-4' onClick={()=>handleReject(item.sender._id)}>Reject</button>
              </>
            ):(
              <>
              </>
            )}
          </div>
        )
      })
    }
    </div>
    </>
  )
}

export default Notify