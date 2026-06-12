
/**
 * NGOLABIFY ENTERPRISE ENGINE v2.3
 * Core: Strict Data Typing & Enhanced Row Recovery
 */

const HEADERS = {
  USERS: ["id", "name", "email", "role", "level", "points", "total_transaksi", "referralCode", "streakCount", "lastCheckIn"],
  TRANSACTIONS: ["id_transaksi", "id_member", "kode_afiliator", "nominal", "tanggal"],
  VOUCHERS: ["id", "title", "code", "expiry", "cost", "quota"],
  MISSIONS: ["id", "title", "description", "rewardPoints", "targetCount", "isActive"],
  POINTS_HISTORY: ["id", "userId", "source", "pointsChange", "description", "createdAt"],
  VOUCHER_HISTORY: ["id", "userId", "voucherId", "voucherCode", "transactionId", "discountAmount", "usedAt"],
  MISSION_PROGRESS: ["id", "missionId", "userId", "currentProgress", "isCompleted", "completedAt"],
  REFERRAL_EARNINGS: ["id", "affiliateId", "memberId", "transactionId", "commission", "createdAt"]
};

function doGet(e) {
  // Gracefully handle missing parameters to avoid "sheetName is required" errors if possible
  const param = e && e.parameter ? e.parameter : {};
  const action = param.action;
  const sheetName = param.sheetName;
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === "GET_ALL") {
    const data = {};
    const sheetsToFetch = ["UserGamification", "Games", "Missions", "MissionProgress", "Vouchers", "VoucherHistory", "PointsHistory", "ReferralEarnings"];
    sheetsToFetch.forEach(name => {
      const sheet = ss.getSheetByName(name);
      data[name] = sheet ? getRowsAsObjects(sheet) : [];
    });
    return jsonResponse({ success: true, data: data });
  }

  if (action === "GET_DATA") {
    if (!sheetName) return jsonResponse({ success: false, error: "sheetName is required for GET_DATA" });
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return jsonResponse({ success: false, error: "Sheet " + sheetName + " not found" });
    return jsonResponse({ success: true, data: getRowsAsObjects(sheet) });
  }
  
  // Default to a helpful message instead of raw error
  return jsonResponse({ success: false, error: "Action '" + action + "' not supported via GET. Use POST for updates." });
}

