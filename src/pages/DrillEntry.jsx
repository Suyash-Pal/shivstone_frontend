import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import useAuth from "../hooks/useAuth"
import useCompany from "../hooks/useCompany"

export default function DrillEntry() {
  const { user } = useAuth()
  const { company } = useCompany(user)

  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    drill_type: "tractor_drill",
    drill_item: "",
    cash_given: "",
    description: "",
    no_of_holes: "",
    quantity: "",
    drill_date: "",
    drill_vendor: "",
    vehicle_number: "",
    fuel_issued: "",
    fuel_type: "petrol"
  })

  const [editingId, setEditingId] = useState(null)

  // =============================
  // FETCH DATA
  // =============================
  const fetchData = async () => {
    if (!company) return

    setLoading(true)

    const { data, error } = await supabase
      .from("drill_entry")
      .select("*")
      .eq("company_id", company.companies.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })

    if (error) console.log(error)
    else setRecords(data)

    setLoading(false)
  }

  useEffect(() => {
    if (company) fetchData()
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
      cash_given: Number(form.cash_given),
      no_of_holes: Number(form.no_of_holes),
      quantity: Number(form.quantity),
      fuel_issued: Number(form.fuel_issued),
      company_id: company.companies.id
    }

    if (editingId) {
      const { error } = await supabase
        .from("drill_entry")
        .update(payload)
        .eq("id", editingId)

      if (error) console.log(error)
      setEditingId(null)
    } else {
      const { error } = await supabase
        .from("drill_entry")
        .insert([payload])

      if (error) console.log(error)
    }

    setForm({
      drill_type: "tractor_drill",
      drill_item: "",
      cash_given: "",
      description: "",
      no_of_holes: "",
      quantity: "",
      drill_date: "",
      drill_vendor: "",
      vehicle_number: "",
      fuel_issued: "",
      fuel_type: "petrol"
    })

    fetchData()
  }

  // =============================
  // EDIT
  // =============================
  const handleEdit = (item) => {
    setForm({
      drill_type: item.drill_type,
      drill_item: item.drill_item,
      cash_given: item.cash_given,
      description: item.description,
      no_of_holes: item.no_of_holes,
      quantity: item.quantity,
      drill_date: item.drill_date,
      drill_vendor: item.drill_vendor,
      vehicle_number: item.vehicle_number,
      fuel_issued: item.fuel_issued,
      fuel_type: item.fuel_type
    })

    setEditingId(item.id)
  }

  if (loading) return <p>Loading...</p>

  return (
    <div style={{ padding: 20 }}>
      <h2>{editingId ? "Edit Drill Entry" : "Add Drill Entry"}</h2>

      <form onSubmit={handleSubmit}>

        <select
          name="drill_type"
          value={form.drill_type}
          onChange={handleChange}
        >
          <option value="tractor_drill">tractor_drill</option>
          <option value="borewell_drill">borewell_drill</option>
        </select>
        <br /><br />

        <input
          type="text"
          name="drill_item"
          placeholder="Drill Item"
          value={form.drill_item}
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          type="number"
          name="cash_given"
          placeholder="Cash Given"
          value={form.cash_given}
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          type="number"
          name="no_of_holes"
          placeholder="No Of Holes"
          value={form.no_of_holes}
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

        <input
          type="date"
          name="drill_date"
          value={form.drill_date}
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          type="text"
          name="drill_vendor"
          placeholder="Drill Vendor"
          value={form.drill_vendor}
          onChange={handleChange}
          required
        />
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
          name="fuel_issued"
          placeholder="Fuel Issued"
          value={form.fuel_issued}
          onChange={handleChange}
          required
        />
        <br /><br />

        <select
          name="fuel_type"
          value={form.fuel_type}
          onChange={handleChange}
        >
          <option value="petrol">petrol</option>
          <option value="diesel">diesel</option>
        </select>
        <br /><br />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />
        <br /><br />

        <button type="submit">
          {editingId ? "Update" : "Add"}
        </button>

      </form>

      <h3>Drill Entry List</h3>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Vendor</th>
            <th>Vehicle</th>
            <th>Holes</th>
            <th>Qty</th>
            <th>Fuel</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td>{r.drill_date}</td>
              <td>{r.drill_type}</td>
              <td>{r.drill_vendor}</td>
              <td>{r.vehicle_number}</td>
              <td>{r.no_of_holes}</td>
              <td>{r.quantity}</td>
              <td>{r.fuel_issued} ({r.fuel_type})</td>
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
