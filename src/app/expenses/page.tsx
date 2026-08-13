"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import PropertySelector from "@/components/PropertySelector";

export default function ExpensesPage() {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [selectedPropertyId, setSelectedPropertyId] =
    useState("");

  const [properties, setProperties] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingProperties, setLoadingProperties] =
    useState(true);

  /*
   * Load properties and expenses
   */
  useEffect(() => {
    void loadProperties();
    void loadExpenses();
  }, []);

  /*
   * Load all properties / units
   */
  async function loadProperties() {
    setLoadingProperties(true);

    const {
      data,
      error,
    } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", {
        ascending: true,
      });

    console.log(
      "Properties:",
      data
    );

    console.log(
      "Properties Error:",
      error
    );

    if (error) {
      console.error(
        "Error loading properties:",
        error
      );

      alert(
        "Unable to load properties:\n" +
          error.message
      );

      setLoadingProperties(false);
      return;
    }

    const propertyList = data || [];

    setProperties(propertyList);

    /*
     * Automatically select the first
     * property if nothing is selected.
     */
    if (
      propertyList.length > 0 &&
      !selectedPropertyId
    ) {
      setSelectedPropertyId(
        propertyList[0].id
      );
    }

    setLoadingProperties(false);
  }

  /*
   * Load expenses.
   *
   * We also load the related property
   * so the unit name can be displayed.
   */
  async function loadExpenses() {
    const {
      data,
      error,
    } = await supabase
      .from("expenses")
      .select(`
        *,
        property:properties (
          id,
          name,
          address
        )
      `)
      .order("created_at", {
        ascending: false,
      });

    console.log(
      "Load Expenses:",
      data
    );

    console.log(
      "Load Expenses Error:",
      error
    );

    if (error) {
      console.error(
        "Error loading expenses:",
        error
      );

      return;
    }

    setExpenses(data || []);
  }

  /*
   * Save expense
   */
  async function saveExpense() {
    /*
     * Basic validation
     */
    if (!selectedPropertyId) {
      alert(
        "Please select a property / unit."
      );
      return;
    }

    if (!category.trim()) {
      alert(
        "Please enter an expense category."
      );
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert(
        "Please enter a valid expense amount."
      );
      return;
    }

    if (!expenseDate) {
      alert(
        "Please select an expense date."
      );
      return;
    }

    try {
      setLoading(true);

      const {
        data,
        error,
      } = await supabase
        .from("expenses")
        .insert([
          {
            property_id:
              selectedPropertyId,

            category:
              category.trim(),

            amount:
              Number(amount),

            expense_date:
              expenseDate,
          },
        ])
        .select(`
          *,
          property:properties (
            id,
            name,
            address
          )
        `)
        .single();

      console.log(
        "Expense Data:",
        data
      );

      console.log(
        "Expense Error:",
        error
      );

      if (error) {
        alert(
          "Expense could not be saved:\n" +
            error.message
        );

        return;
      }

      alert(
        "Expense Saved Successfully"
      );

      /*
       * Reset form
       */
      setCategory("");
      setAmount("");

      setExpenseDate(
        new Date()
          .toISOString()
          .split("T")[0]
      );

      /*
       * Reload expense list
       */
      await loadExpenses();

    } catch (err) {
      console.error(
        "Unexpected error:",
        err
      );

      alert(
        "Unexpected Error"
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Selected property name
   */
  const selectedProperty =
    properties.find(
      (property) =>
        property.id ===
        selectedPropertyId
    );

  return (
    <div className="p-8">

      {/* Page Header */}

      <h1 className="text-3xl font-bold mb-6">
        Expenses
      </h1>

      {/* Expense Form */}

      <div className="max-w-md space-y-4">

        {/* Property / Unit */}

        <PropertySelector
          value={selectedPropertyId}
          onChange={
            setSelectedPropertyId
          }
          includeAll={false}
          label="Property / Unit"
        />

        {/* Category */}

        <div>
          <label className="block text-sm font-medium mb-2">
            Expense Category
          </label>

          <input
            className="border p-2 rounded w-full"
            placeholder="Example: Maid, Cleaning, Electricity"
            value={category}
            onChange={(e) =>
              setCategory(
                e.target.value
              )
            }
          />
        </div>

        {/* Amount */}

        <div>
          <label className="block text-sm font-medium mb-2">
            Amount
          </label>

          <input
            className="border p-2 rounded w-full"
            placeholder="Amount"
            type="number"
            min="0"
            value={amount}
            onChange={(e) =>
              setAmount(
                e.target.value
              )
            }
          />
        </div>

        {/* Expense Date */}

        <div>
          <label className="block text-sm font-medium mb-2">
            Expense Date
          </label>

          <input
            className="border p-2 rounded w-full"
            type="date"
            value={expenseDate}
            onChange={(e) =>
              setExpenseDate(
                e.target.value
              )
            }
          />
        </div>

        {/* Selected Unit Preview */}

        {selectedProperty && (
          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            <span className="text-muted-foreground">
              Expense will be recorded for:
            </span>

            <div className="font-semibold mt-1">
              {selectedProperty.name}
            </div>
          </div>
        )}

        {/* Save */}

        <button
          onClick={saveExpense}
          disabled={
            loading ||
            loadingProperties ||
            !selectedPropertyId
          }
          className="bg-black text-white p-2 rounded w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? "Saving..."
            : "Save Expense"}
        </button>

      </div>

      {/* Expense List */}

      <div className="mt-10">

        <h2 className="text-2xl font-bold mb-4">
          Expense List
        </h2>

        <div className="overflow-x-auto">

          <table className="border-collapse border w-full">

            <thead>
              <tr>

                <th className="border p-2 text-left">
                  Property / Unit
                </th>

                <th className="border p-2 text-left">
                  Category
                </th>

                <th className="border p-2 text-left">
                  Amount
                </th>

                <th className="border p-2 text-left">
                  Date
                </th>

              </tr>
            </thead>

            <tbody>

              {expenses.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="border p-6 text-center text-muted-foreground"
                  >
                    No expenses found.
                  </td>
                </tr>
              ) : (
                expenses.map(
                  (expense) => (
                    <tr
                      key={
                        expense.id
                      }
                    >

                      <td className="border p-2">
                        {expense.property
                          ?.name ||
                          "Unknown Property"}
                      </td>

                      <td className="border p-2">
                        {expense.category}
                      </td>

                      <td className="border p-2">
                        ₹
                        {Number(
                          expense.amount ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td className="border p-2">
                        {
                          expense.expense_date
                        }
                      </td>

                    </tr>
                  )
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}