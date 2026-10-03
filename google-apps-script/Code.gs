/**
 * =========================================================================
 * CONTENT PLANNER - GOOGLE APPS SCRIPT BACKEND
 * Multi-User Authentication & Isolated Content Database for Google Sheets
 * =========================================================================
 *
 * HOW TO SETUP:
 * 1. Open Google Sheets (create a new blank spreadsheet or use an existing one).
 * 2. Click Extensions > Apps Script.
 * 3. Delete any code in Code.gs and paste this entire file.
 * 4. (Optional) Run the "setupDatabase()" function once from the dropdown to initialize sheets.
 * 5. Click "Deploy" > "New deployment".
 * 6. Select type: "Web app".
 * 7. Set Description: "Content Planner API v1".
 * 8. Set Execute as: "Me" (your Google account).
 * 9. Set Who has access: "Anyone" (allows the frontend to send API requests).
 * 10. Click "Deploy", authorize permissions, and copy the Web App URL!
 * 11. Paste that URL into the Content Planner settings or .env file (VITE_APPS_SCRIPT_URL).
 * =========================================================================
 */

// Configuration Constants
var CONFIG = {
  SESSION_EXPIRY_DAYS: 7,
  VERIFY_TOKEN_EXPIRY_HOURS: 24,
  RESET_TOKEN_EXPIRY_HOURS: 2,
  APP_NAME: "Content Planner",
  SALT_SECRET: "cp_secure_salt_key_2026",
};

/**
 * Handle HTTP GET Requests
 */
function doGet(e) {
  return handleRequest(e, "GET");
}

/**
 * Handle HTTP POST Requests
 */
function doPost(e) {
  return handleRequest(e, "POST");
}

/**
 * Unified Request Handler with CORS & Action Dispatcher
 */
function handleRequest(e, method) {
  var output;
  try {
    var params = {};
    
    // Parse GET query parameters
    if (e && e.parameter) {
      for (var key in e.parameter) {
        params[key] = e.parameter[key];
      }
    }

    // Parse POST JSON payload or form data
    if (e && e.postData && e.postData.contents) {
      try {
        var postObj = JSON.parse(e.postData.contents);
        for (var pKey in postObj) {
          params[pKey] = postObj[pKey];
        }
      } catch (err) {
        // Fallback for form-encoded or raw data
        params.rawPayload = e.postData.contents;
      }
    }

    var action = params.action || (params.p ? params.p : "");

    // Dispatch action
    var result = dispatchAction(action, params);
    output = ContentService.createTextOutput(JSON.stringify(result));
  } catch (err) {
    output = ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString(),
    }));
  }

  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

/**
 * Retrieve spreadsheet from:
 * 1. Active Container-bound sheet (Extensions > Apps Script inside Google Sheet)
 * 2. Parameter spreadsheet_id (ID or full Google Sheet URL)
 * 3. ScriptProperties "SPREADSHEET_ID"
 * 4. Auto-created new Google Spreadsheet if standalone
 */
function getOrInitSpreadsheet(params) {
  var ss = null;

  // 1. Container-bound
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) return ss;
  } catch (e) {}

  // 2. Direct parameter
  if (params && params.spreadsheet_id) {
    var rawParam = String(params.spreadsheet_id).trim();
    var matchParam = rawParam.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    var cleanId = matchParam ? matchParam[1] : rawParam;
    try {
      ss = SpreadsheetApp.openById(cleanId);
      if (ss) {
        PropertiesService.getScriptProperties().setProperty("SPREADSHEET_ID", cleanId);
        return ss;
      }
    } catch (e) {
      Logger.log("Failed opening spreadsheet from params: " + e.toString());
    }
  }

  // 3. Stored in ScriptProperties
  try {
    var savedId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
    if (savedId) {
      ss = SpreadsheetApp.openById(savedId);
      if (ss) return ss;
    }
  } catch (e) {}

  // 4. Standalone fallback: Auto-create in Google Drive!
  try {
    ss = SpreadsheetApp.create("Content Planner Database");
    var newId = ss.getId();
    PropertiesService.getScriptProperties().setProperty("SPREADSHEET_ID", newId);
    Logger.log("Auto-created new Google Spreadsheet: " + ss.getUrl());
    return ss;
  } catch (e) {
    Logger.log("Could not auto-create spreadsheet: " + e.toString());
  }

  return null;
}

/**
 * Dispatcher to corresponding controller functions
 */
