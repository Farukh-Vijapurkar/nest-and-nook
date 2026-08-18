"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import { supabase } from "@/lib/supabase";

interface PropertySelectorProps {
  value: string;
  onChange: (value: string) => void;
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
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadProperties();
  }, []);

  async function loadProperties() {
    setLoading(true);

    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Error loading properties:",
        error
      );

      setLoading(false);
      return;
    }

    setProperties(data || []);

    setLoading(false);
  }

  return (
    <div className="w-full">

      {/* Label */}

      {label && (
        <label className="block text-sm font-semibold mb-2 text-white">
          {label}
        </label>
      )}

      {/* Select */}

      <div className="relative">

        <select
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          disabled={
            disabled ||
            loading
          }
          className="
            appearance-none
            w-full
            h-11
            rounded-xl
            border
            border-white/15
            bg-[#18181B]
            px-4
            pr-10
            text-sm
            font-medium
            text-white
            outline-none
            transition-all
            cursor-pointer

            hover:border-[#C6A664]/60

            focus:border-[#C6A664]
            focus:ring-2
            focus:ring-[#C6A664]/20

            disabled:opacity-50
            disabled:cursor-not-allowed

            [&>option]:bg-white
            [&>option]:text-[#0F0F10]
          "
        >

          {includeAll && (
            <option
              value="all"
              className="bg-white text-[#0F0F10]"
            >
              All Units
            </option>
          )}

          {properties.map(
            (property) => (
              <option
                key={property.id}
                value={property.id}
                className="bg-white text-[#0F0F10]"
              >
                {property.name}
              </option>
            )
          )}

        </select>

        {/* Dropdown Icon */}

        <ChevronDown
          size={17}
          className="
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            text-[#C6A664]
            pointer-events-none
          "
        />

      </div>

    </div>
  );
}