import "server-only";

export function getCustomerRoleValues() {
  const values = (process.env.SATHI_CUSTOMER_ROLE_VALUES || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (values.length === 0) {
    const error = new Error("SATHI_CUSTOMER_ROLE_VALUES is not configured.");
    error.code = "CUSTOMER_ROLE_CONFIG_MISSING";
    throw error;
  }
  return values;
}
