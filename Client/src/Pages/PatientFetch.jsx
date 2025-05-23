import React, { useEffect, useState } from "react";
import PatientCard from "./PatientCard";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
const AllPatientData = () => {
  const url = "/api/v1/user/patientdata";

  const [apiData, setApiData] = useState(null);

  const navigate = useNavigate()

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
  
  const fetchData = async () => {
    try {
      const fields = await fetch(url);
      const data = await fields.json();

      setApiData(data);
    } catch (error) {
      console.log("Api Error", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return apiData ? (
    <>
      <h2 className="text-center font-new text-2xl mb-4">Patient's Detail</h2>
      <div className=" flex justify-center ">
        <button className="border p-2 font-new text-sky-300 mt-4 rounded-md hover:bg-sky-300 hover:text-white duration-500" onClick={(()=>{navigate("/newPatient")})}>
          Add Patient
        </button>
      </div>
      <div className="grid grid-cols-3">
        {apiData.message.map((data) => {
          return (
            <div className="">
              <PatientCard
                key={data._id}
                name={data.patientName}
                allergies={data.allergies}
                age={data.age}
                bedNumber={data.bedNumber}
                disease={data.disease}
                patientid={data._id}
                image={data.coverImage}
              />
            </div>
          );
        })}
      </div>
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

export default AllPatientData;
