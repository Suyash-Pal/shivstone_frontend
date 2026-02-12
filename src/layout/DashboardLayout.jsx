import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"

function DashboardLayout({ user, company }) {
  return (
    <div className="app-container">
      <Sidebar />

      <div className="main-content">
        <div className="top-bar">
          <div>
            <h2>{company.companies.name}</h2>
            <p>{user.email}</p>
          </div>
        </div>

        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
