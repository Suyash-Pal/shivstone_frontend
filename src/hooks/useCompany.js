import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function useCompany(user) {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadCompany = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          role,
          company_id,
          companies (
            id,
            name,
            is_active
          )
        `)
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Company fetch error:", error);
      } else {
        if (!data?.companies) {
          console.error("No company linked to profile");
        } else if (!data.companies.is_active) {
          alert("Company is inactive");
        } else {
          setCompany(data);
        }
      }

      setLoading(false);
    };

    loadCompany();
  }, [user]);

  return { company, loading };
}
