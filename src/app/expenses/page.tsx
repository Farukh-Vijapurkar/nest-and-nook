"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

import PropertySelector from "@/components/PropertySelector";

interface Expense {
  id: string;
  property_id: string;
  category: string;
  amount: number;
  expense_date: string;
  created_at?: string;
  property?: {
    id: string;
    name: string;
    address?: string;
  };
}

export default function ExpensesPage() {
  /* =========================================================
     FORM STATE
  ========================================================= */

  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");

  const [expenseDate, setExpenseDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [
    selectedPropertyId,
    setSelectedPropertyId,
  ] = useState("");

  /* =========================================================
     DATA
  ========================================================= */

  const [properties, setProperties] =
    useState<any[]>([]);

  const [expenses, setExpenses] =
    useState<Expense[]>([]);

  /*
   * This selector controls which expenses
   * are displayed in the list.
   *
   * "all" = all properties
   */
  const [
    filterPropertyId,
    setFilterPropertyId,
  ] = useState("all");

  /* =========================================================
     EDIT STATE
  ========================================================= */

  const [
    editingExpense,
    setEditingExpense,
  ] = useState<Expense | null>(null);

  const [
    editCategory,
    setEditCategory,
  ] = useState("");

  const [
    editAmount,
    setEditAmount,
  ] = useState("");

  const [
    editExpenseDate,
    setEditExpenseDate,
  ] = useState("");

  const [
    editPropertyId,
    setEditPropertyId,
  ] = useState("");

  /* =========================================================
     LOADING STATES
  ========================================================= */

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    loadingProperties,
    setLoadingProperties,
  ] = useState(true);

  const [
    loadingExpenses,
    setLoadingExpenses,
  ] = useState(true);

  const [
    deletingId,
    setDeletingId,
  ] = useState<string | null>(null);

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    void loadProperties();
    void loadExpenses();
  }, []);

  /* =========================================================
     LOAD PROPERTIES
  ========================================================= */

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
     * property for the Add Expense form.
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

  /* =========================================================
     LOAD EXPENSES
  ========================================================= */

  async function loadExpenses() {
    setLoadingExpenses(true);

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
      .order("expense_date", {
        ascending: false,
      });

    console.log(
      "Expenses:",
      data
    );

    console.log(
      "Expenses Error:",
      error
    );

    if (error) {
      console.error(
        "Error loading expenses:",
        error
      );

      setLoadingExpenses(false);
      return;
    }

    setExpenses(
      (data || []) as Expense[]
    );

    setLoadingExpenses(false);
  }

  /* =========================================================
     SELECTED PROPERTY
  ========================================================= */

  const selectedProperty =
    properties.find(
      (property) =>
        property.id ===
        selectedPropertyId
    );

  /* =========================================================
     FILTERED EXPENSES
  ========================================================= */

  const filteredExpenses =
    useMemo(() => {
      if (
        filterPropertyId ===
        "all"
      ) {
        return expenses;
      }

      return expenses.filter(
        (expense) =>
          expense.property_id ===
          filterPropertyId
      );
    }, [
      expenses,
      filterPropertyId,
    ]);

  /* =========================================================
     TOTAL EXPENSES
  ========================================================= */

  const totalExpenses =
    useMemo(() => {
      return filteredExpenses.reduce(
        (sum, expense) =>
          sum +
          Number(
            expense.amount || 0
          ),
        0
      );
    }, [filteredExpenses]);

  /* =========================================================
     SAVE NEW EXPENSE
  ========================================================= */

  async function saveExpense() {
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

    if (
      !amount ||
      Number(amount) <= 0
    ) {
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

      if (error) {
        console.error(
          "Save expense error:",
          error
        );

        alert(
          "Expense could not be saved:\n" +
            error.message
        );

        return;
      }

      console.log(
        "Expense saved:",
        data
      );

      /*
       * Reset form.
       */
      setCategory("");
      setAmount("");

      setExpenseDate(
        new Date()
          .toISOString()
          .split("T")[0]
      );

      /*
       * Refresh list.
       */
      await loadExpenses();

    } catch (error) {
      console.error(
        "Unexpected error:",
        error
      );

      alert(
        "Unexpected error while saving expense."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     OPEN EDIT DIALOG
  ========================================================= */

  function openEditExpense(
    expense: Expense
  ) {
    setEditingExpense(
      expense
    );

    setEditCategory(
      expense.category || ""
    );

    setEditAmount(
      String(
        expense.amount ?? ""
      )
    );

    setEditExpenseDate(
      expense.expense_date || ""
    );

    setEditPropertyId(
      expense.property_id || ""
    );
  }

  /* =========================================================
     UPDATE EXPENSE
  ========================================================= */

  async function updateExpense() {
    if (!editingExpense) {
      return;
    }

    if (!editPropertyId) {
      alert(
        "Please select a property / unit."
      );
      return;
    }

    if (!editCategory.trim()) {
      alert(
        "Please enter an expense category."
      );
      return;
    }

    if (
      !editAmount ||
      Number(editAmount) <= 0
    ) {
      alert(
        "Please enter a valid expense amount."
      );
      return;
    }

    if (!editExpenseDate) {
      alert(
        "Please select an expense date."
      );
      return;
    }

    try {
      setLoading(true);

      const {
        error,
      } = await supabase
        .from("expenses")
        .update({
          property_id:
            editPropertyId,

          category:
            editCategory.trim(),

          amount:
            Number(editAmount),

          expense_date:
            editExpenseDate,
        })
        .eq(
          "id",
          editingExpense.id
        );

      if (error) {
        console.error(
          "Update expense error:",
          error
        );

        alert(
          "Expense could not be updated:\n" +
            error.message
        );

        return;
      }

      /*
       * Close edit dialog.
       */
      setEditingExpense(
        null
      );

      /*
       * Refresh data.
       */
      await loadExpenses();

    } catch (error) {
      console.error(
        "Unexpected update error:",
        error
      );

      alert(
        "Unexpected error while updating expense."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     DELETE EXPENSE
  ========================================================= */

  async function deleteExpense(
    expense: Expense
  ) {
    const confirmed =
      window.confirm(
        `Delete this expense?\n\n${expense.category} - ₹${Number(
          expense.amount || 0
        ).toLocaleString("en-IN")}`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        expense.id
      );

      const {
        error,
      } = await supabase
        .from("expenses")
        .delete()
        .eq(
          "id",
          expense.id
        );

      if (error) {
        console.error(
          "Delete expense error:",
          error
        );

        alert(
          "Expense could not be deleted:\n" +
            error.message
        );

        return;
      }

      await loadExpenses();

    } catch (error) {
      console.error(
        "Unexpected delete error:",
        error
      );

      alert(
        "Unexpected error while deleting expense."
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* =========================================================
     FORMAT CURRENCY
  ========================================================= */

  function formatCurrency(
    value: number
  ) {
    return `₹${Number(
      value || 0
    ).toLocaleString(
      "en-IN"
    )}`;
  }

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  function formatDate(
    value: string
  ) {
    if (!value) {
      return "-";
    }

    return new Date(
      value
    ).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">

      <div className="max-w-7xl mx-auto">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-slate-900">
            Expenses
          </h1>

          <p className="text-slate-500 mt-1">
            Track expenses across all your properties
          </p>

        </div>

        {/* =====================================================
            TOP STAT
        ===================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Total Expenses
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-2">
              {formatCurrency(
                totalExpenses
              )}
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Based on selected unit
            </p>

          </div>


          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Expense Entries
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-2">
              {filteredExpenses.length}
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Recorded expenses
            </p>

          </div>


          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Current View
            </p>

            <p className="text-lg font-bold text-slate-900 mt-2 truncate">
              {filterPropertyId ===
              "all"
                ? "All Units"
                : properties.find(
                    (property) =>
                      property.id ===
                      filterPropertyId
                  )?.name ||
                  "Selected Unit"}
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Expense filter
            </p>

          </div>

        </div>


        {/* =====================================================
            ADD EXPENSE
        ===================================================== */}

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-8">

          <div className="mb-6">

            <h2 className="text-xl font-bold text-slate-900">
              Add Expense
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Record a new expense for a specific property
            </p>

          </div>


          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* PROPERTY */}

            <div>

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Property / Unit
              </label>

              <PropertySelector
                value={
                  selectedPropertyId
                }
                onChange={
                  setSelectedPropertyId
                }
                includeAll={false}
                label="Property / Unit"
              />

            </div>


            {/* CATEGORY */}

            <div>

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>

              <input
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Cleaning, Maid, Electricity..."
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
              />

            </div>


            {/* AMOUNT */}

            <div>

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Amount
              </label>

              <input
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-slate-200"
                type="number"
                min="0"
                placeholder="₹ Amount"
                value={amount}
                onChange={(e) =>
                  setAmount(
                    e.target.value
                  )
                }
              />

            </div>


            {/* DATE */}

            <div>

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Expense Date
              </label>

              <input
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-slate-200"
                type="date"
                value={
                  expenseDate
                }
                onChange={(e) =>
                  setExpenseDate(
                    e.target.value
                  )
                }
              />

            </div>

          </div>


          {/* SELECTED PROPERTY */}

          {selectedProperty && (

            <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">

              <div>

                <p className="text-xs text-slate-400">
                  Recording expense for
                </p>

                <p className="font-semibold text-slate-800 mt-1">
                  {selectedProperty.name}
                </p>

              </div>

              <span className="text-xl">
                🏠
              </span>

            </div>

          )}


          <div className="flex justify-end mt-5">

            <button
              onClick={
                saveExpense
              }
              disabled={
                loading ||
                loadingProperties ||
                !selectedPropertyId
              }
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Saving..."
                : "Save Expense"}
            </button>

          </div>

        </div>


        {/* =====================================================
            FILTER
        ===================================================== */}

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-5">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                Expense History
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                View and manage recorded expenses
              </p>

            </div>


            <div className="w-full md:w-72">

              <PropertySelector
                value={
                  filterPropertyId
                }
                onChange={
                  setFilterPropertyId
                }
                includeAll
                label="Filter by Property / Unit"
              />

            </div>

          </div>

        </div>


        {/* =====================================================
            EXPENSE TABLE
        ===================================================== */}

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

          {/* DESKTOP HEADER */}

          <div className="hidden md:grid grid-cols-[1.8fr_1.4fr_1fr_1.2fr_120px] gap-4 px-6 py-4 bg-slate-50 border-b text-xs font-semibold uppercase tracking-wide text-slate-500">

            <div>Property / Unit</div>

            <div>Category</div>

            <div>Amount</div>

            <div>Date</div>

            <div className="text-right">
              Actions
            </div>

          </div>


          {/* LOADING */}

          {loadingExpenses && (

            <div className="p-12 text-center text-slate-500">
              Loading expenses...
            </div>

          )}


          {/* EMPTY */}

          {!loadingExpenses &&
            filteredExpenses.length ===
              0 && (

              <div className="p-12 text-center">

                <div className="text-4xl mb-3">
                  💰
                </div>

                <p className="font-medium text-slate-700">
                  No expenses found
                </p>

                <p className="text-sm text-slate-400 mt-1">
                  Add an expense or change the property filter
                </p>

              </div>

            )}


          {/* EXPENSE ROWS */}

          {!loadingExpenses &&
            filteredExpenses.map(
              (expense) => (

                <div
                  key={expense.id}
                  className="border-b last:border-b-0 hover:bg-slate-50 transition"
                >

                  {/* DESKTOP */}

                  <div className="hidden md:grid grid-cols-[1.8fr_1.4fr_1fr_1.2fr_120px] gap-4 px-6 py-5 items-center">

                    <div>

                      <p className="font-semibold text-slate-800">
                        {expense.property
                          ?.name ||
                          "Unknown Property"}
                      </p>

                    </div>


                    <div>

                      <span className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-700">
                        {expense.category}
                      </span>

                    </div>


                    <div>

                      <p className="font-semibold text-slate-900">
                        {formatCurrency(
                          Number(
                            expense.amount ||
                              0
                          )
                        )}
                      </p>

                    </div>


                    <div>

                      <p className="text-sm text-slate-700">
                        {formatDate(
                          expense.expense_date
                        )}
                      </p>

                    </div>


                    <div className="flex justify-end gap-2">

                      <button
                        onClick={() =>
                          openEditExpense(
                            expense
                          )
                        }
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-100 transition"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteExpense(
                            expense
                          )
                        }
                        disabled={
                          deletingId ===
                          expense.id
                        }
                        className="px-3 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition disabled:opacity-50"
                      >
                        {deletingId ===
                        expense.id
                          ? "..."
                          : "Delete"}
                      </button>

                    </div>

                  </div>


                  {/* MOBILE */}

                  <div className="md:hidden p-5">

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <p className="font-semibold text-slate-900">
                          {expense.category}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          {expense.property
                            ?.name ||
                            "Unknown Property"}
                        </p>

                      </div>

                      <p className="font-bold text-slate-900">
                        {formatCurrency(
                          Number(
                            expense.amount ||
                              0
                          )
                        )}
                      </p>

                    </div>


                    <div className="flex items-center justify-between mt-4">

                      <p className="text-sm text-slate-500">
                        {formatDate(
                          expense.expense_date
                        )}
                      </p>

                      <div className="flex gap-2">

                        <button
                          onClick={() =>
                            openEditExpense(
                              expense
                            )
                          }
                          className="px-3 py-1.5 rounded-lg border text-sm"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteExpense(
                              expense
                            )
                          }
                          disabled={
                            deletingId ===
                            expense.id
                          }
                          className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-sm"
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  </div>

                </div>

              )
            )}

        </div>

      </div>


      {/* =====================================================
          EDIT EXPENSE MODAL
      ===================================================== */}

      {editingExpense && (

        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() =>
            setEditingExpense(null)
          }
        >

          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="px-6 py-5 border-b flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Edit Expense
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Update expense details
                </p>

              </div>

              <button
                onClick={() =>
                  setEditingExpense(null)
                }
                className="w-9 h-9 rounded-full hover:bg-slate-100 text-slate-500"
              >
                ✕
              </button>

            </div>


            {/* BODY */}

            <div className="p-6 space-y-5">

              {/* PROPERTY */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Property / Unit
                </label>

                <PropertySelector
                  value={
                    editPropertyId
                  }
                  onChange={
                    setEditPropertyId
                  }
                  includeAll={false}
                  label="Property / Unit"
                />

              </div>


              {/* CATEGORY */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>

                <input
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5"
                  value={
                    editCategory
                  }
                  onChange={(e) =>
                    setEditCategory(
                      e.target.value
                    )
                  }
                />

              </div>


              {/* AMOUNT */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Amount
                </label>

                <input
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5"
                  type="number"
                  min="0"
                  value={
                    editAmount
                  }
                  onChange={(e) =>
                    setEditAmount(
                      e.target.value
                    )
                  }
                />

              </div>


              {/* DATE */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Expense Date
                </label>

                <input
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5"
                  type="date"
                  value={
                    editExpenseDate
                  }
                  onChange={(e) =>
                    setEditExpenseDate(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>


            {/* FOOTER */}

            <div className="px-6 py-4 border-t bg-slate-50 rounded-b-2xl flex justify-end gap-3">

              <button
                onClick={() =>
                  setEditingExpense(null)
                }
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={
                  updateExpense
                }
                disabled={
                  loading ||
                  !editCategory.trim() ||
                  !editAmount ||
                  !editPropertyId ||
                  !editExpenseDate
                }
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
              >
                {loading
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}