import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const YogaWebpage = () => {
  const [poses, setPoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Function to fetch yoga poses from the API
    const fetchPoses = async () => {
      try {
        const response = await fetch("https://yoga-api-nzy4.onrender.com/v1/poses");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched data:", data);
        // If the API returns the array directly, use 'data'.
        // If the API returns an object like { message: [...] },
        // uncomment the next line and comment out the line after.
        // const posesArray = data.message ? data.message : data;
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
  }, []);

  // Display a loading message while fetching data
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          Loading yoga poses...
        </motion.div>
      </div>
    );
  }

  // Display an error message if the API request fails
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
        Yoga Poses
      </motion.h1>

      {poses.length === 0 ? (
        <motion.div
          className="text-center text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          No yoga poses found.
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
                src={pose.url_png}
                alt={pose.english_name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-bold">{pose.english_name}</h2>
                <p className="text-sm text-gray-500 italic">{pose.sanskrit_name}</p>
                <p className="mt-2 text-gray-700">{pose.pose_description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="px-2 py-1 bg-green-200 text-green-800 text-sm rounded">
                    {pose.level}
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

export default YogaWebpage;
