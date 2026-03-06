import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("earthtrek.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT,
    buy_price REAL,
    rent_price_per_day REAL,
    stock_buy INTEGER,
    stock_rent INTEGER,
    image TEXT,
    category TEXT,
    description TEXT,
    instructions TEXT,
    keywords TEXT,
    specifications TEXT, -- JSON string
    attributes TEXT -- JSON string (e.g., ["Dung tích", "Màu sắc"])
  );

  CREATE TABLE IF NOT EXISTS variants (
    id TEXT PRIMARY KEY,
    product_id TEXT,
    name TEXT,
    attributes TEXT, -- JSON string (e.g., {"Dung tích": "50L", "Màu sắc": "Đen"})
    stock_buy INTEGER,
    stock_rent INTEGER,
    price_modifier REAL,
    buy_price REAL,
    rent_price_per_day REAL,
    FOREIGN KEY(product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT,
    user_name TEXT,
    image TEXT,
    comment TEXT,
    rating INTEGER,
    durability INTEGER,
    newness INTEGER,
    material INTEGER,
    FOREIGN KEY(product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT,
    variant_id TEXT,
    mode TEXT, -- 'buy' or 'rent'
    quantity INTEGER,
    selected INTEGER DEFAULT 1,
    FOREIGN KEY(product_id) REFERENCES products(id),
    FOREIGN KEY(variant_id) REFERENCES variants(id)
  );

  CREATE TABLE IF NOT EXISTS active_trip (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    location_id TEXT,
    departure_date TEXT,
    number_of_days INTEGER,
    guide_id TEXT,
    members TEXT -- JSON string
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    items TEXT, -- JSON string
    total REAL,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration: Add missing columns if they don't exist
const tableInfo = db.prepare("PRAGMA table_info(products)").all() as any[];
const hasKeywords = tableInfo.some(c => c.name === 'keywords');
if (!hasKeywords) {
  db.exec("ALTER TABLE products ADD COLUMN description TEXT");
  db.exec("ALTER TABLE products ADD COLUMN instructions TEXT");
  db.exec("ALTER TABLE products ADD COLUMN keywords TEXT");
}
const hasSpecs = tableInfo.some(c => c.name === 'specifications');
if (!hasSpecs) {
  db.exec("ALTER TABLE products ADD COLUMN specifications TEXT");
}

const hasProductAttributes = tableInfo.some(c => c.name === 'attributes');
if (!hasProductAttributes) {
  db.exec("ALTER TABLE products ADD COLUMN attributes TEXT");
}

const variantInfo = db.prepare("PRAGMA table_info(variants)").all() as any[];
const hasVBuyPrice = variantInfo.some(c => c.name === 'buy_price');
if (!hasVBuyPrice) {
  db.exec("ALTER TABLE variants ADD COLUMN buy_price REAL");
  db.exec("ALTER TABLE variants ADD COLUMN rent_price_per_day REAL");
}

const hasVariantAttributes = variantInfo.some(c => c.name === 'attributes');
if (!hasVariantAttributes) {
  db.exec("ALTER TABLE variants ADD COLUMN attributes TEXT");
}

const cartInfo = db.prepare("PRAGMA table_info(cart)").all() as any[];
const hasVariantId = cartInfo.some(c => c.name === 'variant_id');
if (!hasVariantId) {
  db.exec("ALTER TABLE cart ADD COLUMN variant_id TEXT");
}

// Seed Products if empty or missing attributes
const firstProduct = db.prepare("SELECT * FROM products LIMIT 1").get() as any;
const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };

if (productCount.count === 0 || (firstProduct && !firstProduct.attributes)) {
  // Clear existing data to ensure clean seed with new structure
  db.exec("DELETE FROM reviews");
  db.exec("DELETE FROM variants");
  db.exec("DELETE FROM cart");
  db.exec("DELETE FROM products");

  const insertProduct = db.prepare(`
    INSERT INTO products (id, name, buy_price, rent_price_per_day, stock_buy, stock_rent, image, category, description, instructions, keywords, specifications, attributes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const products = [
    ["p1", "Balo Trekking Osprey Aether", 3500000, 100000, 20, 15, "https://picsum.photos/seed/backpack-trek/800/800", "Gear", "Balo trekking chuyên dụng với hệ thống đệm lưng AirSpeed thoáng khí tuyệt đối. Thiết kế công thái học giúp phân bổ trọng lượng đều lên hông, giảm áp lực cho vai.", "1. Điều chỉnh độ dài lưng phù hợp.\n2. Thắt đai hông trước khi thắt dây vai.\n3. Sử dụng túi nước tích hợp để uống nước khi đang di chuyển.", "balo, osprey, trekking, hiking", JSON.stringify({ "Trọng lượng": "1.8 kg", "Chất liệu": "Nylon 210D", "Kích thước": "75 x 34 x 32 cm" }), JSON.stringify(["Dung tích", "Màu sắc"])],
    ["p2", "Lều cắm trại Naturehike Mongar", 1800000, 60000, 15, 10, "https://picsum.photos/seed/tent-trek/800/800", "Camping", "Lều 2 lớp siêu nhẹ với thiết kế 2 cửa đối xứng, tạo không gian thông thoáng. Khung nhôm 7001 chắc chắn, chịu được gió mạnh và mưa lớn.", "1. Chọn địa hình phẳng, dọn sạch sỏi đá.\n2. Lắp khung nhôm và móc lớp lưới vào.\n3. Phủ lớp chống mưa và đóng cọc cố định.", "lều, naturehike, mongar, camping, tent", JSON.stringify({ "Trọng lượng": "2.1 kg", "Chống nước": "PU 4000mm", "Kích thước gấp": "50 x 15 cm" }), JSON.stringify(["Sức chứa"])],
    ["p3", "Giày Trekking Salomon X Ultra", 3200000, 100000, 30, 20, "https://picsum.photos/seed/shoes-trek/800/800", "Footwear", "Giày trekking cổ thấp linh hoạt, đế Contagrip bám dính cực tốt trên mọi địa hình. Công nghệ Gore-Tex giúp chống nước hoàn hảo.", "1. Sử dụng tất trekking chuyên dụng.\n2. Thắt dây giày Quicklace vừa vặn.\n3. Vệ sinh bằng bàn chải mềm sau khi sử dụng.", "giày, salomon, goretex, footwear, hiking", JSON.stringify({ "Đế": "Contagrip MA", "Màng": "Gore-Tex", "Trọng lượng": "390g", "Cổ giày": "Thấp" }), JSON.stringify(["Kích cỡ", "Màu sắc"])],
    ["p4", "Gậy leo núi Carbon Black Diamond", 1500000, 40000, 15, 10, "https://picsum.photos/seed/pole-trek/800/800", "Gear", "Gậy leo núi làm từ sợi carbon 100% siêu nhẹ và bền bỉ. Hệ thống khóa FlickLock Pro giúp điều chỉnh chiều dài nhanh chóng.", "1. Mở khóa và kéo dài gậy đến vạch 'Stop'.\n2. Điều chỉnh chiều dài sao cho khuỷu tay vuông góc.\n3. Sử dụng quai đeo cổ tay để hỗ trợ lực.", "gậy, carbon, black diamond, hiking, pole", JSON.stringify({ "Chất liệu": "Carbon Fiber", "Chiều dài": "60 - 130 cm", "Trọng lượng": "450g/cặp", "Tay cầm": "Xốp EVA" }), JSON.stringify([])],
    ["p5", "Đèn đeo đầu Petzl Actik", 1200000, 40000, 25, 15, "https://picsum.photos/seed/headlamp-trek/800/800", "Lighting", "Đèn đeo đầu công suất cao, tích hợp pin sạc Core tiện lợi. Chế độ sáng đỏ giúp bảo vệ thị giác ban đêm.", "1. Sạc đầy pin qua cổng USB.\n2. Nhấn giữ để chuyển đổi các chế độ sáng.\n3. Điều chỉnh góc chiếu đèn phù hợp tầm nhìn.", "đèn, petzl, headlamp, lighting, camping", JSON.stringify({ "Pin": "Sạc Core 1250 mAh", "Chống nước": "IPX4", "Trọng lượng": "75g" }), JSON.stringify(["Độ sáng"])],
    ["p6", "Bình nước giữ nhiệt 1L Hydro Flask", 950000, 20000, 20, 15, "https://picsum.photos/seed/bottle-trek/800/800", "Gear", "Bình giữ nhiệt thép không gỉ với công nghệ TempShield giúp giữ lạnh đến 24h và giữ nóng đến 12h. Lớp sơn tĩnh điện bền bỉ.", "1. Rửa sạch trước khi sử dụng lần đầu.\n2. Không sử dụng trong lò vi sóng.\n3. Có thể dùng với các loại nắp khác nhau của Hydro Flask.", "bình nước, hydro flask, 1l, gear", JSON.stringify({ "Dung tích": "946 ml", "Chất liệu": "Thép 18/8", "Giữ lạnh": "24 giờ", "Giữ nóng": "12 giờ" }), JSON.stringify([])],
    ["p7", "Áo khoác chống nước The North Face", 3200000, 90000, 7, 5, "https://picsum.photos/seed/jacket-trek/800/800", "Safety", "Áo khoác 2 lớp với công nghệ DryVent chống thấm nước và cản gió tuyệt đối. Lớp lót lưới bên trong giúp thoát mồ hôi nhanh.", "1. Kéo kín khóa kéo khi trời mưa.\n2. Điều chỉnh mũ trùm đầu vừa vặn.\n3. Giặt bằng nước lạnh và phơi trong bóng râm.", "áo khoác, north face, dryvent, safety, jacket", JSON.stringify({ "Công nghệ": "DryVent 2L", "Chất liệu": "Polyester", "Trọng lượng": "500g", "Tính năng": "Chống nước, Cản gió" }), JSON.stringify(["Kích cỡ", "Màu sắc"])],
    ["p8", "Túi ngủ dã ngoại Sea to Summit", 2500000, 80000, 6, 4, "https://picsum.photos/seed/sleepingbag-trek/800/800", "Camping", "Túi ngủ lông vũ siêu nhẹ, có thể nén cực gọn. Thiết kế dạng xác ướp giúp giữ nhiệt tối đa cho cơ thể.", "1. Giũ tơi túi ngủ trước khi nằm.\n2. Sử dụng thêm tấm lót túi ngủ nếu cần.\n3. Phơi khô hoàn toàn trước khi cất vào túi nén.", "túi ngủ, sea to summit, camping, sleeping bag", JSON.stringify({ "Nhiệt độ": "5°C đến -2°C", "Chất liệu": "Lông vũ 650+", "Trọng lượng": "850g", "Kích thước nén": "18 x 25 cm" }), JSON.stringify([])]
  ];

  for (const p of products) {
    insertProduct.run(...p);
  }

  // Seed Variants
  const insertVariant = db.prepare(`
    INSERT INTO variants (id, product_id, name, attributes, stock_buy, stock_rent, price_modifier, buy_price, rent_price_per_day)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const variants = [
    // Backpacks (p1)
    ["v1_20_den", "p1", "20L - Đen", JSON.stringify({ "Dung tích": "20L", "Màu sắc": "Đen" }), 10, 5, 0, 2500000, 80000],
    ["v1_20_xanh", "p1", "20L - Xanh rêu", JSON.stringify({ "Dung tích": "20L", "Màu sắc": "Xanh rêu" }), 8, 4, 0, 2500000, 80000],
    ["v1_35_den", "p1", "35L - Đen", JSON.stringify({ "Dung tích": "35L", "Màu sắc": "Đen" }), 12, 6, 0, 3200000, 100000],
    ["v1_35_cam", "p1", "35L - Cam", JSON.stringify({ "Dung tích": "35L", "Màu sắc": "Cam" }), 5, 3, 0, 3200000, 100000],
    ["v1_50_den", "p1", "50L - Đen", JSON.stringify({ "Dung tích": "50L", "Màu sắc": "Đen" }), 15, 8, 0, 4500000, 150000],
    ["v1_50_xam", "p1", "50L - Xám", JSON.stringify({ "Dung tích": "50L", "Màu sắc": "Xám" }), 10, 5, 0, 4500000, 150000],
    ["v1_65_den", "p1", "65L - Đen", JSON.stringify({ "Dung tích": "65L", "Màu sắc": "Đen" }), 8, 4, 0, 5800000, 200000],

    // Tents (p2)
    ["v2_1", "p2", "1 người", JSON.stringify({ "Sức chứa": "1 người" }), 10, 5, 0, 1500000, 50000],
    ["v2_2", "p2", "2 người", JSON.stringify({ "Sức chứa": "2 người" }), 15, 8, 0, 2800000, 100000],
    ["v2_4", "p2", "4 người", JSON.stringify({ "Sức chứa": "4 người" }), 8, 4, 0, 4200000, 180000],

    // Shoes (p3)
    ["v3_38_den", "p3", "Size 38 - Đen", JSON.stringify({ "Kích cỡ": "38", "Màu sắc": "Đen" }), 5, 3, 0, 3200000, 100000],
    ["v3_40_den", "p3", "Size 40 - Đen", JSON.stringify({ "Kích cỡ": "40", "Màu sắc": "Đen" }), 10, 5, 0, 3200000, 100000],
    ["v3_40_nau", "p3", "Size 40 - Nâu", JSON.stringify({ "Kích cỡ": "40", "Màu sắc": "Nâu" }), 8, 4, 0, 3200000, 100000],
    ["v3_42_den", "p3", "Size 42 - Đen", JSON.stringify({ "Kích cỡ": "42", "Màu sắc": "Đen" }), 12, 6, 0, 3200000, 100000],
    ["v3_42_xam", "p3", "Size 42 - Xám", JSON.stringify({ "Kích cỡ": "42", "Màu sắc": "Xám" }), 7, 3, 0, 3200000, 100000],
    ["v3_44_den", "p3", "Size 44 - Đen", JSON.stringify({ "Kích cỡ": "44", "Màu sắc": "Đen" }), 5, 2, 0, 3200000, 100000],

    // Headlamps (p5)
    ["v5_200", "p5", "200 lumen", JSON.stringify({ "Độ sáng": "200 lumen" }), 20, 10, 0, 850000, 30000],
    ["v5_400", "p5", "400 lumen", JSON.stringify({ "Độ sáng": "400 lumen" }), 15, 8, 0, 1200000, 45000],
    ["v5_800", "p5", "800 lumen", JSON.stringify({ "Độ sáng": "800 lumen" }), 10, 5, 0, 1850000, 70000]
  ];
  for (const v of variants) insertVariant.run(...v);

  // Seed Reviews
  const insertReview = db.prepare(`
    INSERT INTO reviews (id, product_id, user_name, image, comment, rating, durability, newness, material)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const reviews = [
    ["r1", "p1", "Nguyễn Văn A", "https://i.pravatar.cc/150?u=a", "Balo rất chắc chắn, đeo cả ngày không thấy mỏi lưng. Hệ thống thoáng khí làm việc rất tốt.", 5, 5, 5, 5],
    ["r2", "p1", "Trần Thị B", "https://i.pravatar.cc/150?u=b", "Màu sắc đẹp, nhiều ngăn tiện lợi. Rất đáng tiền.", 4, 4, 5, 4],
    ["r3", "p3", "Lê Văn C", "https://i.pravatar.cc/150?u=c", "Giày bám đường tốt, lội suối không bị ướt chân. Tuy nhiên hơi cứng lúc mới đi.", 5, 5, 4, 5],
    ["r4", "p2", "Phạm Minh D", "https://i.pravatar.cc/150?u=d", "Lều dựng nhanh, chống mưa tốt. Đã test trong mưa bão ở Tà Năng.", 5, 5, 5, 5],
    ["r5", "p5", "Hoàng Anh E", "https://i.pravatar.cc/150?u=e", "Đèn rất sáng, pin trâu. Chế độ sáng đỏ rất hữu ích khi ở trong lều.", 5, 4, 5, 5]
  ];
  for (const r of reviews) insertReview.run(...r);
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all() as any[];
    for (const p of products) {
      p.variants = db.prepare("SELECT * FROM variants WHERE product_id = ?").all(p.id);
      p.reviews = db.prepare("SELECT * FROM reviews WHERE product_id = ?").all(p.id);
    }
    res.json(products);
  });

  app.get("/api/products/:id", (req, res) => {
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id) as any;
    if (product) {
      product.variants = db.prepare("SELECT * FROM variants WHERE product_id = ?").all(product.id);
      product.reviews = db.prepare("SELECT * FROM reviews WHERE product_id = ?").all(product.id);
    }
    res.json(product || null);
  });

  app.get("/api/trip", (req, res) => {
    const trip = db.prepare("SELECT * FROM active_trip WHERE id = 1").get();
    if (trip) {
      // @ts-ignore
      trip.members = JSON.parse(trip.members);
    }
    res.json(trip || null);
  });

  app.post("/api/trip", (req, res) => {
    const { location_id, departure_date, number_of_days, guide_id, members } = req.body;
    db.prepare(`
      INSERT OR REPLACE INTO active_trip (id, location_id, departure_date, number_of_days, guide_id, members)
      VALUES (1, ?, ?, ?, ?, ?)
    `).run(location_id, departure_date, number_of_days, guide_id, JSON.stringify(members));
    res.json({ success: true });
  });

  app.get("/api/cart", (req, res) => {
    const cartItems = db.prepare(`
      SELECT cart.id as cart_id, cart.product_id, cart.variant_id, cart.mode, cart.quantity, cart.selected, 
             products.name, products.buy_price, products.rent_price_per_day, products.stock_buy, products.stock_rent, products.image,
             variants.name as variant_name, variants.stock_buy as v_stock_buy, variants.stock_rent as v_stock_rent, 
             variants.price_modifier, variants.buy_price as v_buy_price, variants.rent_price_per_day as v_rent_price_per_day
      FROM cart
      JOIN products ON cart.product_id = products.id
      LEFT JOIN variants ON cart.variant_id = variants.id
      ORDER BY cart.id ASC
    `).all() as any[];
    
    // Map fields to match CartItem interface
    const mapped = cartItems.map(item => ({
      ...item,
      stock_buy: item.variant_id ? item.v_stock_buy : item.stock_buy,
      stock_rent: item.variant_id ? item.v_stock_rent : item.stock_rent,
      buy_price: item.variant_id && item.v_buy_price ? item.v_buy_price : (item.buy_price + (item.price_modifier || 0)),
      rent_price_per_day: item.variant_id && item.v_rent_price_per_day ? item.v_rent_price_per_day : (item.rent_price_per_day + (item.price_modifier ? item.price_modifier / 10 : 0))
    }));
    
    res.json(mapped);
  });

  app.post("/api/cart", (req, res) => {
    const { product_id, variant_id, mode, quantity } = req.body;
    
    // Check if item already exists in cart with same mode and variant
    let existing;
    if (variant_id) {
      existing = db.prepare("SELECT * FROM cart WHERE product_id = ? AND variant_id = ? AND mode = ?").get(product_id, variant_id, mode) as any;
    } else {
      existing = db.prepare("SELECT * FROM cart WHERE product_id = ? AND variant_id IS NULL AND mode = ?").get(product_id, mode) as any;
    }
    
    if (existing) {
      db.prepare("UPDATE cart SET quantity = quantity + ? WHERE id = ?").run(quantity, existing.id);
    } else {
      db.prepare("INSERT INTO cart (product_id, variant_id, mode, quantity) VALUES (?, ?, ?, ?)").run(product_id, variant_id, mode, quantity);
    }
    res.json({ success: true });
  });

  app.put("/api/cart/:id", (req, res) => {
    const { quantity, mode, selected, variant_id } = req.body;
    const id = req.params.id;

    if (quantity !== undefined) {
      if (quantity <= 0) {
        db.prepare("DELETE FROM cart WHERE id = ?").run(id);
      } else {
        db.prepare("UPDATE cart SET quantity = ? WHERE id = ?").run(quantity, id);
      }
    }
    
    if (mode !== undefined || variant_id !== undefined) {
      // When changing mode or variant, we might need to merge with an existing item
      const current = db.prepare("SELECT * FROM cart WHERE id = ?").get(id) as any;
      if (current) {
        const newMode = mode !== undefined ? mode : current.mode;
        const newVariantId = variant_id !== undefined ? variant_id : current.variant_id;
        
        let existing;
        if (newVariantId) {
          existing = db.prepare("SELECT * FROM cart WHERE product_id = ? AND variant_id = ? AND mode = ? AND id != ?").get(current.product_id, newVariantId, newMode, id) as any;
        } else {
          existing = db.prepare("SELECT * FROM cart WHERE product_id = ? AND variant_id IS NULL AND mode = ? AND id != ?").get(current.product_id, newMode, id) as any;
        }
        
        if (existing) {
          db.prepare("UPDATE cart SET quantity = quantity + ? WHERE id = ?").run(current.quantity, existing.id);
          db.prepare("DELETE FROM cart WHERE id = ?").run(id);
        } else {
          db.prepare("UPDATE cart SET mode = ?, variant_id = ? WHERE id = ?").run(newMode, newVariantId, id);
        }
      }
    }

    if (selected !== undefined) {
      db.prepare("UPDATE cart SET selected = ? WHERE id = ?").run(selected ? 1 : 0, id);
    }

    res.json({ success: true });
  });

  app.post("/api/checkout", (req, res) => {
    const { items, total } = req.body;
    const orderId = "ET-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    // Deduct stock
    for (const item of items) {
      if (item.mode === 'buy') {
        if (item.variant_id) {
          db.prepare("UPDATE variants SET stock_buy = stock_buy - ? WHERE id = ?").run(item.quantity, item.variant_id);
        } else {
          db.prepare("UPDATE products SET stock_buy = stock_buy - ? WHERE id = ?").run(item.quantity, item.product_id);
        }
      } else {
        if (item.variant_id) {
          db.prepare("UPDATE variants SET stock_rent = stock_rent - ? WHERE id = ?").run(item.quantity, item.variant_id);
        } else {
          db.prepare("UPDATE products SET stock_rent = stock_rent - ? WHERE id = ?").run(item.quantity, item.product_id);
        }
      }
      // Remove from cart
      db.prepare("DELETE FROM cart WHERE id = ?").run(item.cart_id);
    }

    db.prepare("INSERT INTO orders (id, items, total, status) VALUES (?, ?, ?, ?)").run(
      orderId, JSON.stringify(items), total, 'paid'
    );

    res.json({ success: true, orderId });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