function dispatchAction(action, params) {
  // Quick Ping / Health Check without crashing
  if (action === "ping" || action === "status") {
    var testSs = getOrInitSpreadsheet(params);
    if (testSs) {
      ensureSheets(testSs);
      return {
        success: true,
        message: "Content Planner Google Apps Script is active and connected!",
        connected_spreadsheet: testSs.getName(),
        spreadsheet_url: testSs.getUrl(),
        spreadsheet_id: testSs.getId(),
      };
    }
    return {
      success: true,
      message: "Content Planner Google Apps Script is active, but Google Sheet is not linked yet.",
      connected_spreadsheet: null,
    };
  }

  // Explicit linkSpreadsheet action
  if (action === "linkSpreadsheet" || action === "link_spreadsheet") {
    var linkTarget = String(params.spreadsheet_id || "").trim();
    var m = linkTarget.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    var targetId = m ? m[1] : linkTarget;
    if (!targetId) {
      return { success: false, error: "Spreadsheet ID or URL is required." };
    }
    try {
      var linkedSs = SpreadsheetApp.openById(targetId);
      PropertiesService.getScriptProperties().setProperty("SPREADSHEET_ID", targetId);
      ensureSheets(linkedSs);
      return {
        success: true,
        message: "Successfully linked to Google Sheet: " + linkedSs.getName(),
        spreadsheet_id: targetId,
        spreadsheet_url: linkedSs.getUrl(),
      };
    } catch (err) {
      return { success: false, error: "Failed to open Google Sheet: " + err.toString() };
    }
  }

  var ss = getOrInitSpreadsheet(params);
  if (!ss) {
    return {
      success: false,
      error: "Google Spreadsheet could not be opened. Please bind this script to a Google Sheet (Extensions > Apps Script) or provide spreadsheet_id in parameters.",
    };
  }
  ensureSheets(ss);

  switch (action) {
    // ---------------- AUTHENTICATION ----------------
    case "register":
      return handleRegister(ss, params);

    case "verifyEmail":
    case "verify_email":
      return handleVerifyEmail(ss, params);

    case "resendVerification":
    case "resend_verification":
      return handleResendVerification(ss, params);

    case "login":
      return handleLogin(ss, params);

    case "googleLogin":
    case "google_login":
      return handleGoogleLogin(ss, params);

    case "validateSession":
    case "validate_session":
      return handleValidateSession(ss, params);

    case "logout":
      return handleLogout(ss, params);

    case "forgotPassword":
    case "forgot_password":
      return handleForgotPassword(ss, params);

    case "resetPassword":
    case "reset_password":
      return handleResetPassword(ss, params);

    case "updateProfile":
    case "update_profile":
      return handleUpdateProfile(ss, params);

    case "changePassword":
    case "change_password":
      return handleChangePassword(ss, params);

    // ---------------- ISOLATED USER DATA ----------------
    case "getContents":
    case "get_contents":
      return handleGetContents(ss, params);

    case "saveContent":
    case "save_content":
      return handleSaveContent(ss, params);

    case "deleteContent":
    case "delete_content":
      return handleDeleteContent(ss, params);

    case "getIdeas":
    case "get_ideas":
      return handleGetIdeas(ss, params);

    case "saveIdea":
    case "save_idea":
      return handleSaveIdea(ss, params);

    case "deleteIdea":
    case "delete_idea":
      return handleDeleteIdea(ss, params);

    case "getRules":
    case "get_rules":
      return handleGetRules(ss, params);

    case "saveRules":
    case "save_rules":
      return handleSaveRules(ss, params);

    case "getSettings":
    case "get_settings":
      return handleGetSettings(ss, params);

    case "saveSettings":
    case "save_settings":
      return handleSaveSettings(ss, params);

    case "ping":
    case "status":
      return { success: true, message: "Content Planner Google Apps Script is active and connected!" };

    default:
      return { success: false, error: "Invalid action: " + action };
  }
}

/**
 * Auto-initialize database sheets with schema
 */
function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheets(ss);
  Logger.log("Database initialized successfully!");
}

function ensureSheets(ss) {
  var schema = {
    USERS: [
      "user_id", "name", "email", "password_hash", "verified", "status", "created_at", "last_login"
    ],
    SESSIONS: [
      "session_token", "user_id", "created_at", "expires_at"
    ],
    VERIFICATION_TOKENS: [
      "token", "user_id", "created_at", "expires_at", "used"
    ],
    RESET_TOKENS: [
      "token", "user_id", "created_at", "expires_at", "used"
    ],
    CONTENTS: [
      "content_id", "user_id", "date", "channel", "format", "title", "status", "brief", "caption", "data_json", "created_at", "updated_at"
    ],
    IDEAS: [
      "idea_id", "user_id", "title", "channel", "format", "pillar", "description", "status", "priority", "notes", "created_at"
    ],
    CONTENT_RULES: [
      "rule_id", "user_id", "channel", "format", "target_per_week"
    ],
    SETTINGS: [
      "user_id", "timezone", "week_start", "email_notifications", "brand_name", "niche", "pillars_json"
    ]
  };

  for (var sheetName in schema) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(schema[sheetName]);
      sheet.setFrozenRows(1);
    }
  }
}

// -------------------------------------------------------------------------
// AUTHENTICATION LOGIC
// -------------------------------------------------------------------------

/**
 * 1. Register New User
 */
