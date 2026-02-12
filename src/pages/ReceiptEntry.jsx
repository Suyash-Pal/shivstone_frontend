import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import useAuth from "../hooks/useAuth";
import useCompany from "../hooks/useCompany";

export default function ReceiptEntry() {
  const { user } = useAuth();
  const { company, loading: companyLoading } = useCompany(user);

  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    mode: "cash",
    from_account: "",
    deposit_account: "",
    receipt_date: "",
    amount_deposited: "",
    description: "",
  });

  const [editingId, setEditingId] = useState(null);

  // ===============================
  // FETCH RECEIPTS
  // ===============================
  const fetchReceipts = async () => {
    if (!company?.companies?.id) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("receipt_entry")
      .select("*")
      .eq("company_id", company.companies.id)
      .is("deleted_at", null)
      .order("receipt_date", { ascending: false });

    if (error) console.log(error);
    else setReceipts(data);

    setLoading(false);
  };

  useEffect(() => {
    if (company) fetchReceipts();
  }, [company]);

  // ===============================
  // HANDLE INPUT CHANGE
  // ===============================
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ===============================
  // HANDLE SUBMIT
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!company?.companies?.id) return alert("Company not loaded");

    if (editingId) {
      await supabase
        .from("receipt_entry")
        .update({
          mode: form.mode,
          from_account: form.from_account,
          deposit_account: form.deposit_account,
          receipt_date: form.receipt_date,
          amount_deposited: Number(form.amount_deposited),
          description: form.description,
        })
        .eq("id", editingId)
        .eq("company_id", company.companies.id);
      setEditingId(null);
    } else {
      await supabase
        .from("receipt_entry")
        .insert([{ ...form, amount_deposited: Number(form.amount_deposited), company_id: company.companies.id }]);
    }

    setForm({
      mode: "cash",
      from_account: "",
      deposit_account: "",
      receipt_date: "",
      amount_deposited: "",
      description: "",
    });

    fetchReceipts();
  };

  // ===============================
  // HANDLE EDIT
  // ===============================
  const handleEdit = (receipt) => {
    setForm({
      mode: receipt.mode,
      from_account: receipt.from_account,
      deposit_account: receipt.deposit_account,
      receipt_date: receipt.receipt_date,
      amount_deposited: receipt.amount_deposited,
      description: receipt.description,
    });
    setEditingId(receipt.id);
  };

  if (loading || companyLoading) return <p>Loading...</p>;

  return (
    <div className="employee-container">
      {/* Form Card */}
      <div className="form-card animate-slide-in">
        <h2>{editingId ? "Edit Receipt" : "Add Receipt"}</h2>
        <form onSubmit={handleSubmit} className="employee-form">

          <select name="mode" value={form.mode} onChange={handleChange}>
            <option value="cash">Cash</option>
            <option value="bank">Bank</option>
            <option value="cheque">Cheque</option>
          </select>

          <input type="text" name="from_account" placeholder="From Account" value={form.from_account} onChange={handleChange} required />
          <input type="text" name="deposit_account" placeholder="Deposit Account" value={form.deposit_account} onChange={handleChange} required />
          <input type="date" name="receipt_date" value={form.receipt_date} onChange={handleChange} required />
          <input type="number" name="amount_deposited" placeholder="Amount" value={form.amount_deposited} onChange={handleChange} required />
          <input type="text" name="description" placeholder="Description" value={form.description} onChange={handleChange} />

          <button type="submit">{editingId ? "Update Receipt" : "Add Receipt"}</button>
        </form>
      </div>

      {/* Table Card */}
      <div className="table-card animate-fade-in">
        <h3>Receipt List</h3>
        <div className="table-responsive">
          <table className="employee-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Mode</th>
                <th>From</th>
                <th>Deposit</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((r, idx) => (
                <tr key={r.id} className="table-row-animate" style={{ animationDelay: `${idx * 80}ms` }}>
                  <td>{r.receipt_date}</td>
                  <td>{r.mode}</td>
                  <td>{r.from_account}</td>
                  <td>{r.deposit_account}</td>
                  <td>{r.amount_deposited}</td>
                  <td>{r.description}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(r)}>Edit</button>
                  </td>
                </tr>
              ))}
              {receipts.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "20px 0", color: "#64748b" }}>
                    No receipts found.
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
