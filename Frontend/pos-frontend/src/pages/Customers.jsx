import React, { useContext, useMemo, useState } from "react";
import { AppCtx } from "../App";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Pencil, Search, Trash2, X } from "lucide-react";

export default function Customers() {
  const { customers, setCustomers, showToast } = useContext(AppCtx);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [search, setSearch] = useState("");

  const [editId, setEditId] = useState(null);

  const [errors, setErrors] = useState({});

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const resetForm = () => {
    setName("");
    setAddress("");
    setErrors({});
    setEditId(null);
  };

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Name is required";
    if (!address.trim()) e.address = "Address is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSave = () => {
    if (!validate()) return;

    if (editId) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === editId ? { ...c, name: name.trim(), address: address.trim() } : c))
      );
      showToast("Customer updated", "success");
      resetForm();
      return;
    }

    const newCustomer = {
      id: crypto.randomUUID(),
      name: name.trim(),
      address: address.trim(),
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    showToast("Customer saved", "success");
    resetForm();
  };

  const onEdit = (c) => {
    setEditId(c.id);
    setName(c.name);
    setAddress(c.address);
    setErrors({});
  };

  const onDelete = (id) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    showToast("Customer deleted", "success");
    if (editId === id) resetForm();
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="text-sm font-semibold">Customer Manager</div>
            <div className="mt-1 text-xs text-zinc-400">
              Add, edit, and manage customers (local state only).
            </div>
          </div>

          {editId ? (
            <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-xs text-zinc-300">
              <Pencil className="h-4 w-4 text-zinc-400" />
              <span>Edit mode</span>
              <button
                onClick={resetForm}
                className="ml-2 inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/40 px-2 py-1 text-zinc-200 transition hover:bg-zinc-900"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter customer name"
            error={errors.name}
          />
          <Input
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter customer address"
            error={errors.address}
          />
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button onClick={onSave} className="sm:w-auto w-full">
            {editId ? "Update Customer" : "Save Customer"}
          </Button>
          <Button variant="secondary" onClick={resetForm} className="sm:w-auto w-full">
            Clear
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-zinc-800 p-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm font-semibold">Customers</div>
          <div className="relative w-full md:w-96">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or address..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/40 pl-10 pr-3 py-2.5 text-sm outline-none transition focus:border-zinc-600 placeholder:text-zinc-600"
            />
          </div>
        </div>

        <div className="max-h-[520px] overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur border-b border-zinc-800">
              <tr className="text-xs text-zinc-400">
                <th className="px-4 py-3 w-12">#</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3 w-40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center">
                    <div className="text-sm font-medium">No customers yet</div>
                    <div className="mt-1 text-xs text-zinc-500">
                      Add customers using the form above.
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((c, idx) => (
                  <tr key={c.id} className="border-b border-zinc-800/70 hover:bg-zinc-950/40 transition">
                    <td className="px-4 py-3 text-zinc-400">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-zinc-300">{c.address}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(c)}
                          className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-200 transition hover:bg-zinc-900"
                        >
                          <Pencil className="h-4 w-4 text-zinc-400" />
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(c.id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-200 transition hover:bg-zinc-900"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-zinc-800 p-4 text-xs text-zinc-500">
          Table view only • sticky header • local state
        </div>
      </div>
    </div>
  );
}
