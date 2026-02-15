import React, { useContext, useEffect, useMemo, useState } from "react";
import { AppCtx } from "../App";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import {
  BadgeCheck,
  Package,
  Pencil,
  Search,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { itemApi } from "../api/itemApi";

const sorters = {
  none: { label: "Sort: None" },
  priceAsc: { label: "Price (asc)" },
  priceDesc: { label: "Price (desc)" },
  qtyAsc: { label: "Qty (asc)" },
  qtyDesc: { label: "Qty (desc)" },
};

export default function Items() {
  const { items, setItems, showToast } = useContext(AppCtx);

  const [description, setDescription] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [qtyOnHand, setQtyOnHand] = useState("");

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("none");

  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setDescription("");
    setUnitPrice("");
    setQtyOnHand("");
    setEditId(null);
    setErrors({});
  };

  const validate = () => {
    const e = {};
    if (!description.trim()) e.description = "Description is required";

    const p = Number(unitPrice);
    const q = Number(qtyOnHand);

    if (unitPrice === "" || Number.isNaN(p) || p <= 0)
      e.unitPrice = "Unit Price must be > 0";
    if (qtyOnHand === "" || Number.isNaN(q) || q < 0)
      e.qtyOnHand = "Qty On Hand must be 0 or more";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await itemApi.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showToast("Failed to load items", "error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSave = async () => {
    if (!validate()) return;

    const payloadBase = {
      description: description.trim(),
      unitPrice: Number(unitPrice),
      qtyOnHand: Number(qtyOnHand),
    };

    try {
      setSaving(true);

      if (editId) {
        // PUT /items (backend expects id inside body)
        await itemApi.update({ id: editId, ...payloadBase });
        showToast("Item updated", "success");
      } else {
        // POST /items
        await itemApi.save(payloadBase);
        showToast("Item saved", "success");
      }

      resetForm();
      await loadItems(); // sync from DB
    } catch (err) {
      console.error(err);
      showToast("Operation failed. Check backend / CORS.", "error");
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (it) => {
    setEditId(it.id);
    setDescription(it.description ?? "");
    setUnitPrice(String(it.unitPrice ?? ""));
    setQtyOnHand(String(it.qtyOnHand ?? ""));
    setErrors({});
  };

  const onDelete = async (id) => {
    try {
      setSaving(true);
      await itemApi.delete(id);
      showToast("Item deleted", "success");
      if (editId === id) resetForm();
      await loadItems();
    } catch (err) {
      console.error(err);
      showToast("Delete failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const viewItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = q
      ? items.filter((it) =>
          String(it.description || "")
            .toLowerCase()
            .includes(q),
        )
      : [...items];

    const byNum = (a, b, key, dir) =>
      dir === "asc" ? a[key] - b[key] : b[key] - a[key];

    if (sortKey === "priceAsc")
      arr.sort((a, b) => byNum(a, b, "unitPrice", "asc"));
    if (sortKey === "priceDesc")
      arr.sort((a, b) => byNum(a, b, "unitPrice", "desc"));
    if (sortKey === "qtyAsc")
      arr.sort((a, b) => byNum(a, b, "qtyOnHand", "asc"));
    if (sortKey === "qtyDesc")
      arr.sort((a, b) => byNum(a, b, "qtyOnHand", "desc"));

    return arr;
  }, [items, search, sortKey]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-sm font-semibold">Item Manager</div>
            <div className="mt-1 text-xs text-zinc-400">
              Cards grid • search & sort • backend synced
            </div>
          </div>

          <div className="flex items-center gap-2">
            {editId ? (
              <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-xs text-zinc-300">
                <Pencil className="h-4 w-4 text-zinc-400" />
                <span>Edit mode</span>
                <Button
                  variant="secondary"
                  className="py-1.5 px-2.5"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            ) : null}

            <button
              onClick={loadItems}
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

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Chocolate Biscuit"
            error={errors.description}
          />
          <Input
            label="Unit Price"
            type="number"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            placeholder="0.00"
            error={errors.unitPrice}
          />
          <Input
            label="Qty On Hand"
            type="number"
            value={qtyOnHand}
            onChange={(e) => setQtyOnHand(e.target.value)}
            placeholder="0"
            error={errors.qtyOnHand}
          />
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            onClick={onSave}
            className="w-full sm:w-auto"
            disabled={saving}
          >
            {saving ? "Saving..." : editId ? "Update Item" : "Save Item"}
          </Button>
          <Button
            variant="secondary"
            onClick={resetForm}
            className="w-full sm:w-auto"
            disabled={saving}
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-zinc-800 p-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm font-semibold">Items</div>

          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by description..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/40 pl-10 pr-3 py-2.5 text-sm outline-none transition focus:border-zinc-600 placeholder:text-zinc-600"
              />
            </div>

            <div className="w-full md:w-56">
              <Select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
              >
                {Object.entries(sorters).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-10 text-center">
              <div className="text-sm font-medium">Loading items...</div>
              <div className="mt-1 text-xs text-zinc-500">
                Fetching from backend
              </div>
            </div>
          ) : viewItems.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/40">
                <Package className="h-6 w-6 text-zinc-400" />
              </div>
              <div className="mt-4 text-sm font-medium">No items yet</div>
              <div className="mt-1 text-xs text-zinc-500">
                Create your first item using the form above.
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {viewItems.map((it) => {
                const low = Number(it.qtyOnHand) < 5;
                return (
                  <div
                    key={it.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 shadow-sm transition hover:bg-zinc-950/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">
                          {it.description}
                        </div>
                        <div className="mt-1 text-xs text-zinc-400">
                          Unit Price:{" "}
                          <span className="text-zinc-200">
                            Rs {Number(it.unitPrice).toFixed(2)}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-zinc-400">
                          Qty On Hand:{" "}
                          <span className="text-zinc-200">{it.qtyOnHand}</span>
                        </div>
                      </div>

                      <div
                        className={[
                          "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium",
                          low
                            ? "border-red-800 bg-red-950/30 text-red-300"
                            : "border-zinc-800 bg-zinc-900/40 text-zinc-200",
                        ].join(" ")}
                      >
                        {low ? "Low Stock" : "In Stock"}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-2 text-xs text-zinc-500">
                        <BadgeCheck className="h-4 w-4 text-zinc-500" />
                        UI Only
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(it)}
                          disabled={saving}
                          className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-200 transition hover:bg-zinc-900 disabled:opacity-50"
                        >
                          <Pencil className="h-4 w-4 text-zinc-400" />
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(it.id)}
                          disabled={saving}
                          className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-200 transition hover:bg-zinc-900 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-zinc-800 p-4 text-xs text-zinc-500">
          Sort: Price/QTY • Responsive card grid • backend synced
        </div>
      </div>
    </div>
  );
}
