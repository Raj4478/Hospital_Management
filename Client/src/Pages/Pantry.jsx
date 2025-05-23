import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Pantry = () => {

  const navigate = useNavigate()

  const url = "/api/v1/user/logout"



  const logout = async() => {
    axios({ method: "post", url: url,})
    .then((res) => {
      console.log(res.data.message);
      navigate("/")
      
    })
    .catch((err) => console.log(err.message));
} 
  

  
  return (
    <>
      <h2 className=" flex justify-center font-new text-2xl">
        Hospital Management System
      </h2>
      <div className="py-8">
        <ul className="flex font-new text-xl justify-around">
          <li className="">
            {" "}
            <span>👤</span>Welcome Staff Member{" "}
          </li>
          <li onClick={(()=>(logout()))} className="border p-2 rounded-md hover:bg-sky-300 duration-500">
            Logout <span>➡️</span>
          </li>
        </ul>
      </div>
      <div className="grid grid-cols-2">

        <div className="grid grid-cols-1 bg-yellow-400 hover:scale-110 duration-300 m-4 border py-20">
          <div className="flex justify-center text-4xl">🍲</div>

          <h4 className="flex justify-center text-xl font-new">Diet Chart</h4>
        </div>
       
        <div className="grid grid-cols-1 bg-violet-400 border hover:scale-110 duration-300 m-4 py-20">
          <div className="flex justify-center text-4xl">🔗</div>

          <h4 className="flex justify-center text-xl font-new">
            Meals Delivery
          </h4>
        </div>
      </div>
    </>
  );
};

export default Pantry;
