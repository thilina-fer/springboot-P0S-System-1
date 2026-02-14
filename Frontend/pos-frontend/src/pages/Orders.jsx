import React, { useContext, useMemo, useState } from "react";
import { AppCtx } from "../App";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Modal from "../components/ui/Modal";
import {
  BadgePercent,
  Calendar,
  Minus,
  Plus,
  ReceiptText,
  Tag,
  Trash2,
} from "lucide-react";

const pad4 = (n) => String(n).padStart(4, "0");
const makeOrderId = (seq) => `ORD-${pad4(seq)}`;
const todayISO = () => new Date().toISOString().slice(0, 10);

export default function Orders() {
  const { customers, items, setItems, orders, setOrders, orderSeq, setOrderSeq, showToast } =
    useContext(AppCtx);

  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [orderQty, setOrderQty] = useState("");

  const [cart, setCart] = useState([]);
  const [errorInline, setErrorInline] = useState("");

  const [discountMode, setDiscountMode] = useState("percent"); // percent | fixed
  const [discountValue, setDiscountValue] = useState("");
  const [taxEnabled, setTaxEnabled] = useState(false);
  const TAX_RATE = 0.08;

  const [successOpen, setSuccessOpen] = useState(false);

  const orderId = useMemo(() => makeOrderId(orderSeq), [orderSeq]);
  const orderDate = useMemo(() => todayISO(), []);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId) || null,
    [customers, selectedCustomerId]
  );
  const selectedItem = useMemo(
    () => items.find((it) => it.id === selectedItemId) || null,
    [items, selectedItemId]
  );

  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, line) => sum + line.qty * line.unitPrice, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    const v = Number(discountValue);
    if (!discountValue || Number.isNaN(v) || v <= 0) return 0;
    if (discountMode === "fixed") return Math.min(v, cartSubtotal);
    return Math.min((cartSubtotal * v) / 100, cartSubtotal);
  }, [discountValue, discountMode, cartSubtotal]);

  const taxableBase = useMemo(() => Math.max(cartSubtotal - discountAmount, 0), [cartSubtotal, discountAmount]);
  const taxAmount = useMemo(() => (taxEnabled ? taxableBase * TAX_RATE : 0), [taxEnabled, taxableBase]);
  const grandTotal = useMemo(() => taxableBase + taxAmount, [taxableBase, taxAmount]);

  const clearInlineError = () => setErrorInline("");

  const validateAddToCart = () => {
    if (items.length === 0) return "No items available. Add items first.";
    if (!selectedItem) return "Select an item.";
    const q = Number(orderQty);
    if (orderQty === "" || Number.isNaN(q) || q <= 0) return "Enter a valid order quantity.";
    if (q > selectedItem.qtyOnHand) return "Cannot add quantity greater than available stock.";
    return "";
  };

  const addToCart = () => {
    clearInlineError();
    const msg = validateAddToCart();
    if (msg) {
      setErrorInline(msg);
      showToast(msg, "error");
      return;
    }

    const q = Number(orderQty);
    setCart((prev) => {
      const existing = prev.find((l) => l.itemId === selectedItem.id);
      if (!existing) {
        return [
          ...prev,
          {
            itemId: selectedItem.id,
            description: selectedItem.description,
            unitPrice: selectedItem.unitPrice,
            qty: q,
          },
        ];
      }
      const newQty = existing.qty + q;
      if (newQty > selectedItem.qtyOnHand) {
        const err = "Total cart quantity exceeds available stock.";
        setErrorInline(err);
        showToast(err, "error");
        return prev;
      }
      return prev.map((l) => (l.itemId === selectedItem.id ? { ...l, qty: newQty } : l));
    });

    setOrderQty("");
    showToast("Added to cart", "success");
  };

  const incQty = (itemId) => {
    const it = items.find((x) => x.id === itemId);
    if (!it) return;
    setCart((prev) =>
      prev.map((l) => {
        if (l.itemId !== itemId) return l;
        if (l.qty + 1 > it.qtyOnHand) {
          showToast("Cannot exceed available stock", "error");
          return l;
        }
        return { ...l, qty: l.qty + 1 };
      })
    );
  };

  const decQty = (itemId) => {
    setCart((prev) =>
      prev
        .map((l) => (l.itemId === itemId ? { ...l, qty: Math.max(l.qty - 1, 1) } : l))
        .filter((l) => l.qty > 0)
    );
  };

  const removeLine = (itemId) => {
    setCart((prev) => prev.filter((l) => l.itemId !== itemId));
  };

  const placeOrder = () => {
    clearInlineError();

    if (cart.length === 0) {
      const msg = "Cart is empty.";
      setErrorInline(msg);
      showToast(msg, "error");
      return;
    }
    if (customers.length === 0) {
      const msg = "No customers available. Add customers first.";
      setErrorInline(msg);
      showToast(msg, "error");
      return;
    }
    if (!selectedCustomer) {
      const msg = "Select a customer before placing the order.";
      setErrorInline(msg);
      showToast(msg, "error");
      return;
    }

    // Reduce stock locally
    const updates = new Map(cart.map((l) => [l.itemId, l.qty]));
    setItems((prev) =>
      prev.map((it) => {
        const q = updates.get(it.id);
        if (!q) return it;
        return { ...it, qtyOnHand: Math.max(it.qtyOnHand - q, 0) };
      })
    );

    // Save order summary locally (no default data; only user-triggered)
    const order = {
      id: crypto.randomUUID(),
      orderId,
      date: orderDate,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      lines: cart.map((l) => ({
        itemId: l.itemId,
        description: l.description,
        unitPrice: l.unitPrice,
        qty: l.qty,
        lineTotal: l.qty * l.unitPrice,
      })),
      subtotal: cartSubtotal,
      discountMode,
      discountValue: discountValue === "" ? 0 : Number(discountValue),
      discountAmount,
      taxEnabled,
      taxAmount,
      total: grandTotal,
    };

    setOrders((prev) => [order, ...prev]);

    // Clear cart + generate next order id
    setCart([]);
    setSelectedItemId("");
    setOrderQty("");
    setDiscountValue("");
    setTaxEnabled(false);

    setOrderSeq((s) => s + 1);
    setSuccessOpen(true);
    showToast("Order placed", "success");
  };

  const headerChip = (icon, text) => (
    <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-xs text-zinc-300">
      {icon}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold">New Sale</div>
            <div className="mt-1 text-xs text-zinc-400">Modern POS layout • desktop split • mobile stacked</div>
          </div>

          <div className="flex flex-wrap gap-2">
            {headerChip(<ReceiptText className="h-4 w-4 text-zinc-400" />, orderId)}
            {headerChip(<Calendar className="h-4 w-4 text-zinc-400" />, orderDate)}
          </div>
        </div>

        {errorInline ? (
          <div className="mt-4 rounded-xl border border-red-800 bg-red-950/20 px-4 py-3 text-sm text-red-200">
            {errorInline}
          </div>
        ) : null}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Left: Setup */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Customer</div>
              <div className="text-xs text-zinc-500">Required</div>
            </div>

            {customers.length === 0 ? (
              <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 text-sm">
                <div className="font-medium">No customers found</div>
                <div className="mt-1 text-xs text-zinc-500">Go to Customers page and add at least one customer.</div>
              </div>
            ) : (
              <>
                <div className="mt-4">
                  <Select
                    label="Select Customer"
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                  >
                    <option value="">Choose...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
                  <div className="text-xs text-zinc-400">Selected</div>
                  {selectedCustomer ? (
                    <>
                      <div className="mt-2 text-sm font-semibold">{selectedCustomer.name}</div>
                      <div className="mt-1 text-xs text-zinc-400">{selectedCustomer.address}</div>
                    </>
                  ) : (
                    <div className="mt-2 text-sm text-zinc-500">No customer selected.</div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Item</div>
              <div className="text-xs text-zinc-500">Add to cart</div>
            </div>

            {items.length === 0 ? (
              <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 text-sm">
                <div className="font-medium">No items found</div>
                <div className="mt-1 text-xs text-zinc-500">Go to Items page and add at least one item.</div>
              </div>
            ) : (
              <>
                <div className="mt-4">
                  <Select
                    label="Select Item"
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                  >
                    <option value="">Choose...</option>
                    {items.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.description}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
                    <div className="text-xs text-zinc-400">Price</div>
                    <div className="mt-2 text-sm font-semibold">
                      {selectedItem ? `Rs ${selectedItem.unitPrice.toFixed(2)}` : "—"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
                    <div className="text-xs text-zinc-400">Available</div>
                    <div className="mt-2 text-sm font-semibold">
                      {selectedItem ? selectedItem.qtyOnHand : "—"}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Input
                    label="Order Quantity"
                    type="number"
                    value={orderQty}
                    onChange={(e) => setOrderQty(e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="mt-4">
                  <Button onClick={addToCart} className="w-full">
                    Add to Cart
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Cart + totals */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-800 p-4">
              <div className="text-sm font-semibold">Cart</div>
              <div className="text-xs text-zinc-500">{cart.length} item(s)</div>
            </div>

            <div className="max-h-[360px] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
                  <tr className="text-xs text-zinc-400">
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3 w-28">Price</th>
                    <th className="px-4 py-3 w-28">Qty</th>
                    <th className="px-4 py-3 w-32">Line Total</th>
                    <th className="px-4 py-3 w-28 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center">
                        <div className="text-sm font-medium">Cart is empty</div>
                        <div className="mt-1 text-xs text-zinc-500">
                          Select an item and add quantity to begin.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    cart.map((l) => (
                      <tr key={l.itemId} className="border-b border-zinc-800/70 hover:bg-zinc-950/40 transition">
                        <td className="px-4 py-3 font-medium">{l.description}</td>
                        <td className="px-4 py-3 text-zinc-300">Rs {l.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/40 px-2 py-1.5">
                            <button
                              onClick={() => decQty(l.itemId)}
                              className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-1.5 text-zinc-200 transition hover:bg-zinc-900"
                              aria-label="Decrease"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold">{l.qty}</span>
                            <button
                              onClick={() => incQty(l.itemId)}
                              className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-1.5 text-zinc-200 transition hover:bg-zinc-900"
                              aria-label="Increase"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-zinc-200">
                          Rs {(l.qty * l.unitPrice).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <button
                              onClick={() => removeLine(l.itemId)}
                              className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-200 transition hover:bg-zinc-900"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-zinc-800 p-4 text-xs text-zinc-500">Sticky header • glassy surface</div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-sm">
            <div className="text-sm font-semibold">Totals</div>

            <div className="mt-4 space-y-3">
              <Row label="Subtotal" value={`Rs ${cartSubtotal.toFixed(2)}`} />
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <Tag className="h-4 w-4 text-zinc-500" />
                      Discount
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <Select
                        value={discountMode}
                        onChange={(e) => setDiscountMode(e.target.value)}
                        label="Mode"
                      >
                        <option value="percent">Percent (%)</option>
                        <option value="fixed">Fixed</option>
                      </Select>
                      <Input
                        label={discountMode === "percent" ? "Value (%)" : "Value"}
                        type="number"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        placeholder={discountMode === "percent" ? "0" : "0.00"}
                      />
                    </div>
                    <div className="mt-2 text-xs text-zinc-500">
                      <span className="inline-flex items-center gap-2">
                        <BadgePercent className="h-4 w-4 text-zinc-500" />
                        Discount applied: Rs {discountAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-zinc-400">Tax</div>
                    <div className="mt-1 text-sm font-semibold">{taxEnabled ? "Enabled" : "Disabled"}</div>
                    <div className="mt-1 text-xs text-zinc-500">Rate: {(TAX_RATE * 100).toFixed(0)}%</div>
                  </div>
                  <button
                    onClick={() => setTaxEnabled((v) => !v)}
                    className={[
                      "relative h-9 w-16 rounded-full border transition",
                      taxEnabled ? "border-zinc-700 bg-zinc-200" : "border-zinc-800 bg-zinc-950/40",
                    ].join(" ")}
                    aria-label="Toggle tax"
                  >
                    <span
                      className={[
                        "absolute top-1/2 h-7 w-7 -translate-y-1/2 rounded-full transition",
                        taxEnabled ? "left-8 bg-black" : "left-1 bg-zinc-800",
                      ].join(" ")}
                    />
                  </button>
                </div>
                <div className="mt-3 text-xs text-zinc-500">
                  Tax amount: Rs {taxAmount.toFixed(2)}
                </div>
              </div>

              <Row label="Grand Total" value={`Rs ${grandTotal.toFixed(2)}`} strong />
            </div>

            <div className="mt-4">
              <Button onClick={placeOrder} className="w-full">
                Place Order
              </Button>
              <div className="mt-2 text-xs text-zinc-500">
                Placing an order reduces item stock locally and clears the cart.
              </div>
            </div>
          </div>

          {orders.length > 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Recent Orders</div>
                <div className="text-xs text-zinc-500">{orders.length} total</div>
              </div>
              <div className="mt-4 space-y-3">
                {orders.slice(0, 3).map((o) => (
                  <div key={o.id} className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">{o.orderId}</div>
                        <div className="mt-1 text-xs text-zinc-400">
                          {o.date} • {o.customerName}
                        </div>
                      </div>
                      <div className="text-sm font-semibold">Rs {o.total.toFixed(2)}</div>
                    </div>
                    <div className="mt-2 text-xs text-zinc-500">
                      Lines: {o.lines.length} • Discount: Rs {o.discountAmount.toFixed(2)} • Tax: Rs{" "}
                      {o.taxAmount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <Modal
        open={successOpen}
        title="Order placed successfully"
        onClose={() => setSuccessOpen(false)}
        footer={
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setSuccessOpen(false)} className="w-full sm:w-auto">
              Close
            </Button>
            <Button onClick={() => setSuccessOpen(false)} className="w-full sm:w-auto">
              Continue
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
            <div className="text-xs text-zinc-400">Order</div>
            <div className="mt-2 text-sm font-semibold">{makeOrderId(orderSeq - 1)}</div>
            <div className="mt-1 text-xs text-zinc-500">Inventory updated locally • cart cleared</div>
          </div>
          <div className="text-sm text-zinc-300">
            You can place the next order now. Order ID auto-increments.
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3">
      <div className="text-xs text-zinc-400">{label}</div>
      <div className={strong ? "text-base font-semibold" : "text-sm font-medium"}>{value}</div>
    </div>
  );
}