function handleRegister(ss, params) {
  var name = (params.name || "").trim();
  var email = (params.email || "").trim().toLowerCase();
  var password = params.password || "";
  var appUrl = params.app_url || "";

  // Validation
  if (!name) return { success: false, error: "Nama wajib diisi." };
  if (!email) return { success: false, error: "Email wajib diisi." };
  if (!isValidEmail(email)) return { success: false, error: "Format email harus valid." };
  if (password.length < 8) return { success: false, error: "Password minimal 8 karakter." };

  var userSheet = ss.getSheetByName("USERS");
  var usersData = userSheet.getDataRange().getValues();

  // Check if email already registered
  for (var i = 1; i < usersData.length; i++) {
    if (usersData[i][2] && String(usersData[i][2]).toLowerCase() === email) {
      return { success: false, error: "An account with this email already exists." };
    }
  }

  // Generate sequential USER-XXX
  var maxNum = 0;
  for (var j = 1; j < usersData.length; j++) {
    var idStr = String(usersData[j][0]);
    if (idStr.indexOf("USER-") === 0) {
      var num = parseInt(idStr.replace("USER-", ""), 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  }
  var nextNum = maxNum + 1;
  var userId = "USER-" + padNumber(nextNum, 3);

  // Hash password
  var passwordHash = hashPassword(password);
  var now = new Date().toISOString();

  // Add user row
  userSheet.appendRow([
    userId,
    name,
    email,
    passwordHash,
    false, // verified: false initially
    "active",
    now,
    "" // last_login
  ]);

  // Seed default settings & rules for this new user
  seedDefaultUserRules(ss, userId);
  seedDefaultUserSettings(ss, userId, name);

  // Generate verification token
  var verifyToken = generateRandomToken(36);
  var expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + CONFIG.VERIFY_TOKEN_EXPIRY_HOURS);

  var tokenSheet = ss.getSheetByName("VERIFICATION_TOKENS");
  tokenSheet.appendRow([
    verifyToken,
    userId,
    now,
    expiryDate.toISOString(),
    false // used
  ]);

  // Send Verification Email
  var verifyLink = appUrl ? (appUrl + (appUrl.indexOf("?") === -1 ? "?" : "&") + "view=verify-email&token=" + verifyToken) : "";
  sendVerificationEmail(email, name, verifyLink, verifyToken);

  return {
    success: true,
    message: "Account created successfully. Please check your email to verify your account.",
    data: {
      user_id: userId,
      email: email,
      name: name,
      verified: false
    },
    verification_token_preview: verifyToken
  };
}

/**
 * 2. Verify Email via Token
 */
function handleVerifyEmail(ss, params) {
  var token = (params.token || "").trim();
  if (!token) return { success: false, error: "Verification token is required." };

  var tokenSheet = ss.getSheetByName("VERIFICATION_TOKENS");
  var tokenData = tokenSheet.getDataRange().getValues();
  var foundTokenRow = -1;
  var targetUserId = null;
  var nowTime = new Date().getTime();

  for (var i = 1; i < tokenData.length; i++) {
    if (tokenData[i][0] === token) {
      foundTokenRow = i + 1; // 1-indexed row
      targetUserId = tokenData[i][1];
      var expiresAt = new Date(tokenData[i][3]).getTime();
      var used = tokenData[i][4];

      if (used === true || used === "TRUE" || used === "true") {
        return { success: false, error: "This verification token has already been used." };
      }
      if (nowTime > expiresAt) {
        return { success: false, error: "Verification token has expired. Please request a new verification email." };
      }
      break;
    }
  }

  if (foundTokenRow === -1 || !targetUserId) {
    return { success: false, error: "Invalid verification token." };
  }

  // Mark token used
  tokenSheet.getRange(foundTokenRow, 5).setValue(true);

  // Set user verified = TRUE in USERS sheet
  var userSheet = ss.getSheetByName("USERS");
  var userData = userSheet.getDataRange().getValues();
  for (var u = 1; u < userData.length; u++) {
    if (userData[u][0] === targetUserId) {
      userSheet.getRange(u + 1, 5).setValue(true);
      return {
        success: true,
        message: "Email verified successfully! You can now log in."
      };
    }
  }

  return { success: false, error: "User not found." };
}

/**
 * 3. Resend Verification Email
 */
function handleResendVerification(ss, params) {
  var email = (params.email || "").trim().toLowerCase();
  var appUrl = params.app_url || "";
  if (!email) return { success: false, error: "Email is required." };

  var userSheet = ss.getSheetByName("USERS");
  var userData = userSheet.getDataRange().getValues();
  var userObj = null;

  for (var i = 1; i < userData.length; i++) {
    if (userData[i][2] && String(userData[i][2]).toLowerCase() === email) {
      userObj = {
        userId: userData[i][0],
        name: userData[i][1],
        email: userData[i][2],
        verified: userData[i][4]
      };
      break;
    }
  }

  if (!userObj) {
    return { success: false, error: "No account found with this email." };
  }
  if (userObj.verified === true || userObj.verified === "TRUE" || userObj.verified === "true") {
    return { success: false, error: "This email is already verified. You can log in directly." };
  }

  // Invalidate previous tokens
  var tokenSheet = ss.getSheetByName("VERIFICATION_TOKENS");
  var verifyToken = generateRandomToken(36);
  var now = new Date().toISOString();
  var expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + CONFIG.VERIFY_TOKEN_EXPIRY_HOURS);

  tokenSheet.appendRow([
    verifyToken,
    userObj.userId,
    now,
    expiryDate.toISOString(),
    false
  ]);

  var verifyLink = appUrl ? (appUrl + (appUrl.indexOf("?") === -1 ? "?" : "&") + "view=verify-email&token=" + verifyToken) : "";
  sendVerificationEmail(userObj.email, userObj.name, verifyLink, verifyToken);

  return {
    success: true,
    message: "A new verification email has been sent. Please check your inbox.",
    verification_token_preview: verifyToken
  };
}

/**
 * 4. User Login
 */
