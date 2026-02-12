import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import useAuth from "../hooks/useAuth";
import useCompany from "../hooks/useCompany";

export default function PaymentEntry() {
  const { user } = useAuth();
  const { company, loading: companyLoading } = useCompany(user);

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    payment_group: "cash_to_bank",
    paid_from_account: "",
    paid_to_account: "",
    trans_date: "",
    amount_paid: "",
    description: "",
  });

  const [editingId, setEditingId] = useState(null);

  // ===============================
  // FETCH PAYMENTS
  // ===============================
  const fetchPayments = async () => {
    if (!company?.companies?.id) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("payment_entry")
      .select("*")
      .eq("company_id", company.companies.id)
      .is("deleted_at", null)
      .order("trans_date", { ascending: false });

    if (error) console.log(error);
    else setPayments(data);

    setLoading(false);
  };

  useEffect(() => {
    if (company) fetchPayments();
  }, [company]);

  // ===============================
  // HANDLE CHANGE
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
        .from("payment_entry")
        .update({
          ...form,
          amount_paid: Number(form.amount_paid),
          updated_at: new Date(),
        })
        .eq("id", editingId)
        .eq("company_id", company.companies.id);

      setEditingId(null);
    } else {
      await supabase.from("payment_entry").insert([
        {
          ...form,
          amount_paid: Number(form.amount_paid),
          company_id: company.companies.id,
        },
      ]);
    }

    setForm({
      payment_group: "cash_to_bank",
      paid_from_account: "",
      paid_to_account: "",
      trans_date: "",
      amount_paid: "",
      description: "",
    });

    fetchPayments();
  };

  // ===============================
  // HANDLE EDIT
  // ===============================
  const handleEdit = (payment) => {
    setForm({
      payment_group: payment.payment_group,
      paid_from_account: payment.paid_from_account,
      paid_to_account: payment.paid_to_account,
      trans_date: payment.trans_date,
      amount_paid: payment.amount_paid,
      description: payment.description,
    });
    setEditingId(payment.id);
  };

  if (companyLoading || loading) return <p>Loading...</p>;

  return (
    <div className="employee-container">
      {/* Form Card */}
      <div className="form-card animate-slide-in">
        <h2>{editingId ? "Edit Payment" : "Add Payment"}</h2>
        <form onSubmit={handleSubmit} className="employee-form">

          <select name="payment_group" value={form.payment_group} onChange={handleChange}>
            <option value="party">Party</option>
            <option value="cash_to_bank">Cash To Bank</option>
            <option value="employee">Employee</option>
            <option value="expense">Expense</option>
            <option value="investment">Investment</option>
          </select>

          <input type="text" name="paid_from_account" placeholder="Paid From Account" value={form.paid_from_account} onChange={handleChange} required />
          <input type="text" name="paid_to_account" placeholder="Paid To Account" value={form.paid_to_account} onChange={handleChange} required />
          <input type="date" name="trans_date" value={form.trans_date} onChange={handleChange} required />
          <input type="number" name="amount_paid" placeholder="Amount" value={form.amount_paid} onChange={handleChange} required />
          <input type="text" name="description" placeholder="Description" value={form.description} onChange={handleChange} />

          <button type="submit">{editingId ? "Update Payment" : "Add Payment"}</button>
        </form>
      </div>

      {/* Table Card */}
      <div className="table-card animate-fade-in">
        <h3>Payment List</h3>
        <div className="table-responsive">
          <table className="employee-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Group</th>
                <th>From</th>
                <th>To</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, idx) => (
                <tr key={p.id} className="table-row-animate" style={{ animationDelay: `${idx * 80}ms` }}>
                  <td>{p.trans_date}</td>
                  <td>{p.payment_group}</td>
                  <td>{p.paid_from_account}</td>
                  <td>{p.paid_to_account}</td>
                  <td>{p.amount_paid}</td>
                  <td>{p.description}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(p)}>Edit</button>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "20px 0", color: "#64748b" }}>
                    No payments found.
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
