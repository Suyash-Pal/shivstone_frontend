import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import useAuth from "../hooks/useAuth";
import useCompany from "../hooks/useCompany";

export default function LoaderWorks() {
  const { user } = useAuth();
  const { company } = useCompany(user);

  const [loaderWorks, setLoaderWorks] = useState([]);
  const [vehicleVendor, setVehicleVendor] = useState("");
  const [vehicleType, setVehicleType] = useState("tripper");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [startReading, setStartReading] = useState("");
  const [endReading, setEndReading] = useState("");
  const [description, setDescription] = useState("");

  const fetchLoaderWorks = async () => {
    if (!company) return;

    const { data, error } = await supabase
      .from("loader_works")
      .select("*")
      .eq("company_id", company.company_id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
    } else {
      setLoaderWorks(data);
    }
  };

  useEffect(() => {
    fetchLoaderWorks();
  }, [company]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!company) return;

    const { error } = await supabase.from("loader_works").insert([
      {
        company_id: company.company_id,
        vehicle_vendor: vehicleVendor,
        vehicle_type: vehicleType,
        vehicle_number: vehicleNumber,
        start_reading: startReading,
        end_reading: endReading,
        description: description,
      },
    ]);

    if (error) {
      console.log(error);
    } else {
      setVehicleVendor("");
      setVehicleType("tripper");
      setVehicleNumber("");
      setStartReading("");
      setEndReading("");
      setDescription("");
      fetchLoaderWorks();
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from("loader_works")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.log(error);
    } else {
      fetchLoaderWorks();
    }
  };

  if (!company) return <p>Loading...</p>;

  return (
    <div>
      <h3>Loader Works</h3>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Vehicle Vendor"
          value={vehicleVendor}
          onChange={(e) => setVehicleVendor(e.target.value)}
          required
        />

        <select
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
        >
          <option value="tripper">Tripper</option>
          <option value="tractor">Tractor</option>
          <option value="pickup">Pickup</option>
          <option value="two_wheeler">Two Wheeler</option>
          <option value="jcb">JCB</option>
          <option value="drill_mc">Drill Machine</option>
          <option value="excavator">Excavator</option>
          <option value="other">Other</option>
        </select>

        <input
          type="text"
          placeholder="Vehicle Number"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
          required
        />

        <input
          type="datetime-local"
          value={startReading}
          onChange={(e) => setStartReading(e.target.value)}
          required
        />

        <input
          type="datetime-local"
          value={endReading}
          onChange={(e) => setEndReading(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button type="submit">Add Loader Work</button>
      </form>

      <hr />

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Type</th>
            <th>Vehicle No</th>
            <th>Start</th>
            <th>End</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {loaderWorks.map((item) => (
            <tr key={item.id}>
              <td>{item.vehicle_vendor}</td>
              <td>{item.vehicle_type}</td>
              <td>{item.vehicle_number}</td>
              <td>{item.start_reading}</td>
              <td>{item.end_reading}</td>
              <td>{item.description}</td>
              <td>
                <button onClick={() => handleDelete(item.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
