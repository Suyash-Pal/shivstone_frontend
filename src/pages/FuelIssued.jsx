import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import useCompany from "../hooks/useCompany";
import useAuth from "../hooks/useAuth";

export default function FuelIssued() {
  const { user } = useAuth();
  const { company, loading: companyLoading } = useCompany(user);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    mine: "",
    vehicle_vendor: "",
    vehicle_type: "tripper",
    vehicle_number: "",
    fuel_type: "petrol",
    fuel_quantity: "",
  });

  const [editingId, setEditingId] = useState(null);

  const fetchData = async () => {
    if (!company?.companies?.id) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("fuel_issued")
      .select("*")
      .eq("company_id", company.companies.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) console.log(error);
    else setRecords(data);

    setLoading(false);
  };

  useEffect(() => {
    if (company) fetchData();
  }, [company]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!company?.companies?.id) return alert("Company not loaded");

    const payload = { ...form, fuel_quantity: Number(form.fuel_quantity) };

    if (editingId) {
      const { error } = await supabase
        .from("fuel_issued")
        .update(payload)
        .eq("id", editingId)
        .eq("company_id", company.companies.id);

      if (error) console.log(error);
      setEditingId(null);
    } else {
      const { error } = await supabase.from("fuel_issued").insert([
        { ...payload, company_id: company.companies.id },
      ]);

      if (error) console.log(error);
    }

    setForm({
      mine: "",
      vehicle_vendor: "",
      vehicle_type: "tripper",
      vehicle_number: "",
      fuel_type: "petrol",
      fuel_quantity: "",
    });

    fetchData();
  };

  const handleEdit = (item) => {
    setForm({
      mine: item.mine,
      vehicle_vendor: item.vehicle_vendor,
      vehicle_type: item.vehicle_type,
      vehicle_number: item.vehicle_number,
      fuel_type: item.fuel_type,
      fuel_quantity: item.fuel_quantity,
    });
    setEditingId(item.id);
  };

  if (loading || companyLoading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: "auto", fontFamily: "Arial, sans-serif" }}>
      {/* Form Section */}
      <div style={{ padding: 20, borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", marginBottom: 30, background: "#f9f9f9" }}>
        <h2 style={{ marginBottom: 15 }}>{editingId ? "Edit Fuel Entry" : "Add Fuel Entry"}</h2>
        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
          <input type="text" name="mine" placeholder="Mine" value={form.mine} onChange={handleChange} required />
          <input type="text" name="vehicle_vendor" placeholder="Vehicle Vendor" value={form.vehicle_vendor} onChange={handleChange} required />
          <select name="vehicle_type" value={form.vehicle_type} onChange={handleChange}>
            <option value="tripper">tripper</option>
            <option value="tractor">tractor</option>
            <option value="pickup">pickup</option>
            <option value="two_wheeler">two_wheeler</option>
            <option value="jcb">jcb</option>
            <option value="drill_mc">drill_mc</option>
            <option value="excavator">excavator</option>
            <option value="other">other</option>
          </select>
          <input type="text" name="vehicle_number" placeholder="Vehicle Number" value={form.vehicle_number} onChange={handleChange} required />
          <select name="fuel_type" value={form.fuel_type} onChange={handleChange}>
            <option value="petrol">petrol</option>
            <option value="diesel">diesel</option>
          </select>
          <input type="number" name="fuel_quantity" placeholder="Fuel Quantity" value={form.fuel_quantity} onChange={handleChange} required />
          <button type="submit" style={{ gridColumn: "1 / -1", padding: "10px 20px", borderRadius: 4, background: "#2563eb", color: "white", fontWeight: "bold", cursor: "pointer" }}>
            {editingId ? "Update" : "Add"}
          </button>
        </form>
      </div>

      {/* Table Section */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <thead style={{ background: "#2563eb", color: "#fff" }}>
            <tr>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>Mine</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>Vendor</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>Vehicle</th>
              <th style={{ padding: 12, textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>Fuel</th>
              <th style={{ padding: 12, textAlign: "right", borderBottom: "2px solid #e2e8f0" }}>Qty</th>
              <th style={{ padding: 12, textAlign: "center", borderBottom: "2px solid #e2e8f0" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: 20, textAlign: "center", color: "#64748b" }}>
                  No fuel records found.
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: 12 }}>{r.mine}</td>
                  <td style={{ padding: 12 }}>{r.vehicle_vendor}</td>
                  <td style={{ padding: 12 }}>{r.vehicle_type} ({r.vehicle_number})</td>
                  <td style={{ padding: 12 }}>{r.fuel_type}</td>
                  <td style={{ padding: 12, textAlign: "right" }}>{r.fuel_quantity}</td>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    <button onClick={() => handleEdit(r)} style={{ padding: "5px 10px", borderRadius: 4, background: "#facc15", border: "none", cursor: "pointer" }}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
