"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ExpensesPage() {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [expenses, setExpenses] = useState<any[]>([]);

  async function loadExpenses() {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("created_at", { ascending: false });

    console.log("Load Expenses:", data);
    console.log("Load Expenses Error:", error);

    if (!error && data) {
      setExpenses(data);
    }
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  async function saveExpense() {
    try {
      const {
        data: property,
        error: propertyError,
      } = await supabase
        .from("properties")
        .select("*")
        .limit(1)
        .single();

      console.log("Property:", property);
      console.log("Property Error:", propertyError);

      if (propertyError || !property) {
        alert(
          "Property Error:\n" +
            JSON.stringify(propertyError, null, 2)
        );
        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from("expenses")
        .insert([
          {
            property_id: property.id,
            category,
            amount: Number(amount),
            expense_date: new Date()
              .toISOString()
              .split("T")[0],
          },
        ])
        .select();

      console.log("Expense Data:", data);
      console.log("Expense Error:", error);

      if (error) {
        alert(
          JSON.stringify(error, null, 2)
        );
        return;
      }

      alert("Expense Saved Successfully");

      setCategory("");
      setAmount("");

      await loadExpenses();

    } catch (err) {
      console.error(err);
      alert("Unexpected Error");
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Expenses
      </h1>

      <div className="flex flex-col gap-4 max-w-md">

        <input
          className="border p-2 rounded"
          placeholder="Category"
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
        />

        <input
          className="border p-2 rounded"
          placeholder="Amount"
          type="number"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value)
          }
        />

        <button
          onClick={saveExpense}
          className="bg-black text-white p-2 rounded"
        >
          Save Expense
        </button>

      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">
          Expense List
        </h2>

        <table className="border-collapse border w-full">

          <thead>
            <tr>
              <th className="border p-2">
                Category
              </th>

              <th className="border p-2">
                Amount
              </th>

              <th className="border p-2">
                Date
              </th>
            </tr>
          </thead>

          <tbody>

            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td className="border p-2">
                  {expense.category}
                </td>

                <td className="border p-2">
                  ₹{expense.amount}
                </td>

                <td className="border p-2">
                  {expense.expense_date}
                </td>
              </tr>
            ))}

          </tbody>

        </table>
      </div>
    </div>
  );
}