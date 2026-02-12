import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import useCompany from "../hooks/useCompany";

export default function Employee() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const { company, loading: companyLoading } = useCompany(user);

  const [form, setForm] = useState({
    employee_name: "",
    day_salary: "",
    joining_date: "",
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (company) fetchEmployees();
  }, [company]);

  const fetchEmployees = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("employee")
      .select("*")
      .eq("company_id", company.company_id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) console.log(error);
    else setEmployees(data);

    setLoading(false);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!company) return;

    if (editingId) {
      const { error } = await supabase
        .from("employee")
        .update({
          employee_name: form.employee_name,
          day_salary: Number(form.day_salary),
          joining_date: form.joining_date,
        })
        .eq("id", editingId)
        .is("deleted_at", null);
      if (error) console.log(error);
      setEditingId(null);
    } else {
      const { error } = await supabase.from("employee").insert([
        {
          employee_name: form.employee_name,
          day_salary: Number(form.day_salary),
          joining_date: form.joining_date,
          company_id: company.company_id,
        },
      ]);
      if (error) console.log(error);
    }

    setForm({ employee_name: "", day_salary: "", joining_date: "" });
    fetchEmployees();
  };

  const handleEdit = (employee) => {
    setForm({
      employee_name: employee.employee_name,
      day_salary: employee.day_salary,
      joining_date: employee.joining_date,
    });
    setEditingId(employee.id);
  };

  const handleDelete = async (id) => {
    await supabase.from("employee").update({ deleted_at: new Date() }).eq("id", id);
    fetchEmployees();
  };

  if (loading || companyLoading) return <p>Loading...</p>;

  return (
    <div className="employee-container">
      {/* Animated Form Card */}
      <div className="form-card animate-slide-in">
        <h2>{editingId ? "Edit Employee" : "Add Employee"}</h2>
        <form onSubmit={handleSubmit} className="employee-form">
          <input
            type="text"
            name="employee_name"
            placeholder="Employee Name"
            value={form.employee_name}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="day_salary"
            placeholder="Day Salary"
            value={form.day_salary}
            onChange={handleChange}
            required
          />
          <input
            type="date"
            name="joining_date"
            value={form.joining_date}
            onChange={handleChange}
            required
          />
          <button type="submit">{editingId ? "Update Employee" : "Add Employee"}</button>
        </form>
      </div>

      {/* Animated Table Card */}
      <div className="table-card animate-fade-in">
        <h3>Employee List</h3>
        <div className="table-responsive">
          <table className="employee-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Salary</th>
                <th>Joining Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, idx) => (
                <tr key={emp.id} style={{ animationDelay: `${idx * 100}ms` }} className="table-row-animate">
                  <td>{emp.employee_name}</td>
                  <td>{emp.day_salary}</td>
                  <td>{emp.joining_date}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(emp)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(emp.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "20px 0", color: "#64748b" }}>
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
