import React from "react";
import { useNavigate } from "react-router-dom";


const FrontPage = () => {

    const navigate = useNavigate()

    return (
        <>
        <div className="grid border items-center h-screen grid-cols-2 ">
            <div className="flex  flex-col items-center">
  <button className="border p-2 text-xl border-black hover:text-white hover:bg-sky-400 duration-500 text-sky-400 font-new" onClick={(()=>(navigate("/login")))}>Manager Login</button>
            </div>

            <div className="flex flex-col items-center">
            <button className="border p-2 text-xl border-black hover:text-white hover:bg-sky-400 duration-500 text-sky-400 font-new" onClick={(()=>(navigate("/login")))}>Pantry Login</button>
            </div>
        </div>
        </>
    )
}


export default FrontPage