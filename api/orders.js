export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { customerName, phone, orderType = "takeaway", items, notes = "" } = req.body || {};

    if (
      typeof customerName !== "string" ||
      !customerName.trim() ||
      !/^\+?[0-9 ()-]{8,16}$/.test(phone ?? "") ||
      !Array.isArray(items) ||
      !items.length
    ) {
      return res.status(400).json({
        error: "Please provide your name, a valid phone number and at least one menu item."
      });
    }

    const orderCode =
      "AN-" + Math.random().toString(16).slice(2, 8).toUpperCase();

    const total = items.reduce(
      (sum, item) =>
        sum + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );

    return res.status(201).json({
      orderCode,
      total,
      status: "received",
      message: "Your order has been received by Annam."
    });
  } catch {
    return res.status(500).json({
      error: "Something went wrong on the server."
    });
  }
}
