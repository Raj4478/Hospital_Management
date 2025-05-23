import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaHeartbeat,
  FaDoorOpen,
  FaBed,
  FaCalendarAlt,
  FaPhone,
  FaUser,
  FaBan,
  FaHospital,
  FaVenusMars,
  FaLeaf
} from "react-icons/fa";

const PatientData = () => {
  const select = useSelector((state) => state.data.objectid);
  const navigate = useNavigate();

  const url1 = "/api/v1/user/particularpatientdata";
  const url2 = "/api/v1/user/delivery";
  const url3 = "/api/v1/user/deleteObject";
  const url4 = "/api/v1/user/updatestaff";

  const [apiData1, setApiData1] = useState(null);
  const [apiData2, setApiData2] = useState(null);

  let jsons = { object_id: select };

  const fetchData = async () => {
    if (!select) {
      console.error("No valid patient object_id provided.");
      return;
    }
    axios({
      method: "post",
      url: url1,
      data: jsons,
    })
      .then((res) => {
        setApiData1(res.data.message);
      })
      .catch((err) => console.log(err));
  };

  const deliverData = async () => {
    try {
      const fields = await fetch(url2);
      const data = await fields.json();
      setApiData2(data);
    } catch (error) {
      console.log("Api Error", error);
    }
  };

  const foodDelivered = () => {
    apiData2?.message?.forEach((data) => {
      if (data.patient._id === apiData1._id) {
        let jsons1 = { id: data._id };
        axios.post(url3, jsons1).then((res) => {
          console.log("data deleted", res.data.message);
        });

        let status = "available";
        let jsons = { id: data.staff._id, delivery: status };
        axios.post(url4, jsons).then((res) => {
          console.log("inside status change", res.data.message);
        });
      }
    });
  };

  useEffect(() => {
    if (select) {
      fetchData();
      deliverData();
    }
  }, [select]);

  if (!select) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        No patient details available. Please log in or select a patient.
      </div>
    );
  }

  return apiData1 ? (
    <motion.div
      className="min-h-screen bg-blue-50 flex flex-col items-center px-4 py-6 font-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex justify-center mb-4">
        <img
          src={apiData1.coverImage || "#"}
          className="h-40 w-40 object-cover rounded-full shadow-md"
          alt="patient"
        />
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mb-1">Patient Data</h1>
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        {apiData1.patientName}
      </h2>
      <span className="bg-gray-200 px-3 py-1 rounded-full text-sm font-medium mb-6">
        {apiData1.bloodGroup}
      </span>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left w-full max-w-5xl">
        <InfoCard icon={<FaHeartbeat />} label="Disease" value={apiData1.disease} />
        <InfoCard icon={<FaDoorOpen />} label="Room" value={apiData1.roomNumber} />
        <InfoCard icon={<FaBed />} label="Bed" value={apiData1.bedNumber} />
        <InfoCard icon={<FaHospital />} label="Floor" value={apiData1.floorNumber} />
        <InfoCard icon={<FaBan />} label="Allergies" value={apiData1.allergies} />
        <InfoCard icon={<FaCalendarAlt />} label="Age" value={apiData1.age} />
        <InfoCard icon={<FaVenusMars />} label="Gender" value={apiData1.gender} />
        <InfoCard icon={<FaPhone />} label="Contact" value={apiData1.contactinformation} />
        <InfoCard icon={<FaLeaf />} label="Organ Affected" value={apiData1.organAffected} />
      </div>

      <div className="flex justify-center mt-6 w-full max-w-5xl">
        <div className="grid grid-cols-2 gap-4 w-full">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() =>
              navigate("/yogaWebPage", { state: { disease: apiData1.disease } })
            }
            className="flex items-center justify-center gap-2 bg-blue-900 text-white p-4 rounded-lg shadow-md font-semibold"
          >
            <FaLeaf />
            Suitable Yoga
          </motion.button>

          <button
            onClick={foodDelivered}
            className="p-4 bg-white text-amber-500 hover:bg-amber-400 hover:text-white rounded-lg border border-amber-500 font-semibold shadow"
          >
            Food Delivered
          </button>
        </div>
      </div>
    </motion.div>
  ) : (
    <div className="text-center py-10 text-gray-500 text-lg">Processing...</div>
  );
};

const InfoCard = ({ icon, label, value }) => (
  <motion.div
    className="flex items-start gap-3 bg-white p-4 rounded-lg shadow hover:shadow-md border border-gray-200"
    whileHover={{ scale: 1.02 }}
  >
    <div className="text-xl text-blue-700">{icon}</div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-md font-semibold text-gray-800">{value || "N/A"}</p>
    </div>
  </motion.div>
);

export default PatientData;
