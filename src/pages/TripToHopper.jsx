import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import useAuth from "../hooks/useAuth"
import useCompany from "../hooks/useCompany"

export default function TripToHopper() {
  const { user } = useAuth()
  const { company } = useCompany(user)

  const [records, setRecords] = useState([])
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    trip_date: "",
    vehicle_vendor: "",
    vehicle_type: "tripper",
    vehicle_number: "",
    total_trips: "",
    brass_per_trip: "",
    quantity: "",
    unit_id: ""
  })

  const [editingId, setEditingId] = useState(null)

  // =============================
  // FETCH UNITS
  // =============================
  const fetchUnits = async () => {
    const { data, error } = await supabase
      .from("units")
      .select("id, name")
      .eq("company_id", company.companies.id)
      .is("deleted_at", null)

    if (error) console.log(error)
    else setUnits(data)
  }

  // =============================
  // FETCH RECORDS
  // =============================
  const fetchData = async () => {
    if (!company) return

    setLoading(true)

    const { data, error } = await supabase
      .from("trip_to_hopper")
      .select(`
        *,
        units ( id, name )
      `)
      .eq("company_id", company.companies.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })

    if (error) console.log(error)
    else setRecords(data)

    setLoading(false)
  }

  useEffect(() => {
    if (company) {
      fetchUnits()
      fetchData()
    }
  }, [company])

  // =============================
  // HANDLE CHANGE
  // =============================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  // =============================
  // SUBMIT
  // =============================
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!company) return alert("Company not loaded")

    const payload = {
      ...form,
      total_trips: Number(form.total_trips),
      brass_per_trip: Number(form.brass_per_trip),
      quantity: Number(form.quantity),
      company_id: company.companies.id
    }

    if (editingId) {
      const { error } = await supabase
        .from("trip_to_hopper")
        .update(payload)
        .eq("id", editingId)

      if (error) console.log(error)
      setEditingId(null)
    } else {
      const { error } = await supabase
        .from("trip_to_hopper")
        .insert([payload])

      if (error) console.log(error)
    }

    setForm({
      trip_date: "",
      vehicle_vendor: "",
      vehicle_type: "tripper",
      vehicle_number: "",
      total_trips: "",
      brass_per_trip: "",
      quantity: "",
      unit_id: ""
    })

    fetchData()
  }

  // =============================
  // EDIT
  // =============================
  const handleEdit = (item) => {
    setForm({
      trip_date: item.trip_date,
      vehicle_vendor: item.vehicle_vendor,
      vehicle_type: item.vehicle_type,
      vehicle_number: item.vehicle_number,
      total_trips: item.total_trips,
      brass_per_trip: item.brass_per_trip,
      quantity: item.quantity,
      unit_id: item.unit_id
    })

    setEditingId(item.id)
  }

  if (loading) return <p>Loading...</p>

  return (
    <div style={{ padding: 20 }}>
      <h2>{editingId ? "Edit Trip Entry" : "Add Trip Entry"}</h2>

      <form onSubmit={handleSubmit}>

        <input
          type="date"
          name="trip_date"
          value={form.trip_date}
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          type="text"
          name="vehicle_vendor"
          placeholder="Vehicle Vendor"
          value={form.vehicle_vendor}
          onChange={handleChange}
          required
        />
        <br /><br />

        <select
          name="vehicle_type"
          value={form.vehicle_type}
          onChange={handleChange}
        >
          <option value="tripper">tripper</option>
          <option value="tractor">tractor</option>
          <option value="pickup">pickup</option>
          <option value="two_wheeler">two_wheeler</option>
          <option value="jcb">jcb</option>
          <option value="drill_mc">drill_mc</option>
          <option value="excavator">excavator</option>
          <option value="other">other</option>
        </select>
        <br /><br />

        <input
          type="text"
          name="vehicle_number"
          placeholder="Vehicle Number"
          value={form.vehicle_number}
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          type="number"
          name="total_trips"
          placeholder="Total Trips"
          value={form.total_trips}
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          type="number"
          name="brass_per_trip"
          placeholder="Brass Per Trip"
          value={form.brass_per_trip}
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={form.quantity}
          onChange={handleChange}
          required
        />
        <br /><br />

        <select
          name="unit_id"
          value={form.unit_id}
          onChange={handleChange}
          required
        >
          <option value="">Select Unit</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <br /><br />

        <button type="submit">
          {editingId ? "Update" : "Add"}
        </button>

      </form>

      <h3>Trip List</h3>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Date</th>
            <th>Vendor</th>
            <th>Vehicle</th>
            <th>Trips</th>
            <th>Qty</th>
            <th>Unit</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td>{r.trip_date}</td>
              <td>{r.vehicle_vendor}</td>
              <td>{r.vehicle_type} ({r.vehicle_number})</td>
              <td>{r.total_trips}</td>
              <td>{r.quantity}</td>
              <td>{r.units?.name}</td>
              <td>
                <button onClick={() => handleEdit(r)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
