const express = require('express');
const User = require('../Models/UserModel');
const Chat = require('../Models/ChatModel');
const router = express.Router();
const Notification = require('../Models/Notification');
const {authenticateToken} = require('../middleware');

router.get('/friends',authenticateToken,async(req,res)=>{
let userId = req.user.userId;
try{
  let user = await User.findById(userId);
  let friendsUser = user.friend;
  let suggested = await User.find({_id:{$nin:[userId,...friendsUser]}}).select('firstName lastName userName email');
  res.status(200).json(suggested);
}
catch(e){
  console.log("failed to fetch friends list error: ",e);
  res.status(500).json("Internal Error");
}
})

router.get('/friend-list',authenticateToken,async(req,res)=>{
  let userId = req.user.userId;
  try{
    let user = await User.findById(userId).select('firstName lastName userName email').populate({path:'friend',select:'firstName lastName userName email'});
    let friends = user.friend;
    res.status(200).json(friends);
  }
  catch(e){
    console.log("failed to load friends list: ",e);
    res.status(500).json("Internal Error");
  }
})
router.get('/friend-request',authenticateToken,async(req,res)=>{
  let userId = req.user.userId;
  try{
  let receiver = await User.findById(userId,'firstName lastName').populate({path:'friendRequest.from',select:'firstName lastName userName email'});
  res.status(200).json(receiver);
  }
  catch(e){
    console.log("error in fetch all request List: ",e);
    res.status(500).json("Internal Error");
  }
})

router.post('/send-request',authenticateToken,async(req,res)=>{
let userId = req.user.userId;
let {receiverId} = req.body;
try{
let sender = await User.findById(userId);
if(!sender){
  return res.status(404).json("Sender User Not Found");
}
let receiver = await User.findById(receiverId)
if(!receiver){
  return res.status(404).json("Receiver User Not Found");
}
let existRequest = await receiver.friendRequest.find(req => req.from == userId && req.status == 'pending');
if(existRequest){
  return res.status(200).json("Already Sent");
}
let existFriend = await User.findOne({_id:userId,friend:receiverId});
if(existFriend){
  return res.status(200).json("Already Friend");
}
await User.findByIdAndUpdate(receiverId,{$push:{friendRequest:{from:userId}}});
let notification = new Notification({
  receiver:receiverId,
  sender:userId,
  message: " sent you a Friend Request.",
  status:"sendRequest"
})
await notification.save();
await User.findByIdAndUpdate(receiverId,{$push:{notification:notification._id}});
res.status(200).json("Success");
}
catch(e){
  console.log("Failed to send friend request error: ",e);
  res.status(500).json("Internal Error");
}
})

router.post('/accept-request',authenticateToken,async(req,res)=>{
let userId = req.user.userId;
let {receiverId} = req.body;
try{
  let sender = await User.findById(userId);
  let receiver = await User.findById(receiverId);
  if(!receiver){
    return res.status(404).json("Receiver Not Found");
  }
  let senderFriend = await User.findOne({_id:userId ,friend:receiverId});
  if(senderFriend){
    return res.status(200).json("Already Exist");
  }
  let receiverFriend = await User.findOne({_id:receiverId ,friend:userId});
  if(receiverFriend){
    return res.status(200).json("Already Exist");
  }
  sender.friend.push(receiverId);
  await sender.save();
  receiver.friend.push(userId);
  await receiver.save();
  let chat = await Chat.findOne({$or:[{source:userId,target:{$all:[userId,receiverId]},isGroupChat:false},{source:receiverId,target:{$all:[userId,receiverId]},isGroupChat:false}]});
  if(chat == null){
    chat = new Chat({source:userId,target:[receiverId,userId]});
    await chat.save();
    sender.chats.push(chat._id);
    receiver.chats.push(chat._id);
    await sender.save();
    await receiver.save();
  }
  await User.findByIdAndUpdate(userId,{$pull:{friendRequest:{from:receiverId}}});
  let oldNotification = await Notification.findOne({
    receiver: userId,
    sender: receiverId,
    status: "sendRequest"
  });
  await User.findByIdAndUpdate(userId,{$pull:{notification:oldNotification._id}});
  await Notification.findByIdAndDelete(oldNotification._id);

  let notification = new Notification({
    receiver:receiverId,
    sender:userId,
    message:" accepted your Friend Request.",
    status:"acceptRequest"
  })
  await notification.save();
  await User.findByIdAndUpdate(receiverId,{$push:{notification:notification._id}});
  res.status(200).json("Success");
}
catch(e){
  console.log("Failed to accept friend request error: ",e);
  res.status(500).json("Internal Error");
}
})

router.post('/reject-request',authenticateToken,async(req,res)=>{
let userId = req.user.userId;
let {receiverId} = req.body;
try{
  let sender = await User.findById(userId);
  let receiver = await User.findById(receiverId);
  if(!receiver){
    return res.status(404).json("Receiver Not Found");
  }
  await User.findByIdAndUpdate(userId,{$pull:{friendRequest:{from:receiverId}}});
  let oldNotification = await Notification.findOne({
    receiver: userId,
    sender: receiverId,
    status: "sendRequest"
  });
  await User.findByIdAndUpdate(userId,{$pull:{notification:oldNotification._id}});
  await Notification.findByIdAndDelete(oldNotification._id);

  let notification = new Notification({
    receiver:receiverId,
    sender:userId,
    message:" rejected your Friend Request.",
    status:"rejectRequest"
  })
  await notification.save();
  await User.findByIdAndUpdate(receiverId,{$push:{notification:notification._id}});
  res.status(200).json("Success");
}
catch(e){
  console.log("Failed to reject friend request error: ",e);
  res.status(500).json("Internal Error");
}
})

module.exports = router;