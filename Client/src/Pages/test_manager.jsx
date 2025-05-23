import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const Manager = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userid = location.state?.userId;

  const [apiData1, setApiData1] = useState();

  const logout = async () => {
    try {
      const res = await axios.post("/api/v1/user/logout");
      console.log(res.data.message);
      navigate("/");
    } catch (err) {
      console.log(err.message);
    }
  };

  const managerDetail = async () => {
    try {
      const res = await axios.post("/api/v1/user/managerdata", {
        object_id: userid, // <-- correct format
      });
      setApiData1(res.data.message);
      console.log("API response:", res.data.message.coverImage);
    } catch (err) {
      console.error("API error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    if (userid) {
      managerDetail();
    }
  }, [userid]);

  return (
    <div className="min-h-screen bg-blue-50 px-4 py-6 font-sans">
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="flex justify-between items-center px-4 mb-8"
      >
        <h2 className="text-3xl font-bold text-blue-900">Hospital Management System</h2>
        <button
          onClick={logout}
          className="bg-white border border-blue-500 text-blue-800 px-4 py-2 rounded-lg shadow-md hover:bg-blue-100 transition duration-300 font-semibold flex items-center gap-2"
        >
          ⏎ Logout
        </button>
      </motion.div>

      {/* Manager Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="flex flex-col items-center mb-8"
      >
        <div className="bg-white rounded-xl shadow-md p-4 w-72 text-center">
          <img
            src={apiData1?.coverImage || "/manager-avatar.png"}
            alt="Manager"
            className="w-20 h-20 rounded-full mx-auto mb-2"
          />
          <h3 className="text-lg font-semibold text-blue-800">
            Welcome, {apiData1?.fullName || "Manager"}
          </h3>
        </div>
      </motion.div>

      {/* Functional Grid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto"
      >
        <div
          onClick={() => navigate("/allpatient")}
          className="bg-white hover:shadow-lg shadow transition-transform duration-300 hover:scale-105 cursor-pointer text-center rounded-2xl p-8"
        >
          <div className="text-4xl mb-4">👥</div>
          <h4 className="text-xl font-semibold text-gray-800">Patient Detail</h4>
        </div>

        <div
          onClick={() => navigate("/menu")}
          className="bg-white hover:shadow-lg shadow transition-transform duration-300 hover:scale-105 cursor-pointer text-center rounded-2xl p-8"
        >
          <div className="text-4xl mb-4">🍲</div>
          <h4 className="text-xl font-semibold text-gray-800">Diet Chart</h4>
        </div>

        <div
          onClick={() => navigate("/alldoctor")}
          className="bg-white hover:shadow-lg shadow transition-transform duration-300 hover:scale-105 cursor-pointer text-center rounded-2xl p-8"
        >
          <div className="text-4xl mb-4">👨‍⚕️</div>
          <h4 className="text-xl font-semibold text-gray-800">Doctors</h4>
        </div>

        <div
          onClick={() => navigate("/deliverMeals")}
          className="bg-white hover:shadow-lg shadow transition-transform duration-300 hover:scale-105 cursor-pointer text-center rounded-2xl p-8"
        >
          <div className="text-4xl mb-4">🔗</div>
          <h4 className="text-xl font-semibold text-gray-800">Meals Delivery</h4>
        </div>
      </motion.div>
    </div>
  );
};

export default Manager;
