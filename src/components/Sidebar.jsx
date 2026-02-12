import { useState } from "react"
import { NavLink } from "react-router-dom"
import { 
  FiUsers, FiHome, FiTruck, FiMapPin, FiLayers, FiFileText, 
  FiCreditCard, FiDroplet, FiActivity, FiBarChart2, FiPower 
} from "react-icons/fi"
import { supabase } from "../lib/supabase" 

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      // Optionally, you can redirect to login page
      window.location.href = "/"
    } catch (error) {
      console.error("Logout failed:", error.message)
    }
  }
  const menuItems = [
  { name: "Dashboard", path: "/", icon: <FiHome /> },
  { name: "Employees", path: "/employees", icon: <FiUsers /> },
  { name: "Vendors", path: "/vendors", icon: <FiTruck /> },
  { name: "Locations", path: "/locations", icon: <FiMapPin /> },
  { name: "Mines", path: "/mines", icon: <FiLayers /> },
  { name: "Units", path: "/units", icon: <FiLayers /> },
  { name: "Receipt Entry", path: "/receipt-entry", icon: <FiFileText /> },
  { name: "Payment Entry", path: "/payment-entry", icon: <FiCreditCard /> },
  { name: "Fuel Issued", path: "/fuel-issued", icon: <FiDroplet /> },
  { name: "Trip To Hopper", path: "/trip-to-hopper", icon: <FiActivity /> }, // replaced
  { name: "Drill Entry", path: "/drill-entry", icon: <FiActivity /> },
  { name: "Employee Status", path: "/employee-status", icon: <FiBarChart2 /> },
  { name: "Loader Works", path: "/loader-works", icon: <FiActivity /> },
]


  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <h2 className="logo">{collapsed ? "ERP" : "ERP Panel"}</h2>
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? "→" : "←"}
        </button>
      </div>

      <nav>
        {menuItems.map(item => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => isActive ? "active menu-item" : "menu-item"}
          >
            <span className="icon">{item.icon}</span>
            {!collapsed && <span className="label">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

    <div className="sidebar-footer">
    <button className="logout-btn" onClick={handleLogout}>
      <FiPower />
      {!collapsed && <span>Logout</span>}
    </button>
    </div>
    </div>
  )
}

export default Sidebar
