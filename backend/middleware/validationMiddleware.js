// Validation rules based on specifications:
// - Name: Min 20 characters, Max 60 characters
// - Address: Max 400 characters
// - Password: 8-16 characters, must include at least one uppercase letter and one special character
// - Email: Must follow standard email validation rules

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
// Password regex: 8-16 characters, >=1 uppercase, >=1 special character
const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

const validateUserData = (req, res, next) => {
  const { name, email, password, address, role } = req.body;
  const errors = [];

  // Name validation
  if (!name || typeof name !== 'string') {
    errors.push('Name is required.');
  } else {
    const trimmedName = name.trim();
    if (trimmedName.length < 20 || trimmedName.length > 60) {
      errors.push('Name must be between 20 and 60 characters.');
    }
  }

  // Email validation
  if (!email || typeof email !== 'string') {
    errors.push('Email is required.');
  } else if (!emailRegex.test(email.trim())) {
    errors.push('Email must follow standard email validation rules (e.g. user@domain.com).');
  }

  // Password validation (only when creating user or updating password)
  if (password !== undefined) {
    if (typeof password !== 'string' || !passwordRegex.test(password)) {
      errors.push('Password must be 8-16 characters long and include at least one uppercase letter and one special character.');
    }
  }

  // Address validation
  if (!address || typeof address !== 'string') {
    errors.push('Address is required.');
  } else if (address.trim().length > 400) {
    errors.push('Address must not exceed 400 characters.');
  }

  // Role validation if provided
  if (role !== undefined && !['ADMIN', 'USER', 'OWNER'].includes(role)) {
    errors.push('Role must be one of: ADMIN, USER, OWNER.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

const validateStoreData = (req, res, next) => {
  const { name, email, address } = req.body;
  const errors = [];

  // Name validation
  if (!name || typeof name !== 'string') {
    errors.push('Store name is required.');
  } else {
    const trimmedName = name.trim();
    if (trimmedName.length < 20 || trimmedName.length > 60) {
      errors.push('Store Name must be between 20 and 60 characters.');
    }
  }

  // Email validation
  if (!email || typeof email !== 'string') {
    errors.push('Store email is required.');
  } else if (!emailRegex.test(email.trim())) {
    errors.push('Store email must follow standard email validation rules.');
  }

  // Address validation
  if (!address || typeof address !== 'string') {
    errors.push('Store address is required.');
  } else if (address.trim().length > 400) {
    errors.push('Store address must not exceed 400 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

const validatePasswordUpdate = (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const errors = [];

  if (!oldPassword) {
    errors.push('Current password is required.');
  }

  if (!newPassword || typeof newPassword !== 'string' || !passwordRegex.test(newPassword)) {
    errors.push('New password must be 8-16 characters long and include at least one uppercase letter and one special character.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

const validateRating = (req, res, next) => {
  const { rating } = req.body;
  const r = parseInt(rating, 10);

  if (isNaN(r) || r < 1 || r > 5) {
    return res.status(400).json({
      success: false,
      errors: ['Rating must be an integer between 1 and 5.']
    });
  }

  req.body.rating = r;
  next();
};

module.exports = {
  validateUserData,
  validateStoreData,
  validatePasswordUpdate,
  validateRating,
  emailRegex,
  passwordRegex
};