function handleLogin(ss, params) {
  var email = (params.email || "").trim().toLowerCase();
  var password = params.password || "";

  if (!email || !password) {
    return { success: false, error: "Email or password is required." };
  }

  var userSheet = ss.getSheetByName("USERS");
  var userData = userSheet.getDataRange().getValues();
  var matchedUser = null;
  var matchedRow = -1;

  var passwordHash = hashPassword(password);

  for (var i = 1; i < userData.length; i++) {
    if (userData[i][2] && String(userData[i][2]).toLowerCase() === email) {
      var storedHash = userData[i][3];
      if (storedHash === passwordHash) {
        matchedUser = {
          user_id: userData[i][0],
          name: userData[i][1],
          email: userData[i][2],
          verified: userData[i][4] === true || userData[i][4] === "TRUE" || userData[i][4] === "true",
          status: userData[i][5],
          created_at: userData[i][6],
          last_login: userData[i][7]
        };
        matchedRow = i + 1;
      }
      break;
    }
  }

  if (!matchedUser) {
    return { success: false, error: "Email or password is incorrect." };
  }

  // Check verified
  if (!matchedUser.verified) {
    return {
      success: false,
      error: "Please verify your email before continuing.",
      needs_verification: true,
      email: matchedUser.email
    };
  }

  // Check status
  if (matchedUser.status === "suspended") {
    return { success: false, error: "Your account has been suspended. Please contact support." };
  }

  // Update last login in USERS sheet
  var now = new Date();
  var nowIso = now.toISOString();
  userSheet.getRange(matchedRow, 8).setValue(nowIso);
  matchedUser.last_login = nowIso;

  // Create session
  var sessionToken = generateRandomToken(48);
  var sessionExpiry = new Date();
  sessionExpiry.setDate(sessionExpiry.getDate() + CONFIG.SESSION_EXPIRY_DAYS);

  var sessionSheet = ss.getSheetByName("SESSIONS");
  sessionSheet.appendRow([
    sessionToken,
    matchedUser.user_id,
    nowIso,
    sessionExpiry.toISOString()
  ]);

  var sessionObj = {
    session_token: sessionToken,
    user_id: matchedUser.user_id,
    email: matchedUser.email,
    name: matchedUser.name,
    login_time: nowIso,
    session_expiry: sessionExpiry.toISOString()
  };

  return {
    success: true,
    message: "Login successful.",
    data: {
      user: matchedUser,
      session: sessionObj
    }
  };
}

/**
 * 4B. Direct Google Email Sign In
 * Instant login or registration with pre-verified status for Google accounts
 */
