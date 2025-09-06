// import React, { useEffect, useState } from "react";
// import API from "../services/api";

// function DashboardSimple() {
//   const [stats, setStats] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const res = await API.get("/admin/stats-simple");
//         setStats(res.data);
//       } catch (err) {
//         console.error(err);
//         setError("Failed to load stats");
//       }
//     };
//     fetchStats();
//   }, []);

//   if (error) return <p style={{ color: "red" }}>{error}</p>;
//   if (!stats) return <p>Loading stats...</p>;

//   return (
//     <div style={{ padding: "30px" }}>
//       <h2>📊 Simple Admin Dashboard</h2>
//       <p><b>Total Users:</b> {stats.totalUsers}</p>
//       <p><b>Total Rooms:</b> {stats.totalRooms}</p>
//       <p><b>Total Bookings:</b> {stats.totalBookings}</p>
//     </div>
//   );
// }

// export default DashboardSimple;
