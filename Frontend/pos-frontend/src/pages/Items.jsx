import React, { useContext, useMemo, useState } from "react";
import { AppCtx } from "../App";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import { ArrowDownAZ, ArrowUpAZ, BadgeCheck, Package, Pencil, Search, Trash2 } from "lucide-react";

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
    if (unitPrice === "" || Number.isNaN(p) || p <= 0) e.unitPrice = "Unit Price must be a valid number > 0";
    if (qtyOnHand === "" || Number.isNaN(q) || q < 0) e.qtyOnHand = "Qty On Hand must be 0 or more";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSave = () => {
    if (!validate()) return;

    const payload = {
      description: description.trim(),
      unitPrice: Number(unitPrice),
      qtyOnHand: Number(qtyOnHand),
    };

    if (editId) {
      setItems((prev) => prev.map((it) => (it.id === editId ? { ...it, ...payload } : it)));
      showToast("Item updated", "success");
      resetForm();
      return;
    }

    const newItem = { id: crypto.randomUUID(), ...payload };
    setItems((prev) => [newItem, ...prev]);
    showToast("Item saved", "success");
    resetForm();
  };

  const onEdit = (it) => {
    setEditId(it.id);
    setDescription(it.description);
    setUnitPrice(String(it.unitPrice));
    setQtyOnHand(String(it.qtyOnHand));
    setErrors({});
  };

  const onDelete = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    showToast("Item deleted", "success");
    if (editId === id) resetForm();
  };

  const viewItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = q ? items.filter((it) => it.description.toLowerCase().includes(q)) : [...items];

    const sort = sortKey;
    const byNum = (a, b, key, dir) => (dir === "asc" ? a[key] - b[key] : b[key] - a[key]);

    if (sort === "priceAsc") arr.sort((a, b) => byNum(a, b, "unitPrice", "asc"));
    if (sort === "priceDesc") arr.sort((a, b) => byNum(a, b, "unitPrice", "desc"));
    if (sort === "qtyAsc") arr.sort((a, b) => byNum(a, b, "qtyOnHand", "asc"));
    if (sort === "qtyDesc") arr.sort((a, b) => byNum(a, b, "qtyOnHand", "desc"));

    return arr;
  }, [items, search, sortKey]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-sm font-semibold">Item Manager</div>
            <div className="mt-1 text-xs text-zinc-400">Cards grid • search & sort • local state only</div>
          </div>

          {editId ? (
            <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-xs text-zinc-300">
              <Pencil className="h-4 w-4 text-zinc-400" />
              <span>Edit mode</span>
              <Button variant="secondary" className="py-1.5 px-2.5" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          ) : null}
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
          <Button onClick={onSave} className="w-full sm:w-auto">
            {editId ? "Update Item" : "Save Item"}
          </Button>
          <Button variant="secondary" onClick={resetForm} className="w-full sm:w-auto">
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
              <Select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
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
          {viewItems.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/40">
                <Package className="h-6 w-6 text-zinc-400" />
              </div>
              <div className="mt-4 text-sm font-medium">No items yet</div>
              <div className="mt-1 text-xs text-zinc-500">Create your first item using the form above.</div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {viewItems.map((it) => {
                const low = it.qtyOnHand < 5;
                return (
                  <div
                    key={it.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 shadow-sm transition hover:bg-zinc-950/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{it.description}</div>
                        <div className="mt-1 text-xs text-zinc-400">
                          Unit Price: <span className="text-zinc-200">Rs {it.unitPrice.toFixed(2)}</span>
                        </div>
                        <div className="mt-1 text-xs text-zinc-400">
                          Qty On Hand: <span className="text-zinc-200">{it.qtyOnHand}</span>
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
                          className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-200 transition hover:bg-zinc-900"
                        >
                          <Pencil className="h-4 w-4 text-zinc-400" />
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(it.id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-200 transition hover:bg-zinc-900"
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
          Sort: Price/QTY • Responsive card grid
        </div>
      </div>
    </div>
  );
}