function handleGoogleLogin(ss, params) {
  var email = (params.email || "").trim().toLowerCase();
  var name = (params.name || "").trim();
  if (!name && email) {
    name = email.split("@")[0];
    name = name.charAt(0).toUpperCase() + name.slice(1);
  }

  if (!email || !isValidEmail(email)) {
    return { success: false, error: "Valid Google email address is required." };
  }

  var userSheet = ss.getSheetByName("USERS");
  var userData = userSheet.getDataRange().getValues();
  var matchedUser = null;
  var matchedRow = -1;

  for (var i = 1; i < userData.length; i++) {
    if (userData[i][2] && String(userData[i][2]).toLowerCase() === email) {
      matchedUser = {
        user_id: userData[i][0],
        name: userData[i][1],
        email: userData[i][2],
        verified: true,
        status: userData[i][5] || "active",
        created_at: userData[i][6],
        last_login: userData[i][7]
      };
      matchedRow = i + 1;
      break;
    }
  }

  var now = new Date().toISOString();

  // If user doesn't exist yet, auto-register them with verified = true
  if (!matchedUser) {
    var maxNum = 0;
    for (var j = 1; j < userData.length; j++) {
      var idStr = String(userData[j][0]);
      if (idStr.indexOf("USER-") === 0) {
        var num = parseInt(idStr.replace("USER-", ""), 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    }
    var userId = "USER-" + padNumber(maxNum + 1, 3);
    var dummyHash = hashPassword(generateRandomToken(20));

    userSheet.appendRow([
      userId,
      name,
      email,
      dummyHash,
      true, // verified: true for Google login
      "active",
      now,
      now
    ]);

    seedDefaultUserRules(ss, userId);
    seedDefaultUserSettings(ss, userId, name);

    matchedUser = {
      user_id: userId,
      name: name,
      email: email,
      verified: true,
      status: "active",
      created_at: now,
      last_login: now
    };
  } else {
    // Ensure verified = true and update last_login
    userSheet.getRange(matchedRow, 5).setValue(true);
    userSheet.getRange(matchedRow, 8).setValue(now);
  }

  // Generate 7-day session token
  var sessionToken = generateRandomToken(48);
  var sessionExpiry = new Date();
  sessionExpiry.setDate(sessionExpiry.getDate() + CONFIG.SESSION_EXPIRY_DAYS);

  var sessionSheet = ss.getSheetByName("SESSIONS");
  sessionSheet.appendRow([
    sessionToken,
    matchedUser.user_id,
    now,
    sessionExpiry.toISOString()
  ]);

  return {
    success: true,
    data: {
      user: {
        user_id: matchedUser.user_id,
        name: matchedUser.name,
        email: matchedUser.email,
        verified: true,
        status: matchedUser.status || "active",
        created_at: matchedUser.created_at || now,
        last_login: now
      },
      session: {
        session_token: sessionToken,
        user_id: matchedUser.user_id,
        email: matchedUser.email,
        name: matchedUser.name,
        login_time: now,
        session_expiry: sessionExpiry.toISOString()
      }
    }
  };
}

/**
 * 5. Validate Active Session
 */
function handleValidateSession(ss, params) {
  var sessionToken = params.session_token || params.token || "";
  var session = getValidSession(ss, sessionToken);

  if (!session) {
    return { success: false, error: "Your session has expired. Please log in again." };
  }

  var user = getUserById(ss, session.user_id);
  if (!user) {
    return { success: false, error: "User associated with session not found." };
  }

  return {
    success: true,
    data: {
      user: user,
      session: session
    }
  };
}

/**
 * 6. Logout
 */
function handleLogout(ss, params) {
  var sessionToken = params.session_token || params.token || "";
  if (sessionToken) {
    var sessionSheet = ss.getSheetByName("SESSIONS");
    var sessionData = sessionSheet.getDataRange().getValues();
    for (var i = 1; i < sessionData.length; i++) {
      if (sessionData[i][0] === sessionToken) {
        sessionSheet.deleteRow(i + 1);
        break;
      }
    }
  }
  return { success: true, message: "Logged out successfully." };
}

/**
 * 7. Forgot Password
 */
function handleForgotPassword(ss, params) {
  var email = (params.email || "").trim().toLowerCase();
  var appUrl = params.app_url || "";
  if (!email) return { success: false, error: "Email is required." };

  var userSheet = ss.getSheetByName("USERS");
  var userData = userSheet.getDataRange().getValues();
  var userObj = null;

  for (var i = 1; i < userData.length; i++) {
    if (userData[i][2] && String(userData[i][2]).toLowerCase() === email) {
      userObj = {
        userId: userData[i][0],
        name: userData[i][1],
        email: userData[i][2]
      };
      break;
    }
  }

  // For security, standard practice confirms message even if email not registered, but return success
  if (!userObj) {
    return {
      success: true,
      message: "If an account exists with this email, a password reset link has been sent."
    };
  }

  var resetToken = generateRandomToken(40);
  var now = new Date().toISOString();
  var expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + CONFIG.RESET_TOKEN_EXPIRY_HOURS);

  var resetSheet = ss.getSheetByName("RESET_TOKENS");
  resetSheet.appendRow([
    resetToken,
    userObj.userId,
    now,
    expiryDate.toISOString(),
    false // used
  ]);

  var resetLink = appUrl ? (appUrl + (appUrl.indexOf("?") === -1 ? "?" : "&") + "view=reset-password&token=" + resetToken) : "";
  sendPasswordResetEmail(userObj.email, userObj.name, resetLink, resetToken);

  return {
    success: true,
    message: "A password reset link has been sent to your email.",
    reset_token_preview: resetToken
  };
}

/**
 * 8. Reset Password
 */
function handleResetPassword(ss, params) {
  var token = (params.token || "").trim();
  var newPassword = params.new_password || "";

  if (!token) return { success: false, error: "Reset token is required." };
  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: "Password must be at least 8 characters long." };
  }

  var resetSheet = ss.getSheetByName("RESET_TOKENS");
  var resetData = resetSheet.getDataRange().getValues();
  var foundRow = -1;
  var targetUserId = null;
  var nowTime = new Date().getTime();

  for (var i = 1; i < resetData.length; i++) {
    if (resetData[i][0] === token) {
      foundRow = i + 1;
      targetUserId = resetData[i][1];
      var expiresAt = new Date(resetData[i][3]).getTime();
      var used = resetData[i][4];

      if (used === true || used === "TRUE" || used === "true") {
        return { success: false, error: "This password reset token has already been used." };
      }
      if (nowTime > expiresAt) {
        return { success: false, error: "Password reset link has expired. Please request a new one." };
      }
      break;
    }
  }

  if (foundRow === -1 || !targetUserId) {
    return { success: false, error: "Invalid password reset token." };
  }

  // Mark token used
  resetSheet.getRange(foundRow, 5).setValue(true);

  // Update password_hash in USERS sheet
  var newHash = hashPassword(newPassword);
  var userSheet = ss.getSheetByName("USERS");
  var userData = userSheet.getDataRange().getValues();

  for (var u = 1; u < userData.length; u++) {
    if (userData[u][0] === targetUserId) {
      userSheet.getRange(u + 1, 4).setValue(newHash);
      return {
        success: true,
        message: "Password has been reset successfully. Please log in with your new password."
      };
    }
  }

  return { success: false, error: "User not found." };
}

/**
 * 9. Update Profile (Name)
 */
function handleUpdateProfile(ss, params) {
  var sessionToken = params.session_token || "";
  var session = getValidSession(ss, sessionToken);
  if (!session) return { success: false, error: "Your session has expired. Please log in again." };

  var newName = (params.name || "").trim();
  if (!newName) return { success: false, error: "Name cannot be empty." };

  var userSheet = ss.getSheetByName("USERS");
  var userData = userSheet.getDataRange().getValues();

  for (var i = 1; i < userData.length; i++) {
    if (userData[i][0] === session.user_id) {
      userSheet.getRange(i + 1, 2).setValue(newName);
      return {
        success: true,
        message: "Profile updated successfully.",
        data: { name: newName }
      };
    }
  }

  return { success: false, error: "User not found." };
}

/**
 * 10. Change Password
 */
