export type RoleOption = {
  value: number;
  label: string;
  color: string;
  background: string;
  border: string;
};

export const ROLE_OPTIONS: RoleOption[] = [
  {
    value: 1,
    label: "Admin",
    color: "#0067E8",
    background: "rgba(0, 216, 243, 0.08)",
    border: "rgba(0, 216, 243, 0.18)",
  },
  {
    value: 2,
    label: "Retailer",
    color: "#0067E8",
    background: "rgba(0, 216, 243, 0.12)",
    border: "rgba(0, 216, 243, 0.2)",
  },
  {
    value: 3,
    label: "Dealer",
    color: "#041B39",
    background: "rgba(4, 27, 57, 0.12)",
    border: "rgba(4, 27, 57, 0.2)",
  },
  {
    value: 4,
    label: "Salesman",
    color: "#2A7794",
    background: "rgba(42, 119, 148, 0.12)",
    border: "rgba(42, 119, 148, 0.2)",
  },
  {
    value: 5,
    label: "Staff",
    color: "#244D68",
    background: "rgba(36, 77, 104, 0.12)",
    border: "rgba(36, 77, 104, 0.2)",
  },
  {
    value: 6,
    label: "Delivery Man",
    color: "#041B39",
    background: "rgba(0, 216, 243, 0.12)",
    border: "rgba(0, 216, 243, 0.2)",
  },
];

const DEFAULT_ROLE_META = {
  label: "Unknown Role",
  color: "#475569",
  background: "rgba(148, 163, 184, 0.12)",
  border: "rgba(148, 163, 184, 0.2)",
};

export const getRoleMeta = (roleId?: number) =>
  ROLE_OPTIONS.find((role) => role.value === roleId) || {
    ...DEFAULT_ROLE_META,
    label: `Role ${roleId ?? "-"}`,
  };

export const isSupportedRoleId = (roleId?: number) =>
  ROLE_OPTIONS.some((role) => role.value === roleId);
