const { pool } = require("../config/database");

const mapUser = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    countryCode: row.country_code || "+91",
    mobile: row.mobile,
    company: row.company,
    designation: row.designation,
    gender: row.gender,
    city: row.city,
    country: row.country,
    pincode: row.pincode,
    profileImageUrl: row.profile_image_url,
    badgeCategory: row.badge_category,
    passwordHash: row.password_hash,
    emailVerified: Boolean(row.email_verified),
    mobileVerified: Boolean(row.mobile_verified),
    createdAt: row.created_at,
  };
};

const findUserByEmail = async (email) => {
  const [rows] = await pool.execute("SELECT * FROM users WHERE email = ? LIMIT 1", [
    email,
  ]);

  return mapUser(rows[0]);
};

const findUserById = async (id) => {
  const [rows] = await pool.execute("SELECT * FROM users WHERE id = ? LIMIT 1", [
    id,
  ]);

  return mapUser(rows[0]);
};

const findUserByMobile = async (mobile) => {
  const [rows] = await pool.execute("SELECT * FROM users WHERE mobile = ? LIMIT 1", [
    mobile,
  ]);

  return mapUser(rows[0]);
};

const createUser = async ({
  firstName,
  lastName = "",
  email,
  countryCode = "+91",
  mobile,
  passwordHash,
  emailVerified = false,
  mobileVerified = false,
}) => {
  const [result] = await pool.execute(
    `INSERT INTO users (
      first_name,
      last_name,
      email,
      country_code,
      mobile,
      company,
      designation,
      city,
      country,
      pincode,
      email_verified,
      mobile_verified,
      password_hash
    )
     VALUES (?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, NULL, ?, ?, ?)`,
    [
      firstName,
      lastName,
      email,
      countryCode,
      mobile,
      emailVerified,
      mobileVerified,
      passwordHash,
    ]
  );

  return {
    id: result.insertId,
    firstName,
    lastName,
    email,
    countryCode,
    mobile,
    company: null,
    designation: null,
    city: null,
    country: null,
    pincode: null,
    profileImageUrl: null,
    emailVerified,
    mobileVerified,
  };
};

/**
 * Save extra profile fields coming from the Edit Profile screen.
 */
const updateUserProfileDetails = async ({
  email,
  firstName,
  lastName = "",
  countryCode = "+91",
  mobileNumber,
  company,
  designation,
  gender,
  city,
  country,
  pincode,
}) => {
  await pool.execute(
    `UPDATE users
     SET first_name = ?, last_name = ?, country_code = ?, mobile = ?, company = ?, designation = ?, gender = ?, city = ?, country = ?, pincode = ?
     WHERE email = ?`,
    [
      firstName,
      lastName,
      countryCode,
      mobileNumber,
      company,
      designation,
      gender,
      city,
      country,
      pincode,
      email,
    ]
  );

  return findUserByEmail(email);
};

const updateUserPasswordByEmail = async ({ email, passwordHash }) => {
  await pool.execute(
    `UPDATE users
     SET password_hash = ?
     WHERE email = ?`,
    [passwordHash, email]
  );

  return findUserByEmail(email);
};

const updateUserProfileImage = async ({ userId, profileImageUrl }) => {
  await pool.execute(
    `UPDATE users
     SET profile_image_url = ?
     WHERE id = ?`,
    [profileImageUrl, userId]
  );

  return findUserById(userId);
};

module.exports = {
  findUserByEmail,
  findUserById,
  findUserByMobile,
  createUser,
  updateUserProfileDetails,
  updateUserProfileImage,
  updateUserPasswordByEmail,
};