function handleChangePassword(ss, params) {
  var sessionToken = params.session_token || "";
  var session = getValidSession(ss, sessionToken);
  if (!session) return { success: false, error: "Your session has expired. Please log in again." };

  var currentPassword = params.current_password || "";
  var newPassword = params.new_password || "";

  if (!currentPassword || !newPassword) {
    return { success: false, error: "Current password and new password are required." };
  }
  if (newPassword.length < 8) {
    return { success: false, error: "New password must be at least 8 characters." };
  }

  var currentHash = hashPassword(currentPassword);
  var userSheet = ss.getSheetByName("USERS");
  var userData = userSheet.getDataRange().getValues();

  for (var i = 1; i < userData.length; i++) {
    if (userData[i][0] === session.user_id) {
      if (userData[i][3] !== currentHash) {
        return { success: false, error: "Current password is incorrect." };
      }
      var newHash = hashPassword(newPassword);
      userSheet.getRange(i + 1, 4).setValue(newHash);
      return { success: true, message: "Password updated successfully." };
    }
  }

  return { success: false, error: "User not found." };
}

// -------------------------------------------------------------------------
// ISOLATED USER DATA LOGIC (Strictly filtered by session.user_id)
// -------------------------------------------------------------------------

/**
 * Get Contents (Filtered WHERE user_id = session.user_id)
 */
function handleGetContents(ss, params) {
  var session = getValidSession(ss, params.session_token);
  if (!session) return { success: false, error: "Unauthorized. Session expired." };

  var sheet = ss.getSheetByName("CONTENTS");
  var data = sheet.getDataRange().getValues();
  var userContents = [];

  for (var i = 1; i < data.length; i++) {
    var rowUserId = data[i][1];
    if (rowUserId === session.user_id) {
      var itemObj = {
        id: data[i][0],
        channel: data[i][3],
        format: data[i][4],
        title: data[i][5],
        date: formatDateIso(data[i][2]),
        status: data[i][6],
        creativeBrief: data[i][7],
        caption: data[i][8],
        createdAt: data[i][10],
        updatedAt: data[i][11]
      };

      // Unpack extra fields from data_json if present
      if (data[i][9]) {
        try {
          var extra = JSON.parse(data[i][9]);
          for (var k in extra) {
            itemObj[k] = extra[k];
          }
        } catch (e) {}
      }

      userContents.push(itemObj);
    }
  }

  return { success: true, data: userContents };
}

/**
 * Save / Update Content (Always stamped with session.user_id)
 */
function handleSaveContent(ss, params) {
  var session = getValidSession(ss, params.session_token);
  if (!session) return { success: false, error: "Unauthorized. Session expired." };

  var item = params.item || params;
  if (!item || !item.title) return { success: false, error: "Content title is required." };

  var sheet = ss.getSheetByName("CONTENTS");
  var data = sheet.getDataRange().getValues();
  var contentId = item.id || ("item-" + new Date().getTime());
  var now = new Date().toISOString();

  // Extract extra fields into JSON
  var extraData = {
    pillar: item.pillar || "",
    priority: item.priority || "Medium",
    hook: item.hook || "",
    cta: item.cta || "",
    visualConcept: item.visualConcept || "",
    reference: item.reference || "",
    objective: item.objective || "",
    notes: item.notes || "",
    articleTitle: item.articleTitle || "",
    targetKeyword: item.targetKeyword || "",
    searchIntent: item.searchIntent || "",
    metaTitle: item.metaTitle || "",
    metaDescription: item.metaDescription || "",
    slug: item.slug || "",
    articleOutline: item.articleOutline || "",
    articleBrief: item.articleBrief || "",
    draftArticle: item.draftArticle || "",
    featuredImage: item.featuredImage || "",
    internalLinkNotes: item.internalLinkNotes || ""
  };

  var rowIndex = -1;
  for (var i = 1; i < data.length; i++) {
    // STRICT SECURITY: Must match both content_id AND user_id!
    if (data[i][0] === contentId && data[i][1] === session.user_id) {
      rowIndex = i + 1;
      break;
    }
  }

  var rowValues = [
    contentId,
    session.user_id, // Authoritative user_id from session
    item.date || "",
    item.channel || "Instagram",
    item.format || "Reel",
    item.title || "",
    item.status || "Planned",
    item.creativeBrief || item.articleBrief || "",
    item.caption || "",
    JSON.stringify(extraData),
    rowIndex > 0 ? data[rowIndex - 1][10] : now,
    now
  ];

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  return { success: true, message: "Content saved.", data: { id: contentId } };
}

/**
 * Delete Content (Only allows if row belongs to session.user_id)
 */
function handleDeleteContent(ss, params) {
  var session = getValidSession(ss, params.session_token);
  if (!session) return { success: false, error: "Unauthorized. Session expired." };

  var contentId = params.content_id || params.id;
  if (!contentId) return { success: false, error: "Content ID is required." };

  var sheet = ss.getSheetByName("CONTENTS");
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === contentId && data[i][1] === session.user_id) {
      sheet.deleteRow(i + 1);
      return { success: true, message: "Content deleted successfully." };
    }
  }

  return { success: false, error: "Content not found or unauthorized." };
}

/**
 * Get Ideas (Filtered WHERE user_id = session.user_id)
 */
function handleGetIdeas(ss, params) {
  var session = getValidSession(ss, params.session_token);
  if (!session) return { success: false, error: "Unauthorized. Session expired." };

  var sheet = ss.getSheetByName("IDEAS");
  var data = sheet.getDataRange().getValues();
  var userIdeas = [];

  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === session.user_id) {
      userIdeas.push({
        id: data[i][0],
        title: data[i][2],
        channel: data[i][3],
        suggestedFormat: data[i][4],
        pillar: data[i][5],
        description: data[i][6],
        status: data[i][7],
        priority: data[i][8],
        notes: data[i][9],
        createdAt: data[i][10]
      });
    }
  }

  return { success: true, data: userIdeas };
}

