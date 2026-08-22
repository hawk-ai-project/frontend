export const ROLES = Object.freeze({
  USER: "USER",
  ADMIN: "ADMIN",
  INSPECTOR: "INSPECTOR",
  FIELD_INSPECTOR: "FIELD_INSPECTOR",
});

export const isFieldInspectorRole = (role) =>
  role === ROLES.INSPECTOR || role === ROLES.FIELD_INSPECTOR;