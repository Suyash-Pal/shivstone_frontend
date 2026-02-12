import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import useAuth from "../hooks/useAuth"
import useCompany from "../hooks/useCompany"

export default function EmployeeStatus() {
  const { user } = useAuth()
  const { company } = useCompany(user)

  const [records, setRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [mines, setMines] = useState([])
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    mine_id: "",
    work_date: "",
    shift: "first_shift",
    employee_id: "",
    work_hours: "full_day"
  })

  const [editingId, setEditingId] = useState(null)

  // =============================
  // FETCH DROPDOWNS
  // =============================
  const fetchDropdowns = async () => {
    const { data: empData } = await supabase
      .from("employee")
      .select("id, employee_name")
      .eq("company_id", company.companies.id)
      .is("deleted_at", null)

    const { data: mineData } = await supabase
      .from("mines")
      .select("id, name")
      .eq("company_id", company.companies.id)
      .is("deleted_at", null)

    setEmployees(empData || [])
    setMines(mineData || [])
  }

  // =============================
  // FETCH DATA
  // =============================
  const fetchData = async () => {
    setLoading(true)

    const { data } = await supabase
      .from("current_employee_status")
      .select(`
        *,
        employee ( id, employee_name ),
        mines ( id, name )
      `)
      .eq("company_id", company.companies.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })

    setRecords(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (company) {
      fetchDropdowns()
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

    const payload = {
      ...form,
      company_id: company.companies.id
    }

    if (editingId) {
      await supabase
        .from("current_employee_status")
        .update(payload)
        .eq("id", editingId)

      setEditingId(null)
    } else {
      await supabase
        .from("current_employee_status")
        .insert([payload])
    }

    setForm({
      mine_id: "",
      work_date: "",
      shift: "first_shift",
      employee_id: "",
      work_hours: "full_day"
    })

    fetchData()
  }

  // =============================
  // EDIT
  // =============================
  const handleEdit = (item) => {
    setForm({
      mine_id: item.mine_id,
      work_date: item.work_date,
      shift: item.shift,
      employee_id: item.employee_id,
      work_hours: item.work_hours
    })

    setEditingId(item.id)
  }

  if (loading) return <p>Loading...</p>

  return (
    <div style={{ padding: 20 }}>
      <h2>{editingId ? "Edit Employee Status" : "Add Employee Status"}</h2>

      <form onSubmit={handleSubmit}>

        <select
          name="mine_id"
          value={form.mine_id}
          onChange={handleChange}
          required
        >
          <option value="">Select Mine</option>
          {mines.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <br /><br />

        <input
          type="date"
          name="work_date"
          value={form.work_date}
          onChange={handleChange}
          required
        />
        <br /><br />

        <select
          name="shift"
          value={form.shift}
          onChange={handleChange}
        >
          <option value="first_shift">first_shift</option>
          <option value="second_shift">second_shift</option>
          <option value="overtime">overtime</option>
        </select>
        <br /><br />

        <select
          name="employee_id"
          value={form.employee_id}
          onChange={handleChange}
          required
        >
          <option value="">Select Employee</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.employee_name}
            </option>
          ))}
        </select>
        <br /><br />

        <select
          name="work_hours"
          value={form.work_hours}
          onChange={handleChange}
        >
          <option value="full_day">full_day</option>
          <option value="half_day">half_day</option>
        </select>
        <br /><br />

        <button type="submit">
          {editingId ? "Update" : "Add"}
        </button>

      </form>

      <h3>Employee Status List</h3>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Date</th>
            <th>Mine</th>
            <th>Employee</th>
            <th>Shift</th>
            <th>Work Hours</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td>{r.work_date}</td>
              <td>{r.mines?.name}</td>
              <td>{r.employee?.employee_name}</td>
              <td>{r.shift}</td>
              <td>{r.work_hours}</td>
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
