import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Objectid } from "../../store/detailProvider.js";
import { motion } from "framer-motion";

const StaffCard = ({ name, status, image, contact, staffid }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const forward = (patientid) => {
    dispatch(Objectid({ objectid: patientid }));
    navigate("/patient");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <motion.div
        onClick={() => forward(patientid)}
        whileHover={{ scale: 1.03 }}
        className="bg-white shadow-md rounded-2xl overflow-hidden max-w-sm w-full border transition-all duration-300 cursor-pointer"
      >
        <h2 className="text-center text-2xl font-bold text-black py-4 border-b">STAFF DETAIL</h2>

        <div className="w-full">
          <img
            src={image ? image : "/placeholder.png"}
            alt="Staff"
            className="w-full h-64 object-cover"
          />
        </div>

        <div className="px-6 py-4 text-black space-y-4 font-semibold text-lg">
          <div>
            <span className="block">NAME:</span>
            <span className="block text-xl">{name || "Not Provided"}</span>
          </div>
          <div>
            <span className="block">PHONE:</span>
            <span className="block text-xl">{contact || "N/A"}</span>
          </div>
          <hr />
          <div>
            <span className="block">STATUS:</span>
            <span className="block text-xl text-green-600">{status || "Unknown"}</span>
          </div>
          <hr />
          <div>
            <span className="block">SPECIAL INSTRUCTION:</span>
            <span className="block text-lg text-gray-700 italic">
              No added sugar; avoid
            </span>
          </div>
        </div>
      </motion.div>

      {/* Return Button */}
      <motion.button
        onClick={() => navigate(-1)}
        whileHover={{ scale: 1.05 }}
        className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        ← Return
      </motion.button>
    </div>
  );
};

export default StaffCard;
