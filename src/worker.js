const SETUP_SQL = `
CREATE TABLE IF NOT EXISTS settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS booking_prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  price_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price REAL NOT NULL DEFAULT 0,
  is_visible INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS special_periods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  period_type TEXT NOT NULL CHECK (
    period_type IN ('season', 'occasion')
  ),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  price REAL NOT NULL DEFAULT 0,
  is_enabled INTEGER NOT NULL DEFAULT 1,
  is_visible INTEGER NOT NULL DEFAULT 1,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price REAL NOT NULL DEFAULT 0,
  is_visible INTEGER NOT NULL DEFAULT 1,
  is_deleted INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_methods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  method_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  action_text TEXT NOT NULL DEFAULT '',
  action_value TEXT NOT NULL DEFAULT '',
  is_enabled INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_bot_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  bot_username TEXT NOT NULL DEFAULT '',
  bot_chat_id TEXT NOT NULL DEFAULT '',
  forward_enabled INTEGER NOT NULL DEFAULT 0,
  amount_prefix TEXT NOT NULL DEFAULT 'SAR',
  test_amount REAL NOT NULL DEFAULT 10,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_number TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT NOT NULL DEFAULT '',
  booking_type TEXT NOT NULL,
  adults INTEGER NOT NULL DEFAULT 1,
  children INTEGER NOT NULL DEFAULT 0,
  people_total INTEGER NOT NULL DEFAULT 1,
  check_in_date TEXT NOT NULL,
  check_in_time TEXT NOT NULL,
  check_out_date TEXT NOT NULL,
  check_out_time TEXT NOT NULL,
  nights_count INTEGER NOT NULL DEFAULT 1,
  notes TEXT NOT NULL DEFAULT '',
  stay_total REAL NOT NULL DEFAULT 0,
  services_total REAL NOT NULL DEFAULT 0,
  insurance_total REAL NOT NULL DEFAULT 0,
  grand_total REAL NOT NULL DEFAULT 0,
  selected_payment_method TEXT NOT NULL DEFAULT '',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  booking_status TEXT NOT NULL DEFAULT 'pending',
  invoice_sent_count INTEGER NOT NULL DEFAULT 0,
  payment_amount_forwarded INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS booking_services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL,
  service_id INTEGER,
  service_name TEXT NOT NULL,
  service_price REAL NOT NULL DEFAULT 0,
  FOREIGN KEY (booking_id)
    REFERENCES bookings(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS booking_nights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL,
  night_date TEXT NOT NULL,
  price_type TEXT NOT NULL,
  price_title TEXT NOT NULL,
  night_price REAL NOT NULL DEFAULT 0,
  FOREIGN KEY (booking_id)
    REFERENCES bookings(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS delivery_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER,
  delivery_type TEXT NOT NULL,
  destination TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  response_message TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id)
    REFERENCES bookings(id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS admin_states (
  chat_id TEXT PRIMARY KEY,
  current_action TEXT NOT NULL DEFAULT '',
  action_data TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO booking_prices
  (price_key, title, description, price, is_visible, sort_order)
VALUES
  ('weekdays', 'أيام الأسبوع', 'السعر المعتاد لأيام الأسبوع', 300, 1, 1),
  ('thursday', 'الخميس', 'سعر ليلة الخميس', 450, 1, 2),
  ('friday', 'الجمعة', 'سعر ليلة الجمعة', 550, 1, 3);

INSERT OR IGNORE INTO settings
  (setting_key, setting_value)
VALUES
  ('prices_section_title', 'أسعار الحجز'),
  (
    'prices_section_description',
    'يتم احتساب سعر كل ليلة تلقائيًا حسب نوع اليوم، وعند توافق التاريخ مع مناسبة أو موسم مفعّل يطبق السعر الخاص به.'
  ),
  ('insurance_enabled', 'true'),
  ('insurance_title', 'تفاصيل التأمين المسترد'),
  ('insurance_amount', '400'),
  (
    'insurance_description',
    'يتم تحصيل مبلغ التأمين للمحافظة على المكان ومحتوياته، ويعاد بعد انتهاء الحجز وفحص المكان.'
  ),
  ('booking_enabled', 'true'),
  ('whatsapp_number', ''),
  (
    'bank_whatsapp_text',
    'تواصل مع الإدارة لاستلام الحساب البنكي للتحويل.'
  ),
  (
    'bank_whatsapp_message',
    'السلام عليكم، أرغب بإكمال دفع الحجز رقم {booking_number} بمبلغ {amount} ريال عن طريق التحويل البنكي.'
  );

INSERT OR IGNORE INTO payment_methods
  (
    method_key,
    title,
    description,
    action_text,
    action_value,
    is_enabled,
    sort_order
  )
VALUES
  (
    'card',
    'بطاقة ائتمان',
    'الدفع باستخدام بطاقة بنكية عبر بوابة دفع آمنة.',
    'الانتقال إلى الدفع',
    '',
    1,
    1
  ),
  (
    'bank',
    'تحويل بنكي',
    'تواصل مع الإدارة لاستلام الحساب البنكي المخصص للتحويل.',
    'تواصل مع الإدارة',
    '',
    1,
    2
  );

INSERT OR IGNORE INTO payment_bot_settings
  (
    id,
    bot_username,
    bot_chat_id,
    forward_enabled,
    amount_prefix,
    test_amount
  )
VALUES
  (1, '', '', 0, 'SAR', 10);

INSERT OR IGNORE INTO services
  (name, description, price, is_visible, sort_order)
VALUES
  (
    'تدفئة المسبح',
    'تشغيل تدفئة المسبح خلال فترة الحجز.',
    100,
    1,
    1
  ),
  (
    'تجهيز مناسبة',
    'تجهيز أساسي للمناسبات والاحتفالات.',
    250,
    1,
    2
  ),
  (
    'تزيين بالبالونات',
    'تنسيق بالونات مناسب للاحتفال.',
    150,
    1,
    3
  ),
  (
    'تنسيق ورد',
    'تنسيق ورد للجلسة أو المناسبة.',
    150,
    1,
    4
  ),
  (
    'قهوة وضيافة',
    'قهوة عربية وشاي ومياه للضيوف.',
    120,
    1,
    5
  ),
  (
    'مستلزمات شواء',
    'فحم وأدوات وتجهيز منطقة الشواء.',
    50,
    1,
    6
  ),
  (
    'فطور صباحي',
    'تجهيز فطور خفيف حسب عدد الأشخاص.',
    180,
    1,
    7
  ),
  (
    'تسجيل دخول مبكر',
    'الدخول قبل الموعد الرسمي حسب التوفر.',
    100,
    1,
    8
  ),
  (
    'تسجيل خروج متأخر',
    'تمديد وقت الخروج حسب التوفر.',
    100,
    1,
    9
  );
`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/setup-db") {
      return setupDatabase(env);
    }

    if (url.pathname === "/api/status") {
      return Response.json({
        ok: true,
        message: "Chalet booking API is working"
      });
    }

    if (url.pathname === "/api/db-status") {
      return databaseStatus(env);
    }

    return env.ASSETS.fetch(request);
  }
};

async function setupDatabase(env) {
  try {
    if (!env.DB) {
      return Response.json(
        {
          ok: false,
          error: "لم يتم العثور على ربط قاعدة البيانات DB"
        },
        { status: 500 }
      );
    }

    await env.DB.exec(SETUP_SQL);

    return Response.json({
      ok: true,
      message: "تم إنشاء جداول قاعدة البيانات والبيانات الأساسية بنجاح"
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}

async function databaseStatus(env) {
  try {
    const result = await env.DB
      .prepare(`
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
        ORDER BY name
      `)
      .all();

    return Response.json({
      ok: true,
      tables: result.results
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error.message
      },
      { status: 500 }
    );
  }
  }
