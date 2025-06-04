import axios from "axios";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import UserCard from "../components/UserCard";

const UserView = () => {
  const { userId } = useParams();
  // console.log(userId);

  // useEffect(() => {
  //     const fetchPublicUserInfo = async (userId) => {
  //         axios.get("http://localhost:5000/user/userPublic", {
  //             params: {
  //             id: Number.parseInt(userId, 10)

  //     }}, { withCredentials: true })
  //         .then(res => {
  //             console.log(res.data);
  //             setUserInfo(res.data);
  //         })
  //     }
  //     fetchPublicUserInfo(userId);
  // }, [userId])

  if (!userId) {
    console.log("No user info");
    return <div className="bg-zinc-900 w-full p-12"></div>;
  }
  // console.log(userId);
  return (
    <div className="bg-zinc-900 w-full text-white p-12">
      <UserCard userId={userId} />
    </div>
  );
};

export default UserView;
