const fs = require("fs");
const path = require("path");

const userDir = "C:\\Users\\LENOVO\\WEB_GAMIFACATION - Copy FIX\\frontend\\user";

// ============ 1. apiService.ts ============
const apiPath = path.join(userDir, "services", "apiService.ts");
let api = fs.readFileSync(apiPath, "utf8");

api = api.replace(
  /  playGame: async \(userId: string, gameId: string\) => \{[\s\S]*?\},\s*\/\/ TODO: Ganti dengan endpoint backend sebenarnya untuk fitur ini[\s\S]*?checkGameCooldown: async \(userId: string, gameId: string\) => \{[\s\S]*?\},/,
  `  playGame: (userId: string, gameId: string) =>
    api.post('/games/play', {
      userId,
      gameId,
    }),

  checkGameCooldown: (userId: string, gameId: string) =>
    api.get('/games/cooldown', {
      params: { userId, gameId },
    }),

  claimVoucher: (userId: string, voucherId: string) =>
    api.post('/vouchers/claim', {
      userId,
      voucherId,
    }),

  getReferralMembers: (userId: string) =>
    api.get('/referrals/members', {
      params: { userId },
    }),`
);

fs.writeFileSync(apiPath, api);
console.log("apiService.ts updated");

// ============ 2. AppContext.tsx ============
const ctxPath = path.join(userDir, "AppContext.tsx");
let ctx = fs.readFileSync(ctxPath, "utf8");

// Referral members
ctx = ctx.replace(
  "          // TODO: Implement referral members setelah endpoint backend tersedia\n          setReferralMembers([]);",
  "          const refMembersRes = await apiService.getReferralMembers(latestUser.id).catch(() => ({ data: [] }));\n          const refMembersData = unwrapData<any[]>(refMembersRes);\n          setReferralMembers(refMembersData || []);"
);

// claimVoucher
ctx = ctx.replace(
  "  const claimVoucher = async (_voucher: Voucher): Promise<boolean> => {\n    addNotification(\n      'Fitur voucher sedang dalam proses migrasi backend.',\n      'info'\n    );\n    // TODO: Implementasikan menggunakan apiService.claimVoucher() setelah endpoint tersedia\n    return false;\n  };",
  "  const claimVoucher = async (voucher: Voucher): Promise<boolean> => {\n    if (!user) return false;\n    setIsSyncing(true);\n    try {\n      const response = await apiService.claimVoucher(user.id, voucher.id);\n      const resData = response.data;\n      if (resData?.success) {\n        addNotification('Voucher berhasil ditukar!', 'success');\n        await refreshData();\n        return true;\n      }\n      addNotification(resData?.message || 'Gagal menukar voucher.', 'error');\n      return false;\n    } catch (error: any) {\n      addNotification(error.response?.data?.message || 'Gagal menukar voucher.', 'error');\n      return false;\n    } finally {\n      setIsSyncing(false);\n    }\n  };"
);

fs.writeFileSync(ctxPath, ctx);
console.log("AppContext.tsx updated");

// ============ 3. SpinwheelGame.tsx ============
const spinPath = path.join(userDir, "components", "SpinwheelGame.tsx");
let spin = fs.readFileSync(spinPath, "utf8");

spin = spin.replace(
  "const prizeValue = Number(resultData?.prizeValue ?? 0);",
  "const prizeValue = Number(resultData?.prizeValue ?? resultData?.rewardValue ?? 0);"
);
spin = spin.replace(
  "const rewardType = resultData?.rewardType ?? 'POINT';",
  "const rewardType = resultData?.rewardType ?? resultData?.prizeType ?? 'POINT';"
);

fs.writeFileSync(spinPath, spin);
console.log("SpinwheelGame.tsx updated");

// ============ 4. MissionPage.tsx ============
const missionPath = path.join(userDir, "pages", "MissionPage.tsx");
let mission = fs.readFileSync(missionPath, "utf8");

// Fix template literal that got mangled
mission = mission.replace(
  "setErrorModal(Poin Anda tidak mencukupi. Biaya main adalah  Poin.);",
  "setErrorModal(`Poin Anda tidak mencukupi. Biaya main adalah ${gameCost} Poin.`);"
);

