import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import useAuth from "../hooks/useAuth";
import useCompany from "../hooks/useCompany";

export default function Mines() {
  const { user } = useAuth();
  const { company, loading: companyLoading } = useCompany(user);

  const [mines, setMines] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ name: "" });
  const [editingId, setEditingId] = useState(null);

  // ===============================
  // FETCH MINES
  // ===============================
  const fetchMines = async () => {
    if (!company?.companies?.id) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("mines")
      .select("*")
      .eq("company_id", company.companies.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) console.log(error);
    else setMines(data);

    setLoading(false);
  };

  useEffect(() => {
    if (company) fetchMines();
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
        .from("mines")
        .update({ name: form.name })
        .eq("id", editingId)
        .eq("company_id", company.companies.id);

      setEditingId(null);
    } else {
      await supabase
        .from("mines")
        .insert([{ name: form.name, company_id: company.companies.id }]);
    }

    setForm({ name: "" });
    fetchMines();
  };

  // ===============================
  // HANDLE EDIT
  // ===============================
  const handleEdit = (mine) => {
    setForm({ name: mine.name });
    setEditingId(mine.id);
  };

  // ===============================
  // HANDLE SOFT DELETE
  // ===============================
  const handleDelete = async (id) => {
    await supabase.from("mines").update({ deleted_at: new Date() }).eq("id", id);
    fetchMines();
  };

  if (loading || companyLoading) return <p>Loading...</p>;

  return (
    <div className="employee-container">
      {/* Form Card */}
      <div className="form-card animate-slide-in">
        <h2>{editingId ? "Edit Mine" : "Add Mine"}</h2>
        <form onSubmit={handleSubmit} className="employee-form">
          <input
            type="text"
            name="name"
            placeholder="Mine Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <button type="submit">{editingId ? "Update Mine" : "Add Mine"}</button>
        </form>
      </div>

      {/* Table Card */}
      <div className="table-card animate-fade-in">
        <h3>Mine List</h3>
        <div className="table-responsive">
          <table className="employee-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mines.map((mine, idx) => (
                <tr key={mine.id} className="table-row-animate" style={{ animationDelay: `${idx * 100}ms` }}>
                  <td>{mine.name}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(mine)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(mine.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {mines.length === 0 && (
                <tr>
                  <td colSpan="2" style={{ textAlign: "center", padding: "20px 0", color: "#64748b" }}>
                    No mines found.
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
