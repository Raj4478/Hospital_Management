import React, { useEffect, useState } from "react";
import StaffCard from "./StaffCard.jsx";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const DeliverMeals = () => {
  const navigate = useNavigate();

  const [apiData1, setApiData1] = useState(null);
  const [apiData2, setApiData2] = useState(null);

  const url1 = "/api/v1/user/pantrydetail";
  const url2 = "/api/v1/user/patientdata";
  const url3 = "/api/v1/user/updatestaff";
  const url4 = "/api/v1/user/assigndelivery";

  const fetchData = async () => {
    try {
      const fields = await fetch(url1);
      const data = await fields.json();
      setApiData1(data);
    } catch (error) {
      console.log("Api Error", error);
    }
  };

  const patientDetails = async () => {
    try {
      const fields = await fetch(url2);
      const data = await fields.json();
      setApiData2(data);
    } catch (error) {
      console.log("Api Error", error);
    }
  };

  const delivery = () => {
    if (!apiData1?.message?.length || !apiData2?.message?.length) return;

    let count = 0;
    apiData2.message.forEach((data) => {
      if (apiData1.message[count]?.deliveryStatus === "available") {
        apiData1.message[count].deliveryStatus = `Delivering food to ${data.patientName} at ${data.roomNumber}`;

        const updateStatus = {
          id: apiData1.message[count]._id,
          delivery: apiData1.message[count].deliveryStatus,
        };

        axios.post(url3, updateStatus)
          .then((res) => console.log("Updated Status:", res.data.message))
          .catch((err) => console.log(err));

        const assignDelivery = {
          staff: apiData1.message[count]._id,
          patient: apiData2.message[count]._id,
        };

        axios.post(url4, assignDelivery)
          .then((res) => {
            console.log("Assigned Delivery:", res.data.message);
            window.location.reload();
          })
          .catch((err) => console.log(err));

        count += 1;
      } else {
        count += 1;
      }
    });
  };

  const changeDelivery = () => {
    apiData1.message.forEach((staff) => {
      staff.deliveryStatus = "available";
      const resetStatus = {
        id: staff._id,
        delivery: staff.deliveryStatus,
      };

      axios.post(url3, resetStatus)
        .then((res) => console.log(res.data.message))
        .catch((err) => console.log(err));
    });

    setTimeout(() => window.location.reload(), 500);
  };

  useEffect(() => {
    fetchData();
    patientDetails();
  }, []);

  const spinTransition = {
    repeat: Infinity,
    ease: "linear",
    duration: 1.2,
  };

  return apiData1 ? (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-8 max-w-screen-xl mx-auto"
    >
      <h2 className="text-center font-bold text-3xl text-gray-700 font-new mb-6">
        Staff Detail
      </h2>

      {/* Top Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <button
          onClick={delivery}
          className="bg-amber-400 hover:bg-amber-500 text-white font-semibold py-2 px-6 rounded shadow transition duration-300"
        >
          🚚 Deliver Food
        </button>
        <button
          onClick={changeDelivery}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded shadow transition duration-300"
        >
          🔄 Reset Delivery Status
        </button>
        <button
          onClick={() => navigate("/createpantry")}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded shadow transition duration-300"
        >
          ➕ Add Pantry Staff
        </button>
      </div>

      {/* Staff Cards */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {apiData1.message.map((data, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <StaffCard
              contact={data.contactInfo}
              name={data.name}
              image={data.coverImage}
              status={data.deliveryStatus}
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  ) : (
    <div className="flex justify-center items-center min-h-screen">
      <motion.div
        className="w-14 h-14 border-4 border-gray-300 border-t-blue-500 rounded-full"
        animate={{ rotate: 360 }}
        transition={spinTransition}
      />
    </div>
  );
};

export default DeliverMeals;
