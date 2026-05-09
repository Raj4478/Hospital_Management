import React, { useEffect, useState } from "react";
import StaffCard from "./Pages/StaffCard";
import { motion } from "framer-motion";

const FetchStaffData = () => {
  const url = "/api/v1/user/pantrydetail";

  const styleContainer = {
    position: "relative",
    width: 50,
    height: 50
  };
  
  const styleSpan = {
    display: "block",
    width: 50,
    height: 50,
  
    border: "7px solid #eee",
    borderTop: "7px solid #2D3134",
    borderRadius: "50%",
    boxSizing: "border-box",
    position: "absolute",
    top: "",
    left: "50vw",
    justifyContent:"center"
  };
  
  const spinTransition = {
    repeat: Infinity,
    ease: "easeInOut",
    // width: ['100%', '50%'],
    duration: 1
  };
  

  const [apiData, setApiData] = useState(null);
  const fetchData = async () => {
    try {
      const fields = await fetch(url);
      const data = await fields.json();

      setApiData(data);
      console.log(data);
      
    } catch (error) {
      console.log("Api Error", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return apiData ? (
    <>
      <h2 className="text-center font-new text-2xl mb-4">Staff Detail</h2>
      { <div className="grid grid-cols-3">
        {apiData.message.map((data) => {
          return (
            <div className="">
              <StaffCard contact = {data.contactInfo} name = {data.name} image = {data.coverImage} status = {data.deliveryStatus} />
            </div>
          );
        })}
      </div> }
    </>
  ) : (
    <div className='flex justify-center my-40  items-center' style={styleContainer}>
  <motion.span className='flex  justify-center items-center' 
    style={styleSpan}
    animate={{ rotate: 360 }}
    transition={spinTransition}
  />
</div>
  );
};

export default FetchStaffData;
