import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";

const FoodChart = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMenus = () => {
    axios.get("/api/v1/user/menu")
      .then(res => setMenus(res.data?.data || res.data?.message || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMenus(); }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="Manager" />
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="page-header flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div>
            <h1>Diet Chart</h1>
            <p>Manage patient meal plans</p>
          </div>
          <button onClick={() => navigate("/createfoodchart")} className="btn-primary">+ Add Diet Plan</button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading diet plans...</div>
        ) : menus.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-3">🍽️</div>
            <p className="text-slate-500">No diet plans yet. Add the first one.</p>
            <button onClick={() => navigate("/createfoodchart")} className="btn-primary mt-4">Create Diet Plan</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {menus.map(menu => (
              <div key={menu._id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-slate-800">Diet Plan</h3>
                  <span className="badge badge-green text-xs">Active</span>
                </div>
                <div className="space-y-3">
                  {[
                    { time: "🌅 Morning", meal: menu.morning, ingredients: menu.morningIngredients, img: menu.coverImage1 },
                    { time: "🌤️ Evening", meal: menu.evening, ingredients: menu.eveningIngredients, img: menu.coverImage2 },
                    { time: "🌙 Night", meal: menu.nightMeal, ingredients: menu.nightIngredients, img: menu.coverImage3 },
                  ].map(({ time, meal, ingredients, img }) => (
                    <div key={time} className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs font-semibold text-slate-500 mb-1">{time}</div>
                      <div className="font-medium text-sm capitalize">{meal}</div>
                      {ingredients && <div className="text-xs text-slate-400 mt-0.5">{ingredients}</div>}
                      {img && <img src={img} alt="" className="w-full h-20 object-cover rounded mt-2" />}
                    </div>
                  ))}
                  {menu.specialInstructions && (
                    <div className="text-xs text-amber-700 bg-amber-50 rounded p-2">
                      ⚠️ {menu.specialInstructions}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default FoodChart;