/**
 * Save / Update Idea (Stamped with session.user_id)
 */
function handleSaveIdea(ss, params) {
  var session = getValidSession(ss, params.session_token);
  if (!session) return { success: false, error: "Unauthorized. Session expired." };

  var idea = params.idea || params;
  if (!idea || !idea.title) return { success: false, error: "Idea title is required." };

  var sheet = ss.getSheetByName("IDEAS");
  var data = sheet.getDataRange().getValues();
  var ideaId = idea.id || ("idea-" + new Date().getTime());
  var now = new Date().toISOString();

  var rowIndex = -1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === ideaId && data[i][1] === session.user_id) {
      rowIndex = i + 1;
      break;
    }
  }

  var rowValues = [
    ideaId,
    session.user_id,
    idea.title,
    idea.channel || "Instagram",
    idea.suggestedFormat || "Reel",
    idea.pillar || "Education",
    idea.description || "",
    idea.status || "Idea",
    idea.priority || "Medium",
    idea.notes || "",
    rowIndex > 0 ? data[rowIndex - 1][10] : now
  ];

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  return { success: true, message: "Idea saved.", data: { id: ideaId } };
}

/**
 * Delete Idea (Strictly session.user_id)
 */
function handleDeleteIdea(ss, params) {
  var session = getValidSession(ss, params.session_token);
  if (!session) return { success: false, error: "Unauthorized. Session expired." };

  var ideaId = params.idea_id || params.id;
  var sheet = ss.getSheetByName("IDEAS");
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === ideaId && data[i][1] === session.user_id) {
      sheet.deleteRow(i + 1);
      return { success: true, message: "Idea deleted successfully." };
    }
  }

  return { success: false, error: "Idea not found or unauthorized." };
}

/**
 * Get Content Rules
 */
function handleGetRules(ss, params) {
  var session = getValidSession(ss, params.session_token);
  if (!session) return { success: false, error: "Unauthorized. Session expired." };

  var sheet = ss.getSheetByName("CONTENT_RULES");
  var data = sheet.getDataRange().getValues();

  var rules = {
    instagram: { reel: 2, carousel: 2, photo: 1, story: 5 },
    website: { blog: 2 }
  };

  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === session.user_id) {
      var ch = data[i][2];
      var fmt = data[i][3];
      var target = parseInt(data[i][4], 10) || 0;

      if (ch === "Instagram") {
        if (fmt === "Reel") rules.instagram.reel = target;
        if (fmt === "Carousel") rules.instagram.carousel = target;
        if (fmt === "Photo") rules.instagram.photo = target;
        if (fmt === "Story") rules.instagram.story = target;
      } else if (ch === "Website") {
        if (fmt === "Blog") rules.website.blog = target;
      }
    }
  }

  return { success: true, data: rules };
}

/**
 * Save Content Rules
 */
function handleSaveRules(ss, params) {
  var session = getValidSession(ss, params.session_token);
  if (!session) return { success: false, error: "Unauthorized. Session expired." };

  var rules = params.rules;
  if (!rules) return { success: false, error: "Rules data required." };

  var sheet = ss.getSheetByName("CONTENT_RULES");
  var data = sheet.getDataRange().getValues();

  // Delete existing rules for this user
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][1] === session.user_id) {
      sheet.deleteRow(i + 1);
    }
  }

  // Insert new rule rows
  var newRows = [
    ["rule-" + new Date().getTime() + "-1", session.user_id, "Instagram", "Reel", rules.instagram.reel || 0],
    ["rule-" + new Date().getTime() + "-2", session.user_id, "Instagram", "Carousel", rules.instagram.carousel || 0],
    ["rule-" + new Date().getTime() + "-3", session.user_id, "Instagram", "Photo", rules.instagram.photo || 0],
    ["rule-" + new Date().getTime() + "-4", session.user_id, "Instagram", "Story", rules.instagram.story || 0],
    ["rule-" + new Date().getTime() + "-5", session.user_id, "Website", "Blog", rules.website.blog || 0]
  ];

  for (var r = 0; r < newRows.length; r++) {
    sheet.appendRow(newRows[r]);
  }

  return { success: true, message: "Rules updated successfully." };
}

/**
 * Get Settings
 */
function handleGetSettings(ss, params) {
  var session = getValidSession(ss, params.session_token);
  if (!session) return { success: false, error: "Unauthorized. Session expired." };

  var sheet = ss.getSheetByName("SETTINGS");
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === session.user_id) {
      var pillars = null;
      if (data[i][6]) {
        try { pillars = JSON.parse(data[i][6]); } catch (e) {}
      }
      return {
        success: true,
        data: {
          user_id: data[i][0],
          timezone: data[i][1] || "Asia/Makassar",
          week_start: data[i][2] || "Monday",
          email_notifications: data[i][3] === true || data[i][3] === "true",
          brand_name: data[i][4] || "",
          niche: data[i][5] || "",
          pillars: pillars
        }
      };
    }
  }

  // Fallback defaults
  return {
    success: true,
    data: {
      user_id: session.user_id,
      timezone: "Asia/Makassar",
      week_start: "Monday",
      email_notifications: true
    }
  };
}

/**
 * Save Settings
 */
