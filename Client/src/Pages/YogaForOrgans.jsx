import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const YogaPose = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { disease } = location.state || {}; // Retrieve the disease prop
  const [poses, setPoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Build the API URL using the disease value.
  const apiUrl = `https://yoga-api-nzy4.onrender.com/v1/poses?affectedOrgan=${disease ? disease.toLowerCase().trim() : ""}`;

  useEffect(() => {
    const fetchPoses = async () => {
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched Yoga Poses:", data);
        // Depending on the data structure, use the array directly or from a property
        const posesArray = Array.isArray(data) ? data : data.message;
        setPoses(posesArray);
      } catch (err) {
        console.error("Error fetching yoga poses:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPoses();
  }, [apiUrl]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          Loading yoga poses...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          {error}
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gray-100 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Return Button */}
      <div className="mb-6">
        <motion.button
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.05 }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          ← Return
        </motion.button>
      </div>

      <motion.h1 
        className="text-center text-4xl font-bold text-gray-800 mb-8"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Yoga Poses for {disease}
      </motion.h1>

      {poses.length === 0 ? (
        <motion.div 
          className="text-center text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          No yoga poses found for {disease}.
        </motion.div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
        >
          {poses.map((pose) => (
            <motion.div
              key={pose.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
              whileHover={{ scale: 1.02 }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={pose.image}
                alt={pose.english_name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-bold">{pose.english_name}</h2>
                <p className="text-sm text-gray-500 italic">{pose.sanskrit_name}</p>
                <p className="mt-2 text-gray-700">{pose.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="px-2 py-1 bg-green-200 text-green-800 text-sm rounded">
                    {pose.level}
                  </span>
                  <span className="px-2 py-1 bg-blue-200 text-blue-800 text-sm rounded">
                    {Array.isArray(pose.affectedOrgan)
                      ? pose.affectedOrgan.join(", ")
                      : "N/A"}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default YogaPose;
