import { useEffect, useState } from "react"
import { Routes, Route, Navigate, useNavigate } from "react-router-dom"
import useAuth from "./hooks/useAuth"
import useCompany from "./hooks/useCompany"
import Login from "./pages/Login"
import DashboardLayout from "./layout/DashboardLayout"

import DashboardHome from "./pages/DashboardHome"
import Employees from "./pages/Employees"
import Vendors from "./pages/Vendors"
import Locations from "./pages/Locations"
import Mines from "./pages/Mines"
import Units from "./pages/Units"
import ReceiptEntry from "./pages/ReceiptEntry"
import PaymentEntry from "./pages/PaymentEntry"
import FuelIssued from "./pages/FuelIssued"
import TripToHopper from "./pages/TripToHopper"
import DrillEntry from "./pages/DrillEntry"
import EmployeeStatus from "./pages/EmployeeStatus"
import LoaderWorks from "./pages/LoaderWorks"

function App() {
  const { user, loading: authLoading } = useAuth()
  const { company, loading: companyLoading } = useCompany(user)
  const [fetching, setFetching] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let timer
    if (authLoading || companyLoading) {
      setFetching(true)

      // 3-minute timeout
      timer = setTimeout(() => {
        alert("Failed to fetch your data")
        navigate("/login") // redirect to login
      }, 180000) // 3 minutes
    } else {
      setFetching(false)
      clearTimeout(timer)
    }

    return () => clearTimeout(timer)
  }, [authLoading, companyLoading, navigate])

  // Loader screen
  if (authLoading || companyLoading || fetching)
    return (
      <div className="loader-container">
        <div className="loader-circle"></div>
        <div className="loader-message">
          Please wait, while we're trying to fetch your details !!
        </div>
      </div>
    )

  // If no user, show login
  if (!user) return <Login />

  // If no company after fetching, fallback to loader (will timeout)
  if (!company)
    return (
      <div className="loader-container">
        <div className="loader-circle"></div>
        <div className="loader-message">
          Please wait, while we're trying to fetch your details !!
        </div>
      </div>
    )

  // Main dashboard routes
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout user={user} company={company} />}>
        <Route index element={<DashboardHome />} />
        <Route path="employees" element={<Employees />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="locations" element={<Locations />} />
        <Route path="mines" element={<Mines />} />
        <Route path="units" element={<Units />} />
        <Route path="receipt-entry" element={<ReceiptEntry />} />
        <Route path="payment-entry" element={<PaymentEntry />} />
        <Route path="fuel-issued" element={<FuelIssued />} />
        <Route path="trip-to-hopper" element={<TripToHopper />} />
        <Route path="drill-entry" element={<DrillEntry />} />
        <Route path="employee-status" element={<EmployeeStatus />} />
        <Route path="loader-works" element={<LoaderWorks />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
