import React, { useContext, useEffect, useMemo, useState } from "react";
import { AppCtx } from "../App";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Pencil, Search, Trash2, X, RefreshCw } from "lucide-react";
import { customerApi } from "../api/customerApi";

export default function Customers() {
  const { customers, setCustomers, showToast } = useContext(AppCtx);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [search, setSearch] = useState("");

  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        String(c.name || "")
          .toLowerCase()
          .includes(q) ||
        String(c.address || "")
          .toLowerCase()
          .includes(q),
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

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerApi.getAll(); // returns res.data.data
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showToast("Failed to load customers", "error");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSave = async () => {
    if (!validate()) return;

    const payloadBase = {
      name: name.trim(),
      address: address.trim(),
    };

    try {
      setSaving(true);

      if (editId) {
        // PUT /customers (backend expects id inside body)
        await customerApi.update({ id: editId, ...payloadBase });
        showToast("Customer updated", "success");
      } else {
        // POST /customers
        await customerApi.save(payloadBase);
        showToast("Customer saved", "success");
      }

      resetForm();
      await loadCustomers(); // sync UI with DB
    } catch (err) {
      console.error(err);
      showToast("Operation failed. Check backend / CORS.", "error");
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (c) => {
    setEditId(c.id);
    setName(c.name ?? "");
    setAddress(c.address ?? "");
    setErrors({});
  };

  const onDelete = async (id) => {
    try {
      setSaving(true);
      await customerApi.delete(id);
      showToast("Customer deleted", "success");
      if (editId === id) resetForm();
      await loadCustomers();
    } catch (err) {
      console.error(err);
      showToast("Delete failed", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="text-sm font-semibold">Customer Manager</div>
            <div className="mt-1 text-xs text-zinc-400">
              Add, edit, and manage customers (backend connected).
            </div>
          </div>

          <div className="flex items-center gap-2">
            {editId ? (
              <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-xs text-zinc-300">
                <Pencil className="h-4 w-4 text-zinc-400" />
                <span>Edit mode</span>
                <button
                  onClick={resetForm}
                  className="ml-2 inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/40 px-2 py-1 text-zinc-200 transition hover:bg-zinc-900"
                  disabled={saving}
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </button>
              </div>
            ) : null}

            <button
              onClick={loadCustomers}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-200 transition hover:bg-zinc-900 disabled:opacity-50"
              disabled={loading}
              title="Refresh"
            >
              <RefreshCw
                className={`h-4 w-4 text-zinc-400 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
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
          <Button
            onClick={onSave}
            className="sm:w-auto w-full"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : editId
                ? "Update Customer"
                : "Save Customer"}
          </Button>
          <Button
            variant="secondary"
            onClick={resetForm}
            className="sm:w-auto w-full"
            disabled={saving}
          >
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
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center">
                    <div className="text-sm font-medium">
                      Loading customers...
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">
                      Fetching from backend
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
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
                  <tr
                    key={c.id}
                    className="border-b border-zinc-800/70 hover:bg-zinc-950/40 transition"
                  >
                    <td className="px-4 py-3 text-zinc-400">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-zinc-300">{c.address}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(c)}
                          disabled={saving}
                          className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-200 transition hover:bg-zinc-900 disabled:opacity-50"
                        >
                          <Pencil className="h-4 w-4 text-zinc-400" />
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(c.id)}
                          disabled={saving}
                          className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-200 transition hover:bg-zinc-900 disabled:opacity-50"
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
          Table view only • sticky header • backend synced
        </div>
      </div>
    </div>
  );
}