function doPost(e) {
  try {
    const contents = e && e.postData && e.postData.contents ? e.postData.contents : "{}";
    const request = JSON.parse(contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Support parameters from query string OR body
    const param = e && e.parameter ? e.parameter : {};
    
    const type = request.type || request.action || param.action || param.type;
    const payload = request.payload || request.data || request;
    const sheetName = request.sheetName || param.sheetName;

    if (!type) return jsonResponse({ success: false, error: "Action/Type is required" });

    switch (type) {
      case "USER":
        const uSheetName = sheetName || "UserGamification";
        updateOrAppendRow(getOrCreateSheet(ss, uSheetName, HEADERS.USERS), HEADERS.USERS, payload, "id");
        return jsonResponse({ success: true });

      case "TRANSACTION":
        return processTransactionEngine(ss, payload);

      case "REDEEM_VOUCHER":
        return processVoucherRedemption(ss, payload);

      case "UPDATE_MISSION":
        return processMissionUpdate(ss, payload);

      case "CLAIM_STREAK":
        return processStreakClaim(ss, payload);

      case "dailyCheckIn":
        // Alias for streak or custom logic
        return processStreakClaim(ss, payload);
      
      case "addPoints":
      case "UPDATE_POINTS":
        return processAddPoints(ss, payload);

      default:
        return jsonResponse({ success: false, error: "Unknown type: " + type, received: type });
    }
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function processAddPoints(ss, payload) {
  const userSheetName = payload.sheetName || "UserGamification";
  const userSheet = getOrCreateSheet(ss, userSheetName, HEADERS.USERS);
  const pointsLog = getOrCreateSheet(ss, "PointsHistory", HEADERS.POINTS_HISTORY);
  
  const user = getOrCreateUser(userSheet, payload.userId, payload);
  const currentPoints = Number(user.points) || 0;
  const change = Number(payload.points) || 0;

  updateOrAppendRow(userSheet, HEADERS.USERS, {
    id: user.id,
    points: currentPoints + change
  }, "id");

  appendRow(pointsLog, HEADERS.POINTS_HISTORY, {
    id: "PH-" + Date.now(),
    userId: user.id,
    source: "ADMIN",
    pointsChange: change,
    description: payload.description || "Point Adjustment",
    createdAt: new Date().toISOString()
  });

  return jsonResponse({ success: true });
}

function processStreakClaim(ss, payload) {
  const userId = String(payload.userId || "").trim();
  if (!userId) return jsonResponse({ success: false, error: "userId is required" });

  const userSheetName = payload.sheetName || "UserGamification";
  const userSheet = getOrCreateSheet(ss, userSheetName, HEADERS.USERS);
  const pointsLog = getOrCreateSheet(ss, "PointsHistory", HEADERS.POINTS_HISTORY);
  
  const user = getOrCreateUser(userSheet, userId, payload);

  const streakCount = Number(user.streakCount) || 0;
  const nextStreak = (streakCount % 7) + 1;
  const pointsReward = Number(payload.rewardPoints) || (nextStreak * 5); 
  
  // Use Utilities.formatDate for more reliable date strings in GAS
  // Assuming WIB (GMT+7) for Indonesian audience
  const today = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd");
  const isTestUser = userId === "USR-999";

  if (String(user.lastCheckIn).trim() === today && !isTestUser) {
    return jsonResponse({ success: false, message: "Sudah klaim hari ini (Server: " + today + ")" });
  }

  // Update User
  updateOrAppendRow(userSheet, HEADERS.USERS, {
    id: userId,
    points: (Number(user.points) || 0) + pointsReward,
    streakCount: nextStreak,
    lastCheckIn: today
  }, "id");

  // Log Points
  appendRow(pointsLog, HEADERS.POINTS_HISTORY, {
    id: "STK-" + Date.now(),
    userId: userId,
    source: "STREAK",
    pointsChange: pointsReward,
    description: "Daily Streak Hari ke-" + nextStreak,
    createdAt: new Date().toISOString()
  });

  return jsonResponse({ success: true, message: "Berhasil klaim!", earnedPoints: pointsReward, newStreak: nextStreak });
}

function processTransactionEngine(ss, payload) {
  const transSheetName = payload.sheetName || "Transactions";
  const transSheet = getOrCreateSheet(ss, transSheetName, HEADERS.TRANSACTIONS);
  appendRow(transSheet, HEADERS.TRANSACTIONS, payload);
  return jsonResponse({ success: true });
}

function processVoucherRedemption(ss, payload) {
  const vhSheet = getOrCreateSheet(ss, "VoucherHistory", HEADERS.VOUCHER_HISTORY);
  const userSheetName = payload.sheetName || "UserGamification";
  const userSheet = getOrCreateSheet(ss, userSheetName, HEADERS.USERS);
  const voucherSheet = getOrCreateSheet(ss, "Vouchers", HEADERS.VOUCHERS);
  const pointsLog = getOrCreateSheet(ss, "PointsHistory", HEADERS.POINTS_HISTORY);
  
  const user = getOrCreateUser(userSheet, payload.userId, payload);

  const vouchers = getRowsAsObjects(voucherSheet);
  const voucher = vouchers.find(v => String(v.id).trim() === String(payload.voucherId).trim());
  if (!voucher) return jsonResponse({ success: false, error: "Voucher not found" });
  
  const currentPoints = Number(user.points) || 0;
  const cost = Number(voucher.cost) || 0;
  
  if (currentPoints < cost) return jsonResponse({ success: false, error: "Poin tidak cukup" });

  // 1. Update User Points
  updateOrAppendRow(userSheet, HEADERS.USERS, {
    id: user.id,
    points: currentPoints - cost
  }, "id");

  // 2. Add to Voucher History
  appendRow(vhSheet, HEADERS.VOUCHER_HISTORY, {
    id: "VH-" + Date.now(),
    userId: user.id,
    voucherId: voucher.id,
    voucherCode: voucher.code,
    discountAmount: cost,
    usedAt: new Date().toISOString()
  });

  // 3. Log Points Change
  appendRow(pointsLog, HEADERS.POINTS_HISTORY, {
    id: "PH-" + Date.now(),
    userId: user.id,
    source: "VOUCHER",
    pointsChange: -cost,
    description: "Tukar Voucher: " + voucher.title,
    createdAt: new Date().toISOString()
  });

  return jsonResponse({ success: true });
}

function processMissionUpdate(ss, data) {
  const mpSheet = getOrCreateSheet(ss, "MissionProgress", HEADERS.MISSION_PROGRESS);
  const userSheetName = data.sheetName || "UserGamification";
  const userSheet = getOrCreateSheet(ss, userSheetName, HEADERS.USERS);
  const pointsLog = getOrCreateSheet(ss, "PointsHistory", HEADERS.POINTS_HISTORY);
  
  const idProgress = (String(data.missionId) + "_" + String(data.userId)).trim();
  const isCompleted = data.isNewCompletion === true;

  // 1. Update Progress Misi
  updateOrAppendRow(mpSheet, HEADERS.MISSION_PROGRESS, {
    id: idProgress, 
    missionId: data.missionId, 
    userId: data.userId,
    currentProgress: data.progress, 
    isCompleted: isCompleted,
    completedAt: isCompleted ? new Date().toISOString() : ""
  }, "id");

  // 2. Tambah Poin User jika misi baru saja selesai
  if (isCompleted) {
    const user = getOrCreateUser(userSheet, data.userId, data);
    
    if (user) {
      const currentPoints = Number(user.points) || 0;
      const rewardPoints = Number(data.rewardPoints) || 0;
      
      updateOrAppendRow(userSheet, HEADERS.USERS, {
        id: user.id,
        points: currentPoints + rewardPoints
      }, "id");

      // 3. Catat di History
      appendRow(pointsLog, HEADERS.POINTS_HISTORY, {
        id: "PH-" + Date.now(), 
        userId: user.id, 
        source: "MISSION",
        pointsChange: rewardPoints, 
        description: "Hadiah Misi: " + (data.missionTitle || data.missionId), 
        createdAt: new Date().toISOString()
      });
    }
  }
  return jsonResponse({ success: true });
}

/* --- CORE UTILITIES --- */

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function getRowsAsObjects(sheet) {
  const range = sheet.getDataRange();
  if (range.getLastRow() < 2) return [];
  const data = range.getValues();
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function getOrCreateSheet(ss, name, headers) {
  let s = ss.getSheetByName(name);
  if (!s) { s = ss.insertSheet(name); s.appendRow(headers); }
  return s;
}

function appendRow(sheet, headers, payload) {
  sheet.appendRow(headers.map(h => payload[h] !== undefined ? payload[h] : ""));
}

function updateOrAppendRow(sheet, headers, payload, idKey) {
  const range = sheet.getDataRange();
  const data = range.getValues();
  const idIdx = headers.indexOf(idKey);
  
  if (idIdx === -1) return;

  const rowIdx = data.findIndex((r, i) => i > 0 && String(r[idIdx]).trim() === String(payload[idKey]).trim());

  if (rowIdx > -1) {
    const updated = headers.map((h, i) => payload[h] !== undefined ? payload[h] : data[rowIdx][i]);
    sheet.getRange(rowIdx + 1, 1, 1, headers.length).setValues([updated]);
  } else {
    sheet.appendRow(headers.map(h => payload[h] !== undefined ? payload[h] : ""));
  }
}

function getOrCreateUser(userSheet, userId, payload) {
  const users = getRowsAsObjects(userSheet);
  let user = users.find(u => String(u.id).trim() === String(userId).trim());
  if (!user) {
    user = {
      id: userId,
      name: payload.name || "User-" + userId,
      email: payload.email || "",
      points: 0,
      streakCount: 0,
      role: payload.role || "MEMBER",
      level: payload.level || "Silver",
      total_transaksi: 0,
      referralCode: payload.referralCode || ("REF" + userId)
    };
    updateOrAppendRow(userSheet, HEADERS.USERS, user, "id");
  }
  return user;
}
