import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PatientData from "./PatientData";
import { useDispatch } from "react-redux";
import { Objectid } from "../../store/detailProvider.js";
import { motion } from "framer-motion";

const PatientCard = ({
  name,
  age,
  allergies,
  bedNumber,
  disease,
  image,
  patientid,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const forward = (patientid) => {
    if (!patientid) return;
    dispatch(Objectid({ objectid: patientid }));
    navigate("/patient");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden m-4 p-4 cursor-pointer hover:scale-105 duration-300 text-center"
      onClick={() => forward(patientid)}
    >
      <div className="flex justify-center">
        <img
          src={image ? image : "/placeholder.png"}
          alt="Patient"
          className="rounded-xl object-cover h-48 w-full max-w-sm"
        />
      </div>

      <div className="text-center mt-4">
        <h2 className="text-3xl font-bold text-blue-800">
          {name}
        </h2>
      </div>

      <div className="mt-6 px-4 space-y-3 text-blue-900 font-semibold text-xl">
       
        <p>AGE: {age}</p>
        <p>DISEASE: {disease}</p>
        <p>ALLERGIES: {allergies}</p>
        <p>BEDNUMBER: {bedNumber}</p>
      </div>
    </motion.div>
  );
};

export default PatientCard;
