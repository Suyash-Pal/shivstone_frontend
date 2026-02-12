import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import useCompany from "../hooks/useCompany";

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { company, loading: companyLoading } = useCompany(user);

  const [form, setForm] = useState({
    address: "",
    state: "",
    city: "",
    taluka: "",
  });
  const [editingId, setEditingId] = useState(null);

  // GET USER
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  // FETCH LOCATIONS
  useEffect(() => {
    if (company) fetchLocations();
  }, [company]);

  const fetchLocations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("new_location")
      .select("*")
      .eq("company_id", company.company_id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) console.log(error);
    else setLocations(data);
    setLoading(false);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!company) return;

    if (editingId) {
      await supabase.from("new_location").update(form).eq("id", editingId);
      setEditingId(null);
    } else {
      await supabase.from("new_location").insert([
        {
          ...form,
          company_id: company.company_id,
        },
      ]);
    }

    setForm({ address: "", state: "", city: "", taluka: "" });
    fetchLocations();
  };

  const handleEdit = (location) => {
    setForm({
      address: location.address,
      state: location.state,
      city: location.city,
      taluka: location.taluka,
    });
    setEditingId(location.id);
  };

  const handleDelete = async (id) => {
    await supabase.from("new_location").update({ deleted_at: new Date() }).eq("id", id);
    fetchLocations();
  };

  if (loading || companyLoading) return <p>Loading...</p>;

  return (
    <div className="employee-container">
      {/* Form Card */}
      <div className="form-card animate-slide-in">
        <h2>{editingId ? "Edit Location" : "Add Location"}</h2>
        <form onSubmit={handleSubmit} className="employee-form">
          <input type="text" name="address" placeholder="Address" value={form.address} onChange={handleChange} required />
          <input type="text" name="state" placeholder="State" value={form.state} onChange={handleChange} required />
          <input type="text" name="city" placeholder="City" value={form.city} onChange={handleChange} required />
          <input type="text" name="taluka" placeholder="Taluka" value={form.taluka} onChange={handleChange} required />
          <button type="submit">{editingId ? "Update Location" : "Add Location"}</button>
        </form>
      </div>

      {/* Table Card */}
      <div className="table-card animate-fade-in">
        <h3>Location List</h3>
        <div className="table-responsive">
          <table className="employee-table">
            <thead>
              <tr>
                <th>Address</th>
                <th>State</th>
                <th>City</th>
                <th>Taluka</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((loc, idx) => (
                <tr key={loc.id} className="table-row-animate" style={{ animationDelay: `${idx * 100}ms` }}>
                  <td>{loc.address}</td>
                  <td>{loc.state}</td>
                  <td>{loc.city}</td>
                  <td>{loc.taluka}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(loc)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(loc.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {locations.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "20px 0", color: "#64748b" }}>
                    No locations found.
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
