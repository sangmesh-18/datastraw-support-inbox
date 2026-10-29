
export const knowledgeBase = {
  brandName: "Verdant Co",

  policies: {
    shipping: {
      title: "Shipping and Delivery",
      rules: [
        "Answer shipping questions using confirmed brand policy information.",
        "If a delivery timeframe is not available, do not invent one.",
        "If an order is delayed, acknowledge the customer's concern."
      ]
    },

    addressChanges: {
      title: "Address Changes",
      rules: [
        "An address change is allowed only before the order is shipped.",
        "The request must be made within 12 hours.",
        "If shipment status or order timing is unknown, ask for clarification or agent review."
      ]
    },

    cancellations: {
      title: "Order Cancellations",
      rules: [
        "Use the confirmed cancellation policy when responding.",
        "Do not promise a cancellation without confirming eligibility."
      ]
    },

    returnsAndRefunds: {
      title: "Returns and Refunds",
      rules: [
        "Use the confirmed return and refund policy.",
        "Do not invent return windows, refund timelines, or eligibility conditions."
      ]
    },

    cashOnDelivery: {
      title: "Cash on Delivery",
      rules: [
        "COD is available for orders below ₹3000.",
        "A ₹50 COD fee applies."
      ]
    },

    products: {
      title: "Product Information",
      rules: [
        "The brand offers fragrance-free products.",
        "The brand offers vegan products.",
        "Do not claim that a specific product has these properties unless confirmed."
      ]
    }
  },

  responseGuidelines: [
    "Be polite, clear, and empathetic.",
    "Answer only using the available knowledge base and verified order information.",
    "Never invent policies, order statuses, delivery dates, or refund timelines.",
    "If information is missing, explain that it needs confirmation.",
    "Draft replies for agent review; never send them directly to customers."
  ]
};
