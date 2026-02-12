import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import useAuth from "../hooks/useAuth";
import useCompany from "../hooks/useCompany";

export default function Units() {
  const { user } = useAuth();
  const { company, loading: companyLoading } = useCompany(user);

  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ name: "" });
  const [editingId, setEditingId] = useState(null);

  // ===============================
  // FETCH UNITS
  // ===============================
  const fetchUnits = async () => {
    if (!company?.companies?.id) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("units")
      .select("*")
      .eq("company_id", company.companies.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) console.log(error);
    else setUnits(data);

    setLoading(false);
  };

  useEffect(() => {
    if (company) fetchUnits();
  }, [company]);

  // ===============================
  // HANDLE INPUT CHANGE
  // ===============================
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ===============================
  // HANDLE SUBMIT (ADD / EDIT)
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!company?.companies?.id) {
      alert("Company not loaded");
      return;
    }

    if (editingId) {
      await supabase
        .from("units")
        .update({ name: form.name })
        .eq("id", editingId)
        .eq("company_id", company.companies.id);
      setEditingId(null);
    } else {
      await supabase
        .from("units")
        .insert([{ name: form.name, company_id: company.companies.id }]);
    }

    setForm({ name: "" });
    fetchUnits();
  };

  // ===============================
  // HANDLE EDIT
  // ===============================
  const handleEdit = (unit) => {
    setForm({ name: unit.name });
    setEditingId(unit.id);
  };

  if (loading || companyLoading) return <p>Loading...</p>;

  return (
    <div className="employee-container">
      {/* Form Card */}
      <div className="form-card animate-slide-in">
        <h2>{editingId ? "Edit Unit" : "Add Unit"}</h2>
        <form onSubmit={handleSubmit} className="employee-form">
          <input
            type="text"
            name="name"
            placeholder="Unit Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <button type="submit">{editingId ? "Update Unit" : "Add Unit"}</button>
        </form>
      </div>

      {/* Table Card */}
      <div className="table-card animate-fade-in">
        <h3>Unit List</h3>
        <div className="table-responsive">
          <table className="employee-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit, idx) => (
                <tr
                  key={unit.id}
                  className="table-row-animate"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <td>{unit.name}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(unit)}>Edit</button>
                  </td>
                </tr>
              ))}
              {units.length === 0 && (
                <tr>
                  <td colSpan="2" style={{ textAlign: "center", padding: "20px 0", color: "#64748b" }}>
                    No units found.
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
