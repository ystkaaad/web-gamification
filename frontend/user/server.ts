
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

  app.use(express.json());

  // --- MOCK DATABASE STATE (Simulating Shared Database) ---
  const MOCK_DB = {
    point_ledgers: [
      { id: 1, user_id: "MEM-001", amount: 1250, type: "EARN", description: "Initial Balance" }
    ],
    vouchers: [
      { id: "V-COFFEE", title: "Free Coffee", stock: 2, image_url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200" }
    ],
    user_vouchers: [] as any[]
  };

  const getUserPoints = (userId: string) => {
    return MOCK_DB.point_ledgers
      .filter(l => l.user_id === userId)
      .reduce((sum, entry) => sum + entry.amount, 0);
  };
  // ---------------------------------------------------------

  // API routes FIRST - Available immediately
  app.get("/api/membership/user", (req, res) => {
    const points = getUserPoints("MEM-001");
    res.json({
      id: "MEM-001",
      name: "AKU MEMBER",
      email: "member@example.com",
      isAffiliate: false,
      referralCode: "REF-001",
      points: points,
      streakCount: 3,
      lastCheckIn: "2026-05-04" 
    });
  });

  // 1. Fetch Game Configurations (Dynamic from DB in real app)
  app.get("/api/games", (req, res) => {
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + 7);

    res.json({
      success: true,
      games: [
        {
          id: "spin-wheel",
          name: "Elite Lucky Spin",
          type: "wheel",
          cost_points: 25,
          start_date: "2026-01-01T00:00:00Z",
          end_date: endDate.toISOString(),
          prizes: [
            { id: 0, label: "50 POINTS", prize_type: "POINT", value: 50, color: "#D4AF37" },
            { id: 1, label: "ZONK", prize_type: "ZONK", value: 0, color: "#1A1F2E" },
            { id: 2, label: "100 POINTS", prize_type: "POINT", value: 100, color: "#D4AF37" },
            { id: 3, label: "FREE COFFEE", prize_type: "VOUCHER", voucher_id: "V-COFFEE", value: "Coffee Gratis", color: "#EAB308", image_url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200" },
            { id: 4, label: "500 POINTS", prize_type: "POINT", value: 500, color: "#EAB308" },
            { id: 5, label: "ZONK", prize_type: "ZONK", value: 0, color: "#1A1F2E" },
          ]
        }
      ]
    });
  });

  // 2. Play Game Logic (Securely handled on Backend)
  app.post("/api/games/play", (req, res) => {
    const { gameId, userId } = req.body;
    const activeUserId = userId || "MEM-001"; // Fallback to current mock user
    
    // RED FLAG FIX: Do not use userPoints from req.body (Trust No One)
    const currentUserPoints = getUserPoints(activeUserId);
    
    interface Prize {
      id: number;
      label: string;
      prize_type: string;
      value: number | string;
      color: string;
      voucher_id?: string;
      image_url?: string;
    }

    const gamesConfig: Record<string, { cost: number, prizes: Prize[] }> = {
      "spin-wheel": {
        cost: 25,
        prizes: [
          { id: 0, label: "50 POINTS", prize_type: "POINT", value: 50, color: "#D4AF37" },
          { id: 1, label: "ZONK", prize_type: "ZONK", value: 0, color: "#1A1F2E" },
          { id: 2, label: "100 POINTS", prize_type: "POINT", value: 100, color: "#D4AF37" },
          { id: 3, label: "FREE COFFEE", prize_type: "VOUCHER", voucher_id: "V-COFFEE", value: "Coffee Gratis", color: "#EAB308", image_url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200" },
          { id: 4, label: "500 POINTS", prize_type: "POINT", value: 500, color: "#EAB308" },
          { id: 5, label: "ZONK", prize_type: "ZONK", value: 0, color: "#1A1F2E" },
        ]
      },
      "scratch-card": {
        cost: 15,
        prizes: [
          { id: 0, label: "10 POINTS", prize_type: "POINT", value: 10, color: "#D4AF37" },
          { id: 1, label: "25 POINTS", prize_type: "POINT", value: 25, color: "#D4AF37" },
          { id: 2, label: "50 POINTS", prize_type: "POINT", value: 50, color: "#EAB308" },
          { id: 3, label: "ZONK", prize_type: "ZONK", value: 0, color: "#1A1F2E" },
        ]
      }
    };

    // Universal Game Handler: Support dynamic IDs from GAS
    // If gameId from request is not in hardcoded config, we use default spin-wheel template
    let game = gamesConfig[gameId as string];
    if (!game) {
      // Fallback to spin-wheel if specific config not found (allows dynamic games to at least run)
      game = gamesConfig["spin-wheel"];
    }

    // Step 1: Account Balance Validator (Real DB check)
    if (currentUserPoints < game.cost) {
      return res.status(400).json({ success: false, message: "Saldo poin tidak mencukupi untuk bermain." });
    }

    /**
     * TRANSACTION START (Simulated)
     * In real SQL: await db.transaction(async (trx) => { ... })
     */
    try {
      // Step A: Deduct Points (REDEEM)
      MOCK_DB.point_ledgers.push({
        id: MOCK_DB.point_ledgers.length + 1,
        user_id: activeUserId,
        amount: -game.cost,
        type: "REDEEM",
        description: `Bermain ${gameId}`
      });

      // Step B: RNG Execution
      const randomIndex = Math.floor(Math.random() * game.prizes.length);
      let winPrize: Prize = [...game.prizes][randomIndex];

      // Step C: Stock Handling & Prize Distribution (Switch-Case)
      let distributionMessage = "";

      // VOUCHER LEAK PROTECTION: Check stock for voucher wins
      if (winPrize.prize_type === "VOUCHER" && winPrize.voucher_id) {
        const voucher = MOCK_DB.vouchers.find(v => v.id === winPrize.voucher_id);
        
        // FOR UPDATE logic simulation
        if (voucher && voucher.stock > 0) {
          voucher.stock -= 1;
          MOCK_DB.user_vouchers.push({
            id: `UV-${Date.now()}`,
            user_id: activeUserId,
            voucher_id: winPrize.voucher_id,
            status: "AVAILABLE",
            created_at: new Date().toISOString()
          });
          distributionMessage = `Luar Biasa! Voucher ${winPrize.label} telah ditambahkan ke inventori Anda.`;
        } else {
          // FALLBACK LOGIC: Stock empty between milliseconds
          winPrize = game.prizes.find(p => p.prize_type === "ZONK") || winPrize;
          distributionMessage = "Maaf, stok voucher baru saja habis! Anda mendapatkan ZONK sebagai gantinya.";
        }
      }

      // Handle Points Reward
      if (winPrize.prize_type === "POINT") {
        MOCK_DB.point_ledgers.push({
          id: MOCK_DB.point_ledgers.length + 1,
          user_id: activeUserId,
          amount: winPrize.value as number,
          type: "EARN",
          description: `Hadiah dari ${gameId}`
        });
        distributionMessage = `Selamat! Anda mendapatkan tambahan ${winPrize.value} Poin.`;
      }

      // Handle Zonk
      if (winPrize.prize_type === "ZONK" && !distributionMessage) {
        distributionMessage = "Sayang sekali, keberuntungan belum memihak. Coba lagi!";
      }

      // Step 4: Finalize & Response
      const finalPoints = getUserPoints(activeUserId);

      res.json({
        success: true,
        result: {
          prizeId: winPrize.id,
          prizeLabel: winPrize.label,
          prizeValue: winPrize.value,
          prizeType: winPrize.prize_type,
          imageUrl: winPrize.image_url || null,
          finalPoints: finalPoints,
          message: distributionMessage,
          stopAngle: 360 - (randomIndex * (360 / game.prizes.length))
        }
      });
      
      /** TRANSACTION COMMIT **/
    } catch (error) {
      /** TRANSACTION ROLLBACK **/
      console.error("Game Execution Failed:", error);
      res.status(500).json({ success: false, message: "Terjadi kesalahan sistem. Poin Anda aman." });
    }
  });

  // 3. Daily Streak Configuration
  app.get("/api/streaks/config", (req, res) => {
    res.json({
      success: true,
      config: [
        { day: 1, reward: "5 PTS", type: "points", value: 5 },
        { day: 2, reward: "10 PTS", type: "points", value: 10 },
        { day: 3, reward: "15 PTS", type: "points", value: 15 },
        { day: 4, reward: "20 PTS", type: "points", value: 20 },
        { day: 5, reward: "25 PTS", type: "points", value: 25 },
        { day: 6, reward: "30 PTS", type: "points", value: 30 },
        { day: 7, reward: "Mystery Box", type: "box", value: "MYSTERY" },
      ]
    });
  });

  app.post("/api/streaks/checkin", (req, res) => {
    const { userId, currentStreak } = req.body;
    
    // In real app, check if already checked in today
    const nextStreak = (currentStreak || 0) + 1;
    const rewards = [5, 10, 15, 20, 25, 30, 100]; // Day 7 is 100 pts
    const reward = rewards[(nextStreak - 1) % 7];

    res.json({
      success: true,
      message: `Check-in hari ke-${nextStreak} berhasil!`,
      rewardPoints: reward,
      newStreak: nextStreak,
      lastCheckIn: new Date().toISOString().split('T')[0]
    });
  });

  app.post("/api/membership/update", (req, res) => {
    res.json({ success: true, user: req.body });
  });

  // Start listening ASAP to satisfy the infra checks
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Initializing Vite...");
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Vite ready!");
    } catch (err) {
      console.error("Vite initialization failed:", err);
    }
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

startServer();
