import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import useAuth from "../hooks/useAuth";
import useCompany from "../hooks/useCompany";

export default function Vendors() {
  const { user } = useAuth();
  const { company, loading: companyLoading } = useCompany(user);

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ name: "" });
  const [editingId, setEditingId] = useState(null);

  // FETCH VENDORS
  const fetchVendors = async () => {
    if (!company?.companies?.id) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("vendors")
      .select("*")
      .eq("company_id", company.companies.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) console.log(error);
    else setVendors(data);

    setLoading(false);
  };

  useEffect(() => {
    if (company) fetchVendors();
  }, [company]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!company?.companies?.id) {
      alert("Company not loaded");
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("vendors")
        .update({ name: form.name })
        .eq("id", editingId)
        .eq("company_id", company.companies.id);

      if (error) console.log(error);
      setEditingId(null);
    } else {
      const { error } = await supabase.from("vendors").insert([
        { name: form.name, company_id: company.companies.id },
      ]);
      if (error) console.log(error);
    }

    setForm({ name: "" });
    fetchVendors();
  };

  const handleEdit = (vendor) => {
    setForm({ name: vendor.name });
    setEditingId(vendor.id);
  };

  const handleDelete = async (id) => {
    await supabase.from("vendors").update({ deleted_at: new Date() }).eq("id", id);
    fetchVendors();
  };

  if (companyLoading || loading) return <p>Loading...</p>;

  return (
    <div className="employee-container">
      {/* Form Card */}
      <div className="form-card animate-slide-in">
        <h2>{editingId ? "Edit Vendor" : "Add Vendor"}</h2>
        <form onSubmit={handleSubmit} className="employee-form">
          <input
            type="text"
            name="name"
            placeholder="Vendor Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <button type="submit">{editingId ? "Update Vendor" : "Add Vendor"}</button>
        </form>
      </div>

      {/* Table Card */}
      <div className="table-card animate-fade-in">
        <h3>Vendor List</h3>
        <div className="table-responsive">
          <table className="employee-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor, idx) => (
                <tr key={vendor.id} className="table-row-animate" style={{ animationDelay: `${idx * 100}ms` }}>
                  <td>{vendor.name}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(vendor)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(vendor.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {vendors.length === 0 && (
                <tr>
                  <td colSpan="2" style={{ textAlign: "center", padding: "20px 0", color: "#64748b" }}>
                    No vendors found.
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