function handleSaveSettings(ss, params) {
  var session = getValidSession(ss, params.session_token);
  if (!session) return { success: false, error: "Unauthorized. Session expired." };

  var settings = params.settings || params;
  var sheet = ss.getSheetByName("SETTINGS");
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === session.user_id) {
      rowIndex = i + 1;
      break;
    }
  }

  var pillarsJson = settings.pillars ? JSON.stringify(settings.pillars) : (rowIndex > 0 ? data[rowIndex - 1][6] : "");
  var rowValues = [
    session.user_id,
    settings.timezone || "Asia/Makassar",
    settings.week_start || "Monday",
    settings.email_notifications !== undefined ? settings.email_notifications : true,
    settings.brand_name || "",
    settings.niche || "",
    pillarsJson
  ];

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  return { success: true, message: "Settings saved successfully." };
}

// -------------------------------------------------------------------------
// HELPER UTILITIES
// -------------------------------------------------------------------------

function getValidSession(ss, token) {
  if (!token) return null;
  var sheet = ss.getSheetByName("SESSIONS");
  var data = sheet.getDataRange().getValues();
  var now = new Date().getTime();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === token) {
      var expiresAt = new Date(data[i][3]).getTime();
      if (now < expiresAt) {
        return {
          session_token: data[i][0],
          user_id: data[i][1],
          created_at: data[i][2],
          expires_at: data[i][3]
        };
      }
    }
  }
  return null;
}

function getUserById(ss, userId) {
  var sheet = ss.getSheetByName("USERS");
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      return {
        user_id: data[i][0],
        name: data[i][1],
        email: data[i][2],
        verified: data[i][4] === true || data[i][4] === "TRUE" || data[i][4] === "true",
        status: data[i][5],
        created_at: data[i][6],
        last_login: data[i][7]
      };
    }
  }
  return null;
}

function hashPassword(password) {
  var raw = password + ":" + CONFIG.SALT_SECRET;
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw, Utilities.Charset.UTF_8);
  var hex = "";
  for (var i = 0; i < digest.length; i++) {
    var byteVal = digest[i];
    if (byteVal < 0) byteVal += 256;
    var byteHex = byteVal.toString(16);
    if (byteHex.length === 1) byteHex = "0" + byteHex;
    hex += byteHex;
  }
  return hex;
}

function generateRandomToken(len) {
  var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var res = "";
  for (var i = 0; i < len; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

function padNumber(num, size) {
  var s = String(num);
  while (s.length < size) s = "0" + s;
  return s;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatDateIso(val) {
  if (!val) return "";
  if (val instanceof Date) {
    return Utilities.formatDate(val, "GMT", "yyyy-MM-dd");
  }
  var s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10);
  return s;
}

function seedDefaultUserRules(ss, userId) {
  var sheet = ss.getSheetByName("CONTENT_RULES");
  var now = new Date().getTime();
  var defaultRules = [
    ["rule-" + now + "-1", userId, "Instagram", "Reel", 2],
    ["rule-" + now + "-2", userId, "Instagram", "Carousel", 2],
    ["rule-" + now + "-3", userId, "Instagram", "Photo", 1],
    ["rule-" + now + "-4", userId, "Instagram", "Story", 5],
    ["rule-" + now + "-5", userId, "Website", "Blog", 2]
  ];
  for (var i = 0; i < defaultRules.length; i++) {
    sheet.appendRow(defaultRules[i]);
  }
}

function seedDefaultUserSettings(ss, userId, name) {
  var sheet = ss.getSheetByName("SETTINGS");
  var defaultPillars = {
    instagram: ["Education", "Inspiration", "Storytelling", "Behind The Scenes", "Product & Service", "Community & Engagement", "Promotion"],
    website: ["How-To & Tutorials", "Industry Insights & Trends", "Case Studies & Success Stories", "Best Practices & Tips", "Product & Solution Guides", "Thought Leadership"]
  };
  sheet.appendRow([
    userId,
    "Asia/Makassar",
    "Monday",
    true,
    name + "'s Studio",
    "Universal / Creator",
    JSON.stringify(defaultPillars)
  ]);
}

function sendVerificationEmail(recipientEmail, userName, verificationLink, token) {
  try {
    var subject = "Verify your Content Planner Account";
    var body = "Hi " + userName + ",\n\n" +
      "Thank you for registering on Content Planner.\n\n" +
      (verificationLink ? "Please verify your account by clicking the link below:\n" + verificationLink + "\n\n" : "") +
      "Verification Token: " + token + "\n\n" +
      "This link is valid for " + CONFIG.VERIFY_TOKEN_EXPIRY_HOURS + " hours.\n\n" +
      "Happy Planning,\nContent Planner Team";
      
    MailApp.sendEmail(recipientEmail, subject, body);
  } catch (err) {
    Logger.log("Failed to send email via MailApp: " + err);
  }
}

function sendPasswordResetEmail(recipientEmail, userName, resetLink, token) {
  try {
    var subject = "Reset your Content Planner Password";
    var body = "Hi " + userName + ",\n\n" +
      "We received a request to reset your password.\n\n" +
      (resetLink ? "Click the link below to set a new password:\n" + resetLink + "\n\n" : "") +
      "Reset Token: " + token + "\n\n" +
      "This link expires in " + CONFIG.RESET_TOKEN_EXPIRY_HOURS + " hours and can only be used once.\n\n" +
      "If you did not request this, please ignore this email.\n\n" +
      "Content Planner Team";

    MailApp.sendEmail(recipientEmail, subject, body);
  } catch (err) {
    Logger.log("Failed to send reset email: " + err);
  }
}
