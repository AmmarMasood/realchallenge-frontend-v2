/**
 * Helper functions for role checking in React components
 * Centralized role checking logic to avoid duplicating conditions across components
 */

/**
 * Check if user has a specific role
 * @param {Object} userInfo - User info from context
 * @param {String} role - Role to check
 * @returns {Boolean} - True if user has the role
 */
export const hasRole = (userInfo, role) => {
  if (!userInfo || !userInfo.roles || !Array.isArray(userInfo.roles)) {
    return false;
  }
  return userInfo.roles.includes(role);
};

/**
 * Check if user has ANY of the specified roles (OR logic)
 * @param {Object} userInfo - User info from context
 * @param {Array|String} roles - Single role or array of roles
 * @returns {Boolean} - True if user has at least one of the specified roles
 */
export const hasAnyRole = (userInfo, roles) => {
  if (!userInfo || !userInfo.roles || !Array.isArray(userInfo.roles)) {
    return false;
  }

  const rolesArray = Array.isArray(roles) ? roles : [roles];
  return userInfo.roles.some(userRole => rolesArray.includes(userRole));
};

/**
 * Check if user has ALL of the specified roles (AND logic)
 * @param {Object} userInfo - User info from context
 * @param {Array|String} roles - Single role or array of roles
 * @returns {Boolean} - True if user has all of the specified roles
 */
export const hasAllRoles = (userInfo, roles) => {
  if (!userInfo || !userInfo.roles || !Array.isArray(userInfo.roles)) {
    return false;
  }

  const rolesArray = Array.isArray(roles) ? roles : [roles];
  return rolesArray.every(role => userInfo.roles.includes(role));
};

/**
 * Check if user has ONLY the customer role (no other roles)
 * @param {Object} userInfo - User info from context
 * @returns {Boolean} - True if user has only customer role
 */
export const isOnlyCustomer = (userInfo) => {
  if (!userInfo || !userInfo.roles || !Array.isArray(userInfo.roles)) {
    return false;
  }
  return userInfo.roles.length === 1 && userInfo.roles[0] === "customer";
};

/**
 * Check if user has any admin/management role
 * @param {Object} userInfo - User info from context
 * @returns {Boolean} - True if user has any non-customer role
 */
export const hasAdminAccess = (userInfo) => {
  return hasAnyRole(userInfo, ["admin", "trainer", "nutrist", "blogger", "shopmanager"]);
};

/**
 * Get all roles the user has
 * @param {Object} userInfo - User info from context
 * @returns {Array} - Array of user's roles, or empty array if not authenticated
 */
export const getUserRoles = (userInfo) => {
  if (!userInfo || !userInfo.roles || !Array.isArray(userInfo.roles)) {
    return [];
  }
  return userInfo.roles;
};

/**
 * Get primary role (first role in array)
 * @param {Object} userInfo - User info from context
 * @returns {String|null} - Primary role or null if not authenticated
 */
export const getPrimaryRole = (userInfo) => {
  if (!userInfo || !userInfo.roles || !Array.isArray(userInfo.roles) || userInfo.roles.length === 0) {
    return null;
  }
  return userInfo.roles[0];
};

/**
 * Validate role combinations
 * Rules:
 * - Admin can ONLY be alone (["admin"])
 * - Customer can ONLY be alone (["customer"])
 * - Other roles can be combined (["trainer", "blogger"])
 * @param {Array} roles - Array of roles to validate
 * @returns {Object} - { isValid: boolean, message: string }
 */
export const validateRoleCombination = (roles) => {
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    return { isValid: false, message: "User must have at least one role" };
  }

  // If "admin" is present, it must be the only role
  if (roles.includes("admin") && roles.length > 1) {
    return { isValid: false, message: "Admin role cannot be combined with other roles" };
  }

  // If "customer" is present, it must be the only role
  if (roles.includes("customer") && roles.length > 1) {
    return { isValid: false, message: "Customer role cannot be combined with other roles" };
  }

  return { isValid: true, message: "Role combination is valid" };
};

/**
 * Get available roles that can be combined with the given role
 * Used to disable invalid role combinations in UI
 * @param {String} selectedRole - The role to check
 * @returns {Array} - Array of roles that can be selected with this role
 */
export const getCompatibleRoles = (selectedRole) => {
  const allRoles = ["admin", "trainer", "nutrist", "blogger", "shopmanager", "customer"];

  if (!selectedRole) {
    return allRoles;
  }

  // Admin and customer can only be selected alone
  if (selectedRole === "admin" || selectedRole === "customer") {
    return [selectedRole];
  }

  // Other roles cannot be combined with admin or customer
  return allRoles.filter(role => role !== "admin" && role !== "customer" && role !== selectedRole);
};

/**
 * Check if a role can be added to existing roles
 * @param {String} roleToAdd - Role being considered
 * @param {Array} currentRoles - Currently selected roles
 * @returns {Boolean} - True if role can be added
 */
export const canAddRole = (roleToAdd, currentRoles = []) => {
  const testRoles = [...currentRoles, roleToAdd];
  const validation = validateRoleCombination(testRoles);
  return validation.isValid;
};