// Remove duplicate leftover code from previous failed edits
// Find the duplicate block after handlePlay and remove it
const lines = mission.split("\n");
const cleaned = [];
let inHandlePlay = false;
let braceDepth = 0;
let handlePlayClosed = false;
let skipDuplicates = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();
  
  if (trimmed === "const handlePlay = async (gameId: string) => {") {
    inHandlePlay = true;
    braceDepth = 0;
    handlePlayClosed = false;
    skipDuplicates = false;
    cleaned.push(line);
    continue;
  }
  
  if (inHandlePlay && !handlePlayClosed) {
    for (const ch of line) {
      if (ch === '{') braceDepth++;
      if (ch === '}') braceDepth--;
    }
    if (braceDepth <= 0 && trimmed === '};') {
      inHandlePlay = false;
      handlePlayClosed = true;
      skipDuplicates = true;
      cleaned.push(line);
      continue;
    }
    cleaned.push(line);
    continue;
  }
  
  if (skipDuplicates) {
    // Skip lines that are duplicates from the old code
    if (trimmed === "const winReward = getRandomReward(segments);" ||
        trimmed === "const prizeValue = Number(winReward.Value || winReward.value || 0) || 0;" ||
        trimmed === "const prizeLabel = winReward.Label || winReward.label || 'Zonk';" ||
        trimmed === "const prizeType = prizeValue > 0 ? 'POINTS' : 'ZONK';" ||
        trimmed === "// 3. Animation Logic" ||
        trimmed.startsWith("if (game.type === 'SPINWHEEL')") ||
        trimmed === "const extraSpins = 5 * 360;" ||
        trimmed === "await new Promise(r => setTimeout(r, 4500)); // Wait for spin" ||
        trimmed === "} else {" ||
        trimmed === "await new Promise(r => setTimeout(r, 2000));" ||
        trimmed === "// 4. Update Result and Add Points" ||
        trimmed === "const resultData = {" ||
        trimmed === "success: true," ||
        (trimmed.startsWith("prizeLabel,") && !trimmed.includes("=")) ||
        (trimmed.startsWith("prizeValue,") && !trimmed.includes("=")) ||
        (trimmed.startsWith("prizeType,") && !trimmed.includes("=")) ||
        trimmed === "message: prizeValue > 0 ? `Selamat! Anda memenangkan ${prizeLabel}` : 'Yah, coba lagi lain kali ya!'" ||
        trimmed === "};" ||
        trimmed.startsWith("setGameResult(resultData);") ||
        trimmed.startsWith("// NOTE: playGame") ||
        trimmed.startsWith("// await apiService.playGame") ||
        trimmed.startsWith("// 2. Call backend") ||
        trimmed.startsWith("const playResponse") ||
        trimmed.startsWith("const playData") ||
        trimmed.startsWith("if (!playData") ||
        trimmed.startsWith("setErrorModal(playData") ||
        trimmed.startsWith("const backendResult") ||
        trimmed.startsWith("const isVoucher") ||
        trimmed.startsWith("const message = isVoucher") ||
        trimmed.startsWith("setGameResult({") ||
        trimmed.startsWith("if (prizeValue > 0") ||
        trimmed.startsWith("confetti({") ||
        trimmed === "} catch (err) {" ||
        trimmed === "console.error(err);" ||
        trimmed === "setErrorModal('Terjadi kesalahan saat memproses game. Silakan coba lagi.');" ||
        trimmed === "} finally {" ||
        trimmed === "setIsPlaying(false);" ||
        (trimmed === "};" && skipDuplicates)) {
      continue;
    }
    // If we hit isExpired or later, stop skipping
    if (trimmed.startsWith("const isExpired") || trimmed.startsWith("if (loading") || trimmed.startsWith("return (") || trimmed.startsWith("<div") || trimmed.startsWith("</div>") || trimmed.startsWith("const") || trimmed.startsWith("let ")) {
      skipDuplicates = false;
    }
    cleaned.push(line);
    continue;
  }
  
  cleaned.push(line);
}

mission = cleaned.join("\n");
fs.writeFileSync(missionPath, mission);
console.log("MissionPage.tsx cleaned and updated");

// ============ VALIDATION ============
console.log("\n=== Running validation ===");

// Check for remaining placeholders
const allFiles = [
  path.join(userDir, "services", "apiService.ts"),
  path.join(userDir, "AppContext.tsx"),
  path.join(userDir, "components", "SpinwheelGame.tsx"),
  path.join(userDir, "pages", "MissionPage.tsx"),
];

let hasErrors = false;
for (const f of allFiles) {
  const content = fs.readFileSync(f, "utf8");
  if (content.includes("TODO:") || content.includes("playGame belum") || content.includes("checkGameCooldown belum")) {
    console.log(`ERROR: Placeholder still in ${path.basename(f)}`);
    hasErrors = true;
  }
}

// Check apiService has endpoints
const apiCheck = fs.readFileSync(apiPath, "utf8");
const endpoints = ["/games/play", "/games/cooldown", "/vouchers/claim", "/referrals/members"];
for (const ep of endpoints) {
  if (!apiCheck.includes(ep)) {
    console.log(`ERROR: Missing endpoint ${ep} in apiService`);
    hasErrors = true;
  }
}

// Check AppContext changes
const ctxCheck = fs.readFileSync(ctxPath, "utf8");
if (!ctxCheck.includes("getReferralMembers")) {
  console.log("ERROR: getReferralMembers not found in AppContext");
  hasErrors = true;
}
if (!ctxCheck.includes("claimVoucher(user.id, voucher.id)")) {
  console.log("ERROR: claimVoucher backend call not found in AppContext");
  hasErrors = true;
}

if (!hasErrors) {
  console.log("All validations passed!");
}

// Cleanup
try { fs.unlinkSync(path.join(__dirname, "temp_apply.js")); } catch(e) {}
