"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Property {
  id: string;
  name: string;
  address: string | null;
}

interface PropertySelectorProps {
  value: string;
  onChange: (propertyId: string) => void;
  includeAll?: boolean;
  label?: string;
  disabled?: boolean;
}

export default function PropertySelector({
  value,
  onChange,
  includeAll = false,
  label = "Property / Unit",
  disabled = false,
}: PropertySelectorProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  async function loadProperties() {
    setLoading(true);

    const { data, error } = await supabase
      .from("properties")
      .select("id, name, address")
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error("Error loading properties:", error);
      setProperties([]);
    } else {
      setProperties(data || []);
    }

    setLoading(false);
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        {label}
      </label>

      <select
        value={value}
        disabled={disabled || loading}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[#C8A96A]"
      >
        {includeAll && (
          <option value="all">
            All Units
          </option>
        )}

        {!includeAll && (
          <option value="">
            Select Property / Unit
          </option>
        )}

        {properties.map((property) => (
          <option
            key={property.id}
            value={property.id}
          >
            {property.name}
            {property.address
              ? ` — ${property.address}`
              : ""}
          </option>
        ))}
      </select>

      {loading && (
        <p className="text-xs text-muted-foreground">
          Loading properties...
        </p>
      )}
    </div>
  );
}