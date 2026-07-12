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

INSERT OR IGNORE INTO booking_prices (
  price_key,
  title,
  description,
  price,
  is_visible,
  sort_order
)
VALUES
  (
    'weekdays',
    'أيام الأسبوع',
    'السعر المعتاد لأيام الأسبوع',
    300,
    1,
    1
  ),
  (
    'thursday',
    'الخميس',
    'سعر ليلة الخميس',
    450,
    1,
    2
  ),
  (
    'friday',
    'الجمعة',
    'سعر ليلة الجمعة',
    550,
    1,
    3
  );

INSERT OR IGNORE INTO settings (
  setting_key,
  setting_value
)
VALUES
  (
    'prices_section_title',
    'أسعار الحجز'
  ),
  (
    'prices_section_description',
    'يتم احتساب سعر كل ليلة تلقائيًا حسب نوع اليوم، وعند توافق التاريخ مع مناسبة أو موسم مفعّل يطبق السعر الخاص به.'
  ),
  (
    'insurance_enabled',
    'true'
  ),
  (
    'insurance_title',
    'تفاصيل التأمين المسترد'
  ),
  (
    'insurance_amount',
    '400'
  ),
  (
    'insurance_description',
    'يتم تحصيل مبلغ التأمين للمحافظة على المكان ومحتوياته، ويعاد بعد انتهاء الحجز وفحص المكان.'
  ),
  (
    'booking_enabled',
    'true'
  ),
  (
    'whatsapp_number',
    ''
  ),
  (
    'bank_whatsapp_text',
    'تواصل مع الإدارة لاستلام الحساب البنكي للتحويل.'
  ),
  (
    'bank_whatsapp_message',
    'السلام عليكم، أرغب بإكمال دفع الحجز رقم {booking_number} بمبلغ {amount} ريال عن طريق التحويل البنكي.'
  );

INSERT OR IGNORE INTO payment_methods (
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

INSERT OR IGNORE INTO payment_bot_settings (
  id,
  bot_username,
  bot_chat_id,
  forward_enabled,
  amount_prefix,
  test_amount
)
VALUES (
  1,
  '',
  '',
  0,
  'SAR',
  10
);

INSERT OR IGNORE INTO services (
  name,
  description,
  price,
  is_visible,
  sort_order
)
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

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders()
      });
    }

    if (
      url.pathname === "/setup-db" &&
      request.method === "GET"
    ) {
      return setupDatabase(env);
    }

    if (
      url.pathname === "/api/status" &&
      request.method === "GET"
    ) {
      return jsonResponse({
        ok: true,
        message: "Chalet booking API is working"
      });
    }

    if (
      url.pathname === "/api/db-status" &&
      request.method === "GET"
    ) {
      return databaseStatus(env);
    }

    if (
      url.pathname === "/api/store" &&
      request.method === "GET"
    ) {
      return getStoreData(env);
    }

    if (
      url.pathname === "/api/booking-event" &&
      request.method === "POST"
    ) {
      return handleBookingEvent(request, env);
    }

    if (
      url.pathname === "/setup-webhook" &&
      request.method === "GET"
    ) {
      return setupTelegramWebhook(request, env);
    }

    if (
      url.pathname === "/telegram" &&
      request.method === "POST"
    ) {
      return handleTelegramWebhook(request, env);
    }

    return env.ASSETS.fetch(request);
  }
};

async function setupDatabase(env) {
  try {
    if (!env.DB) {
      return jsonResponse(
        {
          ok: false,
          error:
            "لم يتم العثور على ربط قاعدة البيانات DB"
        },
        500
      );
    }

    const statements = SETUP_SQL
      .split(";")
      .map(statement => statement.trim())
      .filter(Boolean);

    let executedCount = 0;

    for (
      let index = 0;
      index < statements.length;
      index += 10
    ) {
      const group = statements.slice(
        index,
        index + 10
      );

      await env.DB.batch(
        group.map(sql =>
          env.DB.prepare(sql)
        )
      );

      executedCount += group.length;
    }

    return jsonResponse({
      ok: true,
      message:
        "تم إنشاء جداول قاعدة البيانات والبيانات الأساسية بنجاح",
      statements_executed: executedCount
    });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error: getErrorMessage(error)
      },
      500
    );
  }
}

async function databaseStatus(env) {
  try {
    const tables = await env.DB
      .prepare(`
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
          AND name NOT LIKE 'sqlite_%'
        ORDER BY name
      `)
      .all();

    const prices = await env.DB
      .prepare(`
        SELECT
          price_key,
          title,
          description,
          price,
          is_visible,
          sort_order
        FROM booking_prices
        ORDER BY sort_order ASC
      `)
      .all();

    const servicesCount = await env.DB
      .prepare(`
        SELECT COUNT(*) AS total
        FROM services
        WHERE is_deleted = 0
      `)
      .first();

    return jsonResponse({
      ok: true,
      database_connected: true,
      tables: tables.results,
      booking_prices: prices.results,
      services_count:
        Number(servicesCount?.total || 0)
    });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        database_connected: false,
        error: getErrorMessage(error)
      },
      500
    );
  }
}

async function getStoreData(env) {
  try {
    const pricesResult = await env.DB
      .prepare(`
        SELECT
          id,
          price_key,
          title,
          description,
          price,
          is_visible,
          sort_order
        FROM booking_prices
        WHERE is_visible = 1
        ORDER BY sort_order ASC
      `)
      .all();

    const servicesResult = await env.DB
      .prepare(`
        SELECT
          id,
          name,
          description,
          price,
          is_visible,
          sort_order
        FROM services
        WHERE is_deleted = 0
          AND is_visible = 1
        ORDER BY sort_order ASC, id ASC
      `)
      .all();

    const periodsResult = await env.DB
      .prepare(`
        SELECT
          id,
          period_type,
          title,
          description,
          start_date,
          end_date,
          price,
          is_enabled,
          is_visible,
          priority
        FROM special_periods
        WHERE is_enabled = 1
          AND is_visible = 1
        ORDER BY priority DESC, id DESC
      `)
      .all();

    const paymentMethodsResult = await env.DB
      .prepare(`
        SELECT
          id,
          method_key,
          title,
          description,
          action_text,
          action_value,
          is_enabled,
          sort_order
        FROM payment_methods
        WHERE is_enabled = 1
        ORDER BY sort_order ASC
      `)
      .all();

    const settingsResult = await env.DB
      .prepare(`
        SELECT
          setting_key,
          setting_value
        FROM settings
      `)
      .all();

    const settings = {};

    for (const row of settingsResult.results || []) {
      settings[row.setting_key] =
        row.setting_value;
    }

    return jsonResponse({
      ok: true,

      booking_enabled:
        settings.booking_enabled === "true",

      prices: pricesResult.results || [],

      services:
        servicesResult.results || [],

      special_periods:
        periodsResult.results || [],

      payment_methods:
        paymentMethodsResult.results || [],

      insurance: {
        enabled:
          settings.insurance_enabled === "true",

        title:
          settings.insurance_title ||
          "تفاصيل التأمين المسترد",

        amount:
          Number(
            settings.insurance_amount || 0
          ),

        description:
          settings.insurance_description || ""
      },

      site: {
        prices_title:
          settings.prices_section_title ||
          "أسعار الحجز",

        prices_description:
          settings.prices_section_description ||
          "",

        whatsapp_number:
          settings.whatsapp_number || "",

        bank_whatsapp_text:
          settings.bank_whatsapp_text || "",

        bank_whatsapp_message:
          settings.bank_whatsapp_message || ""
      }
    });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error: getErrorMessage(error)
      },
      500
    );
  }
}

async function setupTelegramWebhook(
  request,
  env
) {
  try {
    if (!env.ADMIN_BOT_TOKEN) {
      throw new Error(
        "ADMIN_BOT_TOKEN غير موجود"
      );
    }

    if (!env.ADMIN_CHAT_ID) {
      throw new Error(
        "ADMIN_CHAT_ID غير موجود"
      );
    }

    const url = new URL(request.url);
    const key =
      url.searchParams.get("key");

    if (
      String(key || "") !==
      String(env.ADMIN_CHAT_ID)
    ) {
      return jsonResponse(
        {
          ok: false,
          error: "غير مصرح"
        },
        403
      );
    }

    const webhookUrl =
      `${url.origin}/telegram`;

    const result = await telegramApi(
      env,
      "setWebhook",
      {
        url: webhookUrl,
        allowed_updates: [
          "message",
          "callback_query"
        ],
        drop_pending_updates: true
      }
    );

    return jsonResponse({
      ok: true,
      message:
        "تم ربط بوت الإدارة بنجاح",
      webhook_url: webhookUrl,
      telegram: result.result
    });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error: getErrorMessage(error)
      },
      500
    );
  }
}

async function handleTelegramWebhook(
  request,
  env
) {
  try {
    const update = await request.json();

    const message =
      update.message || null;

    const callback =
      update.callback_query || null;

    const senderId =
      message?.from?.id ??
      callback?.from?.id;

    const chatId =
      message?.chat?.id ??
      callback?.message?.chat?.id;

    const chatType =
      message?.chat?.type ??
      callback?.message?.chat?.type ??
      "";

    const text =
      String(message?.text || "").trim();

    /*
      يسمح للمدير بحفظ مجموعة الدفع.
      هذا الأمر يعمل داخل المجموعة فقط.
    */
    if (
      message &&
      String(senderId) ===
        String(env.ADMIN_CHAT_ID) &&
      ["group", "supergroup"].includes(
        chatType
      ) &&
      text === "/setpaymentgroup"
    ) {
      await savePaymentGroup(
        env,
        chatId,
        message.chat.title || ""
      );

      await sendTelegramMessage(
        env,
        chatId,
        "تم ربط هذه المجموعة بنظام الدفع بنجاح ✅\n\nسيتم إرسال المبالغ هنا بصيغة:\nSAR 2.900"
      );

      return jsonResponse({
        ok: true
      });
    }

    /*
      لا يعرض لوحة الإدارة داخل المجموعات
      عند إرسال رسائل عادية.
    */
    if (
      ["group", "supergroup"].includes(
        chatType
      )
    ) {
      return jsonResponse({
        ok: true,
        group_message_ignored: true
      });
    }

    if (
      String(senderId || "") !==
      String(env.ADMIN_CHAT_ID)
    ) {
      return jsonResponse({
        ok: true,
        ignored: true
      });
    }

    if (callback) {
      await handleCallbackQuery(
        callback,
        env
      );

      return jsonResponse({
        ok: true
      });
    }

    if (message) {
      await handleAdminMessage(
        message,
        env
      );
    }

    return jsonResponse({
      ok: true
    });
  } catch (error) {
    console.error(
      "Telegram webhook error:",
      error
    );

    return jsonResponse({
      ok: true,
      handled: false
    });
  }
}

async function handleAdminMessage(
  message,
  env
) {
  const chatId = message.chat.id;
  const text = String(
    message.text || ""
  ).trim();

  if (
    text === "🏠 القائمة الرئيسية"
  ) {
    await clearAdminState(
      env,
      chatId
    );

    await sendMainMenu(
      env,
      chatId
    );

    return;
  }

  if (text === "💰 الأسعار") {
    await clearAdminState(
      env,
      chatId
    );

    await showPricesMenu(
      env,
      chatId
    );

    return;
  }

  if (text === "🧰 الخدمات") {
    await clearAdminState(
      env,
      chatId
    );

    await showServicesMenu(
      env,
      chatId
    );

    return;
  }

  if (
    text === "📋 طلبات الحجز"
  ) {
    await clearAdminState(
      env,
      chatId
    );

    await showBookingsMenu(
      env,
      chatId
    );

    return;
  }

  if (text === "💳 طرق الدفع") {
    await clearAdminState(
      env,
      chatId
    );

    await showPaymentMethodsMenu(
      env,
      chatId
    );

    return;
  }

  if (
    text === "/start" ||
    text === "/menu" ||
    text === "القائمة"
  ) {
    await clearAdminState(
      env,
      chatId
    );

    await sendMainMenu(
      env,
      chatId
    );

    return;
  }

  const state =
    await getAdminState(
      env,
      chatId
    );

  if (state?.current_action) {
    const handled =
      await handleAdminStateMessage(
        env,
        chatId,
        text,
        state
      );

    if (handled) {
      return;
    }
  }

  await sendMainMenu(
    env,
    chatId,
    "اختر القسم المطلوب من الأزرار:"
  );
}

async function handleCallbackQuery(
  callback,
  env
) {
  const callbackId = callback.id;
  const chatId =
    callback.message?.chat?.id;
  const data = String(
    callback.data || ""
  );

  await answerCallback(
    env,
    callbackId
  );

  if (!chatId) {
    return;
  }

  if (data === "main_menu") {
    await clearAdminState(
      env,
      chatId
    );

    await sendMainMenu(
      env,
      chatId
    );

    return;
  }

  if (data === "menu_prices") {
    await clearAdminState(
      env,
      chatId
    );

    await showPricesMenu(
      env,
      chatId
    );

    return;
  }

  if (
    data.startsWith("price_edit:")
  ) {
    const id =
      Number(data.split(":")[1]);

    await showPriceEditMenu(
      env,
      chatId,
      id
    );

    return;
  }

  if (
    data.startsWith(
      "price_toggle:"
    )
  ) {
    const id =
      Number(data.split(":")[1]);

    await togglePrice(
      env,
      id
    );

    await showPricesMenu(
      env,
      chatId
    );

    return;
  }

  if (
    data.startsWith(
      "price_toggle_edit:"
    )
  ) {
    const id =
      Number(data.split(":")[1]);

    await togglePrice(
      env,
      id
    );

    await showPriceEditMenu(
      env,
      chatId,
      id
    );

    return;
  }

  if (
    data.startsWith(
      "price_name_edit:"
    )
  ) {
    const id =
      Number(data.split(":")[1]);

    await setAdminState(
      env,
      chatId,
      "price_name_edit",
      {
        priceId: id
      }
    );

    await sendInputRequest(
      env,
      chatId,
      "أرسل الاسم الجديد للسعر.\n\nمثال:\nوسط الأسبوع",
      `price_edit:${id}`
    );

    return;
  }

  if (
    data.startsWith(
      "price_description_edit:"
    )
  ) {
    const id =
      Number(data.split(":")[1]);

    await setAdminState(
      env,
      chatId,
      "price_description_edit",
      {
        priceId: id
      }
    );

    await sendInputRequest(
      env,
      chatId,
      "أرسل الوصف الجديد للسعر.",
      `price_edit:${id}`
    );

    return;
  }

  if (
    data.startsWith(
      "price_value_edit:"
    )
  ) {
    const id =
      Number(data.split(":")[1]);

    await setAdminState(
      env,
      chatId,
      "price_value_edit",
      {
        priceId: id
      }
    );

    await sendInputRequest(
      env,
      chatId,
      "أرسل السعر الجديد بالأرقام فقط.\n\nمثال:\n350",
      `price_edit:${id}`
    );

    return;
  }

  if (data === "menu_services") {
    await clearAdminState(
      env,
      chatId
    );

    await showServicesMenu(
      env,
      chatId
    );

    return;
  }

  if (data === "service_add") {
    await setAdminState(
      env,
      chatId,
      "service_add_name",
      {}
    );

    await sendInputRequest(
      env,
      chatId,
      "أرسل اسم الخدمة الجديدة.\n\nمثال:\nتنظيف إضافي",
      "menu_services"
    );

    return;
  }

  if (
    data.startsWith("service_edit:")
  ) {
    const id =
      Number(data.split(":")[1]);

    await showServiceEditMenu(
      env,
      chatId,
      id
    );

    return;
  }

  if (
    data.startsWith(
      "service_name_edit:"
    )
  ) {
    const id =
      Number(data.split(":")[1]);

    await setAdminState(
      env,
      chatId,
      "service_name_edit",
      {
        serviceId: id
      }
    );

    await sendInputRequest(
      env,
      chatId,
      "أرسل الاسم الجديد للخدمة.",
      `service_edit:${id}`
    );

    return;
  }

  if (
    data.startsWith(
      "service_description_edit:"
    )
  ) {
    const id =
      Number(data.split(":")[1]);

    await setAdminState(
      env,
      chatId,
      "service_description_edit",
      {
        serviceId: id
      }
    );

    await sendInputRequest(
      env,
      chatId,
      "أرسل الوصف الجديد للخدمة.",
      `service_edit:${id}`
    );

    return;
  }

  if (
    data.startsWith(
      "service_price_edit:"
    )
  ) {
    const id =
      Number(data.split(":")[1]);

    await setAdminState(
      env,
      chatId,
      "service_price_edit",
      {
        serviceId: id
      }
    );

    await sendInputRequest(
      env,
      chatId,
      "أرسل سعر الخدمة الجديد بالأرقام فقط.",
      `service_edit:${id}`
    );

    return;
  }

  if (
    data.startsWith(
      "service_toggle:"
    )
  ) {
    const id =
      Number(data.split(":")[1]);

    await toggleService(
      env,
      id
    );

    await showServicesMenu(
      env,
      chatId
    );

    return;
  }

  if (
    data.startsWith(
      "service_toggle_edit:"
    )
  ) {
    const id =
      Number(data.split(":")[1]);

    await toggleService(
      env,
      id
    );

    await showServiceEditMenu(
      env,
      chatId,
      id
    );

    return;
  }

  if (
    data.startsWith(
      "service_delete_confirm:"
    )
  ) {
    const id =
      Number(data.split(":")[1]);

    await showServiceDeleteConfirm(
      env,
      chatId,
      id
    );

    return;
  }

  if (
    data.startsWith(
      "service_delete:"
    )
  ) {
    const id =
      Number(data.split(":")[1]);

    await deleteService(
      env,
      id
    );

    await sendTelegramMessage(
      env,
      chatId,
      "تم حذف الخدمة بنجاح ✅"
    );

    await showServicesMenu(
      env,
      chatId
    );

    return;
  }

  if (data === "menu_periods") {
    await showPeriodsMenu(
      env,
      chatId
    );

    return;
  }

  if (data === "menu_insurance") {
    await showInsuranceMenu(
      env,
      chatId
    );

    return;
  }

  if (
    data === "insurance_toggle"
  ) {
    await toggleSettingBoolean(
      env,
      "insurance_enabled"
    );

    await showInsuranceMenu(
      env,
      chatId
    );

    return;
  }

  if (data === "menu_payments") {
    await showPaymentMethodsMenu(
      env,
      chatId
    );

    return;
  }

  if (
    data.startsWith(
      "payment_toggle:"
    )
  ) {
    const id =
      Number(data.split(":")[1]);

    await togglePaymentMethod(
      env,
      id
    );

    await showPaymentMethodsMenu(
      env,
      chatId
    );

    return;
  }

  if (data === "card_payment_url_edit") {
    await setAdminState(
      env,
      chatId,
      "card_payment_url_edit",
      {}
    );

    await sendInputRequest(
      env,
      chatId,
      "أرسل رابط بوابة الدفع كاملًا.\n\nمثال:\nhttps://payment.example.com/pay",
      "menu_payments"
    );

    return;
  }

  if (
    data === "bank_whatsapp_edit" ||
    data === "site_whatsapp_edit"
  ) {
    await setAdminState(
      env,
      chatId,
      "whatsapp_number_edit",
      {}
    );

    await sendInputRequest(
      env,
      chatId,
      "أرسل رقم واتساب بصيغة دولية بدون علامة + وبدون مسافات.\n\nمثال:\n966501234567",
      "menu_payments"
    );

    return;
  }

  if (
    data === "payment_bot_test"
  ) {
    const result =
      await sendAmountToPaymentGroup(
        env,
        10
      );

    await sendTelegramMessage(
      env,
      chatId,
      result.ok
        ? "تم إرسال SAR 10 إلى مجموعة الدفع بنجاح ✅"
        : `فشل الاختبار:\n${result.error}`
    );

    return;
  }

  if (
    data === "payment_bot_delete"
  ) {
    await env.DB
      .prepare(`
        UPDATE payment_bot_settings
        SET
          bot_chat_id = '',
          bot_username = '',
          forward_enabled = 0,
          updated_at =
            CURRENT_TIMESTAMP
        WHERE id = 1
      `)
      .run();

    await sendTelegramMessage(
      env,
      chatId,
      "تم حذف ربط مجموعة الدفع."
    );

    await showPaymentBotMenu(
      env,
      chatId
    );

    return;
  }

  if (
    data === "menu_payment_bot"
  ) {
    await showPaymentBotMenu(
      env,
      chatId
    );

    return;
  }

  if (
    data === "payment_bot_toggle"
  ) {
    await togglePaymentBotForwarding(
      env
    );

    await showPaymentBotMenu(
      env,
      chatId
    );

    return;
  }

  if (data === "menu_bookings") {
    await showBookingsMenu(
      env,
      chatId
    );

    return;
  }

  if (data === "menu_site") {
    await showSiteSettingsMenu(
      env,
      chatId
    );

    return;
  }

  if (data === "booking_toggle") {
    await toggleSettingBoolean(
      env,
      "booking_enabled"
    );

    await showSiteSettingsMenu(
      env,
      chatId
    );

    return;
  }

  await sendTelegramMessage(
    env,
    chatId,
    "هذا الزر سيتم تفعيله في التحديث التالي.",
    {
      inline_keyboard: [
        backButton()
      ]
    }
  );
}

async function sendMainMenu(
  env,
  chatId,
  text =
    "لوحة إدارة نظام حجز الشاليه\n\nاختر القسم المطلوب:"
) {
  /*
    لوحة ثابتة أسفل خانة الكتابة.
  */
  await sendTelegramMessage(
    env,
    chatId,
    "تم تثبيت لوحة التحكم أسفل المحادثة ✅",
    {
      keyboard: [
        [
          {
            text: "🏠 القائمة الرئيسية"
          }
        ],
        [
          {
            text: "💰 الأسعار"
          },
          {
            text: "🧰 الخدمات"
          }
        ],
        [
          {
            text: "📋 طلبات الحجز"
          },
          {
            text: "💳 طرق الدفع"
          }
        ]
      ],
      resize_keyboard: true,
      is_persistent: true,
      input_field_placeholder:
        "اختر من لوحة الإدارة"
    }
  );

  /*
    لوحة الأقسام داخل الرسالة.
  */
  await sendTelegramMessage(
    env,
    chatId,
    text,
    {
      inline_keyboard: [
        [
          {
            text: "💰 الأسعار",
            callback_data:
              "menu_prices"
          },
          {
            text: "🧰 الخدمات",
            callback_data:
              "menu_services"
          }
        ],
        [
          {
            text:
              "📅 المواسم والمناسبات",
            callback_data:
              "menu_periods"
          }
        ],
        [
          {
            text:
              "🛡 التأمين المسترد",
            callback_data:
              "menu_insurance"
          },
          {
            text: "💳 طرق الدفع",
            callback_data:
              "menu_payments"
          }
        ],
        [
          {
            text: "🤖 بوت الدفع",
            callback_data:
              "menu_payment_bot"
          }
        ],
        [
          {
            text: "📋 طلبات الحجز",
            callback_data:
              "menu_bookings"
          },
          {
            text:
              "⚙️ إعدادات الموقع",
            callback_data:
              "menu_site"
          }
        ]
      ]
    }
  );
}

async function showPricesMenu(
  env,
  chatId
) {
  const result = await env.DB
    .prepare(`
      SELECT
        id,
        title,
        description,
        price,
        is_visible
      FROM booking_prices
      ORDER BY sort_order ASC
    `)
    .all();

  const prices =
    result.results || [];

  let text =
    "💰 أسعار الحجز\n\n";

  for (const price of prices) {
    text +=
      `${price.is_visible ? "✅" : "🚫"} ` +
      `${price.title}\n` +
      `السعر: ${formatMoney(price.price)}\n` +
      `${price.description || "لا يوجد وصف"}\n\n`;
  }

  const keyboard =
    prices.map(price => [
      {
        text:
          `✏️ ${price.title} — ` +
          `${formatMoney(price.price)}`,
        callback_data:
          `price_edit:${price.id}`
      },
      {
        text:
          price.is_visible
            ? "إخفاء"
            : "إظهار",
        callback_data:
          `price_toggle:${price.id}`
      }
    ]);

  keyboard.push(
    backButton()
  );

  await sendTelegramMessage(
    env,
    chatId,
    text,
    {
      inline_keyboard: keyboard
    }
  );
}

async function showPriceEditMenu(
  env,
  chatId,
  priceId
) {
  await clearAdminState(
    env,
    chatId
  );

  const price = await env.DB
    .prepare(`
      SELECT
        id,
        title,
        description,
        price,
        is_visible
      FROM booking_prices
      WHERE id = ?
    `)
    .bind(priceId)
    .first();

  if (!price) {
    await sendTelegramMessage(
      env,
      chatId,
      "لم يتم العثور على السعر."
    );

    return;
  }

  const text =
    "✏️ تعديل السعر\n\n" +
    `الاسم: ${price.title}\n` +
    `الوصف: ${price.description || "لا يوجد"}\n` +
    `السعر: ${formatMoney(price.price)}\n` +
    `الحالة: ${
      price.is_visible
        ? "ظاهر ✅"
        : "مخفي 🚫"
    }`;

  await sendTelegramMessage(
    env,
    chatId,
    text,
    {
      inline_keyboard: [
        [
          {
            text: "تعديل الاسم",
            callback_data:
              `price_name_edit:${price.id}`
          }
        ],
        [
          {
            text: "تعديل الوصف",
            callback_data:
              `price_description_edit:${price.id}`
          }
        ],
        [
          {
            text: "تعديل السعر",
            callback_data:
              `price_value_edit:${price.id}`
          }
        ],
        [
          {
            text:
              price.is_visible
                ? "إخفاء"
                : "إظهار",
            callback_data:
              `price_toggle_edit:${price.id}`
          }
        ],
        [
          {
            text: "⬅️ رجوع للأسعار",
            callback_data:
              "menu_prices"
          }
        ]
      ]
    }
  );
}

async function togglePrice(
  env,
  id
) {
  await env.DB
    .prepare(`
      UPDATE booking_prices
      SET
        is_visible = CASE
          WHEN is_visible = 1 THEN 0
          ELSE 1
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    .bind(id)
    .run();
}

async function showServicesMenu(
  env,
  chatId
) {
  const result = await env.DB
    .prepare(`
      SELECT
        id,
        name,
        description,
        price,
        is_visible
      FROM services
      WHERE is_deleted = 0
      ORDER BY sort_order ASC, id ASC
    `)
    .all();

  const services =
    result.results || [];

  let text =
    "🧰 الخدمات الإضافية\n\n";

  if (!services.length) {
    text += "لا توجد خدمات.";
  } else {
    for (
      const service of services
    ) {
      text +=
        `${service.is_visible ? "✅" : "🚫"} ` +
        `${service.name}\n` +
        `السعر: ${formatMoney(service.price)}\n` +
        `${service.description || "لا يوجد وصف"}\n\n`;
    }
  }

  const keyboard = [
    [
      {
        text: "➕ إضافة خدمة جديدة",
        callback_data:
          "service_add"
      }
    ]
  ];

  for (
    const service of services
  ) {
    keyboard.push([
      {
        text:
          `✏️ ${service.name} — ` +
          `${formatMoney(service.price)}`,
        callback_data:
          `service_edit:${service.id}`
      },
      {
        text:
          service.is_visible
            ? "إخفاء"
            : "إظهار",
        callback_data:
          `service_toggle:${service.id}`
      }
    ]);
  }

  keyboard.push(
    backButton()
  );

  await sendTelegramMessage(
    env,
    chatId,
    text,
    {
      inline_keyboard: keyboard
    }
  );
}

async function showServiceEditMenu(
  env,
  chatId,
  serviceId
) {
  await clearAdminState(
    env,
    chatId
  );

  const service = await env.DB
    .prepare(`
      SELECT
        id,
        name,
        description,
        price,
        is_visible
      FROM services
      WHERE id = ?
        AND is_deleted = 0
    `)
    .bind(serviceId)
    .first();

  if (!service) {
    await sendTelegramMessage(
      env,
      chatId,
      "لم يتم العثور على الخدمة."
    );

    return;
  }

  const text =
    "✏️ تعديل الخدمة\n\n" +
    `الاسم: ${service.name}\n` +
    `الوصف: ${service.description || "لا يوجد"}\n` +
    `السعر: ${formatMoney(service.price)}\n` +
    `الحالة: ${
      service.is_visible
        ? "ظاهرة ✅"
        : "مخفية 🚫"
    }`;

  await sendTelegramMessage(
    env,
    chatId,
    text,
    {
      inline_keyboard: [
        [
          {
            text: "تعديل الاسم",
            callback_data:
              `service_name_edit:${service.id}`
          }
        ],
        [
          {
            text: "تعديل الوصف",
            callback_data:
              `service_description_edit:${service.id}`
          }
        ],
        [
          {
            text: "تعديل السعر",
            callback_data:
              `service_price_edit:${service.id}`
          }
        ],
        [
          {
            text:
              service.is_visible
                ? "إخفاء الخدمة"
                : "إظهار الخدمة",
            callback_data:
              `service_toggle_edit:${service.id}`
          }
        ],
        [
          {
            text: "🗑 حذف الخدمة",
            callback_data:
              `service_delete_confirm:${service.id}`
          }
        ],
        [
          {
            text:
              "⬅️ رجوع للخدمات",
            callback_data:
              "menu_services"
          }
        ]
      ]
    }
  );
}

async function showServiceDeleteConfirm(
  env,
  chatId,
  serviceId
) {
  const service = await env.DB
    .prepare(`
      SELECT id, name
      FROM services
      WHERE id = ?
        AND is_deleted = 0
    `)
    .bind(serviceId)
    .first();

  if (!service) {
    return;
  }

  await sendTelegramMessage(
    env,
    chatId,
    `هل أنت متأكد من حذف خدمة:\n\n${service.name}`,
    {
      inline_keyboard: [
        [
          {
            text: "نعم، حذف",
            callback_data:
              `service_delete:${service.id}`
          },
          {
            text: "إلغاء",
            callback_data:
              `service_edit:${service.id}`
          }
        ]
      ]
    }
  );
}

async function toggleService(
  env,
  id
) {
  await env.DB
    .prepare(`
      UPDATE services
      SET
        is_visible = CASE
          WHEN is_visible = 1 THEN 0
          ELSE 1
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND is_deleted = 0
    `)
    .bind(id)
    .run();
}

async function deleteService(
  env,
  id
) {
  await env.DB
    .prepare(`
      UPDATE services
      SET
        is_deleted = 1,
        is_visible = 0,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    .bind(id)
    .run();
}

async function handleAdminStateMessage(
  env,
  chatId,
  text,
  state
) {
  let data = {};

  try {
    data = JSON.parse(
      state.action_data || "{}"
    );
  } catch {
    data = {};
  }

  const action =
    state.current_action;

  if (
    action === "price_name_edit"
  ) {
    if (!validText(text, 2, 80)) {
      await sendTelegramMessage(
        env,
        chatId,
        "أرسل اسمًا صحيحًا من 2 إلى 80 حرفًا."
      );

      return true;
    }

    await env.DB
      .prepare(`
        UPDATE booking_prices
        SET
          title = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(
        text,
        Number(data.priceId)
      )
      .run();

    await clearAdminState(
      env,
      chatId
    );

    await sendTelegramMessage(
      env,
      chatId,
      "تم تعديل الاسم بنجاح ✅"
    );

    await showPriceEditMenu(
      env,
      chatId,
      Number(data.priceId)
    );

    return true;
  }

  if (
    action ===
    "price_description_edit"
  ) {
    if (!validText(text, 1, 500)) {
      await sendTelegramMessage(
        env,
        chatId,
        "أرسل وصفًا صحيحًا."
      );

      return true;
    }

    await env.DB
      .prepare(`
        UPDATE booking_prices
        SET
          description = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(
        text,
        Number(data.priceId)
      )
      .run();

    await clearAdminState(
      env,
      chatId
    );

    await sendTelegramMessage(
      env,
      chatId,
      "تم تعديل الوصف بنجاح ✅"
    );

    await showPriceEditMenu(
      env,
      chatId,
      Number(data.priceId)
    );

    return true;
  }

  if (
    action ===
    "price_value_edit"
  ) {
    const price =
      parsePrice(text);

    if (price === null) {
      await sendTelegramMessage(
        env,
        chatId,
        "السعر غير صحيح. أرسل رقمًا فقط."
      );

      return true;
    }

    await env.DB
      .prepare(`
        UPDATE booking_prices
        SET
          price = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(
        price,
        Number(data.priceId)
      )
      .run();

    await clearAdminState(
      env,
      chatId
    );

    await sendTelegramMessage(
      env,
      chatId,
      `تم تعديل السعر إلى ${formatMoney(price)} ✅`
    );

    await showPriceEditMenu(
      env,
      chatId,
      Number(data.priceId)
    );

    return true;
  }

  if (
    action ===
    "service_name_edit"
  ) {
    if (!validText(text, 2, 100)) {
      await sendTelegramMessage(
        env,
        chatId,
        "أرسل اسم خدمة صحيحًا."
      );

      return true;
    }

    await env.DB
      .prepare(`
        UPDATE services
        SET
          name = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
          AND is_deleted = 0
      `)
      .bind(
        text,
        Number(data.serviceId)
      )
      .run();

    await clearAdminState(
      env,
      chatId
    );

    await sendTelegramMessage(
      env,
      chatId,
      "تم تعديل اسم الخدمة ✅"
    );

    await showServiceEditMenu(
      env,
      chatId,
      Number(data.serviceId)
    );

    return true;
  }

  if (
    action ===
    "service_description_edit"
  ) {
    if (!validText(text, 1, 500)) {
      await sendTelegramMessage(
        env,
        chatId,
        "أرسل وصفًا صحيحًا."
      );

      return true;
    }

    await env.DB
      .prepare(`
        UPDATE services
        SET
          description = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
          AND is_deleted = 0
      `)
      .bind(
        text,
        Number(data.serviceId)
      )
      .run();

    await clearAdminState(
      env,
      chatId
    );

    await sendTelegramMessage(
      env,
      chatId,
      "تم تعديل وصف الخدمة ✅"
    );

    await showServiceEditMenu(
      env,
      chatId,
      Number(data.serviceId)
    );

    return true;
  }

  if (
    action ===
    "service_price_edit"
  ) {
    const price =
      parsePrice(text);

    if (price === null) {
      await sendTelegramMessage(
        env,
        chatId,
        "السعر غير صحيح. أرسل رقمًا فقط."
      );

      return true;
    }

    await env.DB
      .prepare(`
        UPDATE services
        SET
          price = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
          AND is_deleted = 0
      `)
      .bind(
        price,
        Number(data.serviceId)
      )
      .run();

    await clearAdminState(
      env,
      chatId
    );

    await sendTelegramMessage(
      env,
      chatId,
      `تم تعديل سعر الخدمة إلى ${formatMoney(price)} ✅`
    );

    await showServiceEditMenu(
      env,
      chatId,
      Number(data.serviceId)
    );

    return true;
  }

  if (
    action ===
    "service_add_name"
  ) {
    if (!validText(text, 2, 100)) {
      await sendTelegramMessage(
        env,
        chatId,
        "أرسل اسم خدمة صحيحًا."
      );

      return true;
    }

    await setAdminState(
      env,
      chatId,
      "service_add_description",
      {
        name: text
      }
    );

    await sendTelegramMessage(
      env,
      chatId,
      "أرسل وصف الخدمة الجديدة."
    );

    return true;
  }

  if (
    action ===
    "service_add_description"
  ) {
    if (!validText(text, 1, 500)) {
      await sendTelegramMessage(
        env,
        chatId,
        "أرسل وصفًا صحيحًا."
      );

      return true;
    }

    await setAdminState(
      env,
      chatId,
      "service_add_price",
      {
        name: data.name,
        description: text
      }
    );

    await sendTelegramMessage(
      env,
      chatId,
      "أرسل سعر الخدمة بالأرقام فقط."
    );

    return true;
  }

  if (
    action ===
    "service_add_price"
  ) {
    const price =
      parsePrice(text);

    if (price === null) {
      await sendTelegramMessage(
        env,
        chatId,
        "السعر غير صحيح. أرسل رقمًا فقط."
      );

      return true;
    }

    const sortResult =
      await env.DB
        .prepare(`
          SELECT
            COALESCE(MAX(sort_order), 0) + 1
            AS next_order
          FROM services
        `)
        .first();

    const insertResult =
      await env.DB
        .prepare(`
          INSERT INTO services (
            name,
            description,
            price,
            is_visible,
            is_deleted,
            sort_order,
            created_at,
            updated_at
          )
          VALUES (
            ?,
            ?,
            ?,
            1,
            0,
            ?,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
        `)
        .bind(
          data.name,
          data.description,
          price,
          Number(
            sortResult?.next_order || 1
          )
        )
        .run();

    await clearAdminState(
      env,
      chatId
    );

    await sendTelegramMessage(
      env,
      chatId,
      "تمت إضافة الخدمة بنجاح ✅"
    );

    const newId =
      Number(
        insertResult.meta?.last_row_id ||
        0
      );

    if (newId) {
      await showServiceEditMenu(
        env,
        chatId,
        newId
      );
    } else {
      await showServicesMenu(
        env,
        chatId
      );
    }

    return true;
  }

  if (
    action ===
    "card_payment_url_edit"
  ) {
    let paymentUrl;

    try {
      paymentUrl =
        new URL(text.trim());
    } catch {
      await sendTelegramMessage(
        env,
        chatId,
        "الرابط غير صحيح. أرسل رابطًا كاملًا يبدأ بـ https://"
      );

      return true;
    }

    if (
      paymentUrl.protocol !==
      "https:"
    ) {
      await sendTelegramMessage(
        env,
        chatId,
        "يجب أن يبدأ رابط الدفع بـ https://"
      );

      return true;
    }

    await env.DB
      .prepare(`
        UPDATE payment_methods
        SET
          action_value = ?,
          updated_at =
            CURRENT_TIMESTAMP
        WHERE method_key = 'card'
      `)
      .bind(paymentUrl.toString())
      .run();

    await clearAdminState(
      env,
      chatId
    );

    await sendTelegramMessage(
      env,
      chatId,
      "تم حفظ رابط بوابة الدفع بنجاح ✅"
    );

    await showPaymentMethodsMenu(
      env,
      chatId
    );

    return true;
  }

  if (
    action ===
    "whatsapp_number_edit"
  ) {
    const whatsappNumber =
      text.replace(/\D/g, "");

    if (
      whatsappNumber.length < 8 ||
      whatsappNumber.length > 15
    ) {
      await sendTelegramMessage(
        env,
        chatId,
        "رقم واتساب غير صحيح.\n\nأرسله بصيغة دولية دون +، مثل:\n966501234567"
      );

      return true;
    }

    await env.DB
      .prepare(`
        INSERT INTO settings (
          setting_key,
          setting_value,
          updated_at
        )
        VALUES (
          'whatsapp_number',
          ?,
          CURRENT_TIMESTAMP
        )
        ON CONFLICT(setting_key)
        DO UPDATE SET
          setting_value =
            excluded.setting_value,
          updated_at =
            CURRENT_TIMESTAMP
      `)
      .bind(whatsappNumber)
      .run();

    await clearAdminState(
      env,
      chatId
    );

    await sendTelegramMessage(
      env,
      chatId,
      `تم حفظ رقم واتساب بنجاح ✅\n\n${whatsappNumber}`
    );

    await showPaymentMethodsMenu(
      env,
      chatId
    );

    return true;
  }

  return false;
}

async function sendInputRequest(
  env,
  chatId,
  text,
  cancelCallback
) {
  await sendTelegramMessage(
    env,
    chatId,
    text,
    {
      inline_keyboard: [
        [
          {
            text: "إلغاء",
            callback_data:
              cancelCallback
          }
        ]
      ]
    }
  );
}

async function showPeriodsMenu(
  env,
  chatId
) {
  const result = await env.DB
    .prepare(`
      SELECT
        id,
        period_type,
        title,
        start_date,
        end_date,
        price,
        is_enabled
      FROM special_periods
      ORDER BY priority DESC, id DESC
    `)
    .all();

  const periods =
    result.results || [];

  let text =
    "📅 المواسم والمناسبات\n\n";

  if (!periods.length) {
    text +=
      "لا توجد مواسم أو مناسبات مضافة.";
  } else {
    for (
      const period of periods
    ) {
      text +=
        `${period.is_enabled ? "✅" : "⏸"} ` +
        `${period.period_type === "season" ? "موسم" : "مناسبة"}: ` +
        `${period.title}\n` +
        `من ${period.start_date} إلى ${period.end_date}\n` +
        `${formatMoney(period.price)}\n\n`;
    }
  }

  await sendTelegramMessage(
    env,
    chatId,
    text,
    {
      inline_keyboard: [
        [
          {
            text: "➕ إضافة موسم",
            callback_data:
              "season_add"
          },
          {
            text: "➕ إضافة مناسبة",
            callback_data:
              "occasion_add"
          }
        ],
        backButton()
      ]
    }
  );
}

async function showInsuranceMenu(
  env,
  chatId
) {
  const settings =
    await getSettingsMap(
      env,
      [
        "insurance_enabled",
        "insurance_title",
        "insurance_amount",
        "insurance_description"
      ]
    );

  const enabled =
    settings.insurance_enabled ===
    "true";

  await sendTelegramMessage(
    env,
    chatId,
    "🛡 التأمين المسترد\n\n" +
      `الحالة: ${enabled ? "مفعّل ✅" : "متوقف 🚫"}\n` +
      `العنوان: ${settings.insurance_title || "—"}\n` +
      `المبلغ: ${formatMoney(settings.insurance_amount)}\n\n` +
      `${settings.insurance_description || ""}`,
    {
      inline_keyboard: [
        [
          {
            text:
              enabled
                ? "إيقاف التأمين"
                : "تشغيل التأمين",
            callback_data:
              "insurance_toggle"
          }
        ],
        backButton()
      ]
    }
  );
}

async function showPaymentMethodsMenu(
  env,
  chatId
) {
  const result = await env.DB
    .prepare(`
      SELECT
        id,
        method_key,
        title,
        description,
        action_value,
        is_enabled
      FROM payment_methods
      ORDER BY sort_order ASC
    `)
    .all();

  const settings = await getSettingsMap(
    env,
    [
      "whatsapp_number"
    ]
  );

  const methods =
    result.results || [];

  const cardMethod =
    methods.find(
      method =>
        method.method_key === "card"
    );

  const bankMethod =
    methods.find(
      method =>
        method.method_key === "bank"
    );

  let text =
    "💳 طرق الدفع\n\n";

  if (cardMethod) {
    text +=
      `${cardMethod.is_enabled ? "✅" : "🚫"} ` +
      `${cardMethod.title}\n` +
      `${cardMethod.description}\n` +
      `رابط الدفع: ${
        cardMethod.action_value ||
        "غير مضاف"
      }\n\n`;
  }

  if (bankMethod) {
    text +=
      `${bankMethod.is_enabled ? "✅" : "🚫"} ` +
      `${bankMethod.title}\n` +
      `${bankMethod.description}\n` +
      `رقم واتساب: ${
        settings.whatsapp_number ||
        "غير مضاف"
      }\n`;
  }

  const keyboard = [];

  for (const method of methods) {
    keyboard.push([
      {
        text:
          method.is_enabled
            ? `⏸ إيقاف ${method.title}`
            : `▶️ تشغيل ${method.title}`,

        callback_data:
          `payment_toggle:${method.id}`
      }
    ]);
  }

  keyboard.push([
    {
      text: "🔗 تعديل رابط بوابة الدفع",
      callback_data:
        "card_payment_url_edit"
    }
  ]);

  keyboard.push([
    {
      text: "📱 تعديل رقم واتساب",
      callback_data:
        "bank_whatsapp_edit"
    }
  ]);

  keyboard.push(
    backButton()
  );

  await sendTelegramMessage(
    env,
    chatId,
    text,
    {
      inline_keyboard: keyboard
    }
  );
}

async function togglePaymentMethod(
  env,
  id
) {
  await env.DB
    .prepare(`
      UPDATE payment_methods
      SET
        is_enabled = CASE
          WHEN is_enabled = 1 THEN 0
          ELSE 1
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    .bind(id)
    .run();
}

async function showPaymentBotMenu(
  env,
  chatId
) {
  const settings = await env.DB
    .prepare(`
      SELECT
        bot_username,
        bot_chat_id,
        forward_enabled,
        amount_prefix,
        test_amount
      FROM payment_bot_settings
      WHERE id = 1
    `)
    .first();

  const enabled =
    Number(
      settings?.forward_enabled || 0
    ) === 1;

  const linked =
    Boolean(
      String(
        settings?.bot_chat_id || ""
      ).trim()
    );

  const text =
    "🤖 إعدادات إرسال المبلغ\n\n" +
    `المجموعة: ${
      settings?.bot_username ||
      "غير مرتبطة"
    }\n` +
    `معرف المجموعة: ${
      settings?.bot_chat_id ||
      "غير موجود"
    }\n` +
    `الإرسال: ${
      enabled
        ? "مفعّل ✅"
        : "متوقف 🚫"
    }\n\n` +
    "لربط مجموعة جديدة:\n" +
    "أرسل داخل المجموعة الأمر:\n" +
    "/setpaymentgroup\n\n" +
    "صيغة الإرسال:\n" +
    `${settings?.amount_prefix || "SAR"} 2.900`;

  await sendTelegramMessage(
    env,
    chatId,
    text,
    {
      inline_keyboard: [
        [
          {
            text: enabled
              ? "⏸ إيقاف الإرسال"
              : "▶️ تشغيل الإرسال",
            callback_data:
              "payment_bot_toggle"
          }
        ],
        [
          {
            text: "🧪 اختبار SAR 10",
            callback_data:
              "payment_bot_test"
          }
        ],
        linked
          ? [
              {
                text: "🗑 حذف ربط المجموعة",
                callback_data:
                  "payment_bot_delete"
              }
            ]
          : [],
        backButton()
      ].filter(
        row => row.length > 0
      )
    }
  );
}

async function togglePaymentBotForwarding(
  env
) {
  await env.DB
    .prepare(`
      UPDATE payment_bot_settings
      SET
        forward_enabled = CASE
          WHEN forward_enabled = 1 THEN 0
          ELSE 1
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `)
    .run();
}

async function showBookingsMenu(
  env,
  chatId
) {
  const result = await env.DB
    .prepare(`
      SELECT
        booking_number,
        full_name,
        phone,
        check_in_date,
        check_out_date,
        grand_total,
        booking_status
      FROM bookings
      ORDER BY id DESC
      LIMIT 10
    `)
    .all();

  const bookings =
    result.results || [];

  let text =
    "📋 آخر طلبات الحجز\n\n";

  if (!bookings.length) {
    text +=
      "لا توجد طلبات حجز حتى الآن.";
  } else {
    for (
      const booking of bookings
    ) {
      text +=
        `رقم: ${booking.booking_number}\n` +
        `العميل: ${booking.full_name}\n` +
        `الجوال: ${booking.phone}\n` +
        `الدخول: ${booking.check_in_date}\n` +
        `الخروج: ${booking.check_out_date}\n` +
        `المبلغ: ${formatMoney(booking.grand_total)}\n` +
        `الحالة: ${booking.booking_status}\n\n`;
    }
  }

  await sendTelegramMessage(
    env,
    chatId,
    text,
    {
      inline_keyboard: [
        [
          {
            text: "تحديث",
            callback_data:
              "menu_bookings"
          }
        ],
        backButton()
      ]
    }
  );
}

async function showSiteSettingsMenu(
  env,
  chatId
) {
  const settings =
    await getSettingsMap(
      env,
      [
        "booking_enabled",
        "prices_section_title",
        "whatsapp_number"
      ]
    );

  const enabled =
    settings.booking_enabled ===
    "true";

  await sendTelegramMessage(
    env,
    chatId,
    "⚙️ إعدادات الموقع\n\n" +
      `الحجز: ${enabled ? "مفتوح ✅" : "متوقف 🚫"}\n` +
      `عنوان الأسعار: ${settings.prices_section_title || "أسعار الحجز"}\n` +
      `واتساب: ${settings.whatsapp_number || "غير مضاف"}`,
    {
      inline_keyboard: [
        [
          {
            text:
              enabled
                ? "إيقاف الحجوزات"
                : "تشغيل الحجوزات",
            callback_data:
              "booking_toggle"
          }
        ],
        backButton()
      ]
    }
  );
}

async function getAdminState(
  env,
  chatId
) {
  return env.DB
    .prepare(`
      SELECT
        current_action,
        action_data
      FROM admin_states
      WHERE chat_id = ?
    `)
    .bind(String(chatId))
    .first();
}

async function setAdminState(
  env,
  chatId,
  action,
  data = {}
) {
  await env.DB
    .prepare(`
      INSERT INTO admin_states (
        chat_id,
        current_action,
        action_data,
        updated_at
      )
      VALUES (
        ?,
        ?,
        ?,
        CURRENT_TIMESTAMP
      )
      ON CONFLICT(chat_id)
      DO UPDATE SET
        current_action =
          excluded.current_action,
        action_data =
          excluded.action_data,
        updated_at =
          CURRENT_TIMESTAMP
    `)
    .bind(
      String(chatId),
      action,
      JSON.stringify(data)
    )
    .run();
}

async function clearAdminState(
  env,
  chatId
) {
  await env.DB
    .prepare(`
      DELETE FROM admin_states
      WHERE chat_id = ?
    `)
    .bind(String(chatId))
    .run();
}

async function getSettingsMap(
  env,
  keys
) {
  const placeholders =
    keys.map(() => "?").join(",");

  const result = await env.DB
    .prepare(`
      SELECT
        setting_key,
        setting_value
      FROM settings
      WHERE setting_key IN (
        ${placeholders}
      )
    `)
    .bind(...keys)
    .all();

  const settings = {};

  for (
    const row of result.results || []
  ) {
    settings[row.setting_key] =
      row.setting_value;
  }

  return settings;
}

async function toggleSettingBoolean(
  env,
  key
) {
  const current = await env.DB
    .prepare(`
      SELECT setting_value
      FROM settings
      WHERE setting_key = ?
    `)
    .bind(key)
    .first();

  const value =
    current?.setting_value === "true"
      ? "false"
      : "true";

  await env.DB
    .prepare(`
      INSERT INTO settings (
        setting_key,
        setting_value,
        updated_at
      )
      VALUES (
        ?,
        ?,
        CURRENT_TIMESTAMP
      )
      ON CONFLICT(setting_key)
      DO UPDATE SET
        setting_value =
          excluded.setting_value,
        updated_at =
          CURRENT_TIMESTAMP
    `)
    .bind(key, value)
    .run();
}

/* =========================
   ربط مجموعة الدفع
========================= */

async function savePaymentGroup(
  env,
  chatId,
  groupTitle
) {
  await env.DB
    .prepare(`
      UPDATE payment_bot_settings
      SET
        bot_chat_id = ?,
        bot_username = ?,
        forward_enabled = 1,
        updated_at =
          CURRENT_TIMESTAMP
      WHERE id = 1
    `)
    .bind(
      String(chatId),
      groupTitle
    )
    .run();
}

function formatPaymentAmount(
  value
) {
  return Number(value || 0)
    .toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
        useGrouping: false
      }
    );
}

async function sendAmountToPaymentGroup(
  env,
  amount
) {
  try {
    const settings = await env.DB
      .prepare(`
        SELECT
          bot_chat_id,
          forward_enabled,
          amount_prefix
        FROM payment_bot_settings
        WHERE id = 1
      `)
      .first();

    if (
      Number(
        settings?.forward_enabled || 0
      ) !== 1
    ) {
      return {
        ok: false,
        skipped: true,
        error:
          "إرسال المبلغ متوقف"
      };
    }

    const destination =
      String(
        settings?.bot_chat_id || ""
      ).trim();

    if (!destination) {
      return {
        ok: false,
        error:
          "مجموعة الدفع غير مرتبطة"
      };
    }

    const message =
      `${settings?.amount_prefix || "SAR"} ` +
      formatPaymentAmount(amount);

    await sendTelegramMessage(
      env,
      destination,
      message
    );

    return {
      ok: true,
      message
    };
  } catch (error) {
    return {
      ok: false,
      error:
        getErrorMessage(error)
    };
  }
}

/* =========================
   حفظ الحجز وإرسال الفاتورة
========================= */

async function handleBookingEvent(
  request,
  env
) {
  try {
    const body =
      await request.json();

    const eventType =
      String(
        body.event_type || ""
      );

    if (
      ![
        "payment_page",
        "payment_click"
      ].includes(eventType)
    ) {
      return jsonResponse(
        {
          ok: false,
          error:
            "نوع العملية غير صحيح"
        },
        400
      );
    }

    const booking =
      body.booking || {};

    validateBookingPayload(
      booking
    );

    const saved =
      await saveOrUpdateBooking(
        env,
        booking,
        eventType
      );

    let invoiceResult = {
      ok: false,
      skipped: true
    };

    if (body.invoice_image) {
      invoiceResult =
        await sendInvoiceImageToAdmin(
          env,
          body.invoice_image,
          booking,
          eventType
        );
    }

    const amountResult =
      await sendAmountToPaymentGroup(
        env,
        booking.amounts.total
      );

    await env.DB
      .prepare(`
        UPDATE bookings
        SET
          invoice_sent_count =
            invoice_sent_count + ?,
          payment_amount_forwarded = ?,
          updated_at =
            CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(
        invoiceResult.ok ? 1 : 0,
        amountResult.ok ? 1 : 0,
        saved.bookingId
      )
      .run();

    return jsonResponse({
      ok: true,
      booking_id:
        saved.bookingId,
      booking_number:
        booking.booking_number,
      event_type:
        eventType,
      invoice:
        invoiceResult,
      payment_amount:
        amountResult
    });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error:
          getErrorMessage(error)
      },
      400
    );
  }
}

function validateBookingPayload(
  booking
) {
  const required = [
    booking.booking_number,
    booking.customer?.full_name,
    booking.customer?.phone,
    booking.customer?.city,
    booking.booking
      ?.check_in_date,
    booking.booking
      ?.check_out_date
  ];

  if (
    required.some(
      value =>
        !String(value || "").trim()
    )
  ) {
    throw new Error(
      "بيانات الحجز غير مكتملة"
    );
  }

  const total =
    Number(
      booking.amounts?.total
    );

  if (
    !Number.isFinite(total) ||
    total < 0
  ) {
    throw new Error(
      "مبلغ الحجز غير صحيح"
    );
  }
}

async function saveOrUpdateBooking(
  env,
  data,
  eventType
) {
  const customer =
    data.customer;

  const booking =
    data.booking;

  const amounts =
    data.amounts;

  const paymentMethod =
    String(
      data.payment_method || ""
    );

  await env.DB
    .prepare(`
      INSERT INTO bookings (
        booking_number,
        full_name,
        phone,
        city,
        district,
        booking_type,
        adults,
        children,
        people_total,
        check_in_date,
        check_in_time,
        check_out_date,
        check_out_time,
        nights_count,
        notes,
        stay_total,
        services_total,
        insurance_total,
        grand_total,
        selected_payment_method,
        payment_status,
        booking_status
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, 'pending', ?
      )
      ON CONFLICT(booking_number)
      DO UPDATE SET
        full_name = excluded.full_name,
        phone = excluded.phone,
        city = excluded.city,
        district = excluded.district,
        booking_type = excluded.booking_type,
        adults = excluded.adults,
        children = excluded.children,
        people_total = excluded.people_total,
        check_in_date = excluded.check_in_date,
        check_in_time = excluded.check_in_time,
        check_out_date = excluded.check_out_date,
        check_out_time = excluded.check_out_time,
        nights_count = excluded.nights_count,
        notes = excluded.notes,
        stay_total = excluded.stay_total,
        services_total = excluded.services_total,
        insurance_total = excluded.insurance_total,
        grand_total = excluded.grand_total,
        selected_payment_method =
          excluded.selected_payment_method,
        booking_status =
          excluded.booking_status,
        updated_at = CURRENT_TIMESTAMP
    `)
    .bind(
      data.booking_number,
      customer.full_name,
      customer.phone,
      customer.city,
      customer.district || "",
      customer.booking_type,
      Number(customer.adults || 0),
      Number(customer.children || 0),
      Number(customer.people_total || 0),
      booking.check_in_date,
      booking.check_in_time,
      booking.check_out_date,
      booking.check_out_time,
      Number(booking.nights_count || 0),
      customer.notes || "",
      Number(amounts.stay || 0),
      Number(amounts.services || 0),
      Number(amounts.insurance || 0),
      Number(amounts.total || 0),
      paymentMethod,
      eventType === "payment_click"
        ? "payment_selected"
        : "payment_page"
    )
    .run();

  const row = await env.DB
    .prepare(`
      SELECT id
      FROM bookings
      WHERE booking_number = ?
    `)
    .bind(data.booking_number)
    .first();

  const bookingId =
    Number(row.id);

  /*
    نستبدل الخدمات والليالي
    بأحدث نسخة من الطلب.
  */
  await env.DB.batch([
    env.DB
      .prepare(`
        DELETE FROM booking_services
        WHERE booking_id = ?
      `)
      .bind(bookingId),

    env.DB
      .prepare(`
        DELETE FROM booking_nights
        WHERE booking_id = ?
      `)
      .bind(bookingId)
  ]);

  const serviceStatements =
    (booking.services || [])
      .map(service =>
        env.DB
          .prepare(`
            INSERT INTO booking_services (
              booking_id,
              service_id,
              service_name,
              service_price
            )
            VALUES (?, ?, ?, ?)
          `)
          .bind(
            bookingId,
            Number(service.id || 0) ||
              null,
            service.name,
            Number(
              service.price || 0
            )
          )
      );

  const nightStatements =
    (booking.nights || [])
      .map(night =>
        env.DB
          .prepare(`
            INSERT INTO booking_nights (
              booking_id,
              night_date,
              price_type,
              price_title,
              night_price
            )
            VALUES (?, ?, ?, ?, ?)
          `)
          .bind(
            bookingId,
            night.date,
            night.type || "",
            night.title || "",
            Number(
              night.price || 0
            )
          )
      );

  const statements = [
    ...serviceStatements,
    ...nightStatements
  ];

  if (statements.length) {
    await env.DB.batch(
      statements
    );
  }

  return {
    bookingId
  };
}

async function sendInvoiceImageToAdmin(
  env,
  dataUrl,
  booking,
  eventType
) {
  try {
    const match =
      String(dataUrl).match(
        /^data:image\/png;base64,(.+)$/
      );

    if (!match) {
      throw new Error(
        "صيغة صورة الفاتورة غير صحيحة"
      );
    }

    const bytes =
      Uint8Array.from(
        atob(match[1]),
        character =>
          character.charCodeAt(0)
      );

    const caption =
      eventType ===
      "payment_click"
        ? "🔄 فاتورة محدثة عند الضغط على الانتقال للدفع"
        : "🧾 فاتورة جديدة عند دخول صفحة الدفع";

    const form =
      new FormData();

    form.append(
      "chat_id",
      String(
        env.ADMIN_CHAT_ID
      )
    );

    form.append(
      "caption",
      `${caption}\nرقم الحجز: ${booking.booking_number}\nالمبلغ: ${formatMoney(booking.amounts.total)}`
    );

    form.append(
      "photo",
      new Blob(
        [bytes],
        {
          type: "image/png"
        }
      ),
      `${booking.booking_number}.png`
    );

    const response =
      await fetch(
        `https://api.telegram.org/bot${env.ADMIN_BOT_TOKEN}/sendPhoto`,
        {
          method: "POST",
          body: form
        }
      );

    const result =
      await response.json();

    if (!result.ok) {
      throw new Error(
        result.description ||
        "تعذر إرسال الفاتورة"
      );
    }

    return {
      ok: true
    };
  } catch (error) {
    return {
      ok: false,
      error:
        getErrorMessage(error)
    };
  }
}

async function telegramApi(
  env,
  method,
  payload
) {
  const response = await fetch(
    `https://api.telegram.org/bot${env.ADMIN_BOT_TOKEN}/${method}`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json"
      },
      body: JSON.stringify(payload)
    }
  );

  const result =
    await response.json();

  if (!result.ok) {
    throw new Error(
      result.description ||
      "Telegram API error"
    );
  }

  return result;
}

async function sendTelegramMessage(
  env,
  chatId,
  text,
  replyMarkup = null
) {
  const payload = {
    chat_id: chatId,
    text
  };

  if (replyMarkup) {
    payload.reply_markup =
      replyMarkup;
  }

  return telegramApi(
    env,
    "sendMessage",
    payload
  );
}

async function answerCallback(
  env,
  callbackId
) {
  try {
    await telegramApi(
      env,
      "answerCallbackQuery",
      {
        callback_query_id:
          callbackId
      }
    );
  } catch (error) {
    console.error(error);
  }
}

function backButton() {
  return [
    {
      text: "⬅️ رجوع للقائمة",
      callback_data:
        "main_menu"
    }
  ];
}

function parsePrice(text) {
  const normalized = String(text)
    .replace(/,/g, "")
    .replace(/[^\d.]/g, "");

  if (!normalized) {
    return null;
  }

  const value =
    Number(normalized);

  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1000000
  ) {
    return null;
  }

  return value;
}

function validText(
  text,
  min,
  max
) {
  return (
    typeof text === "string" &&
    text.trim().length >= min &&
    text.trim().length <= max
  );
}

function formatMoney(value) {
  return (
    Number(value || 0)
      .toLocaleString("en-US") +
    " ريال"
  );
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods":
      "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type"
  };
}

function jsonResponse(
  data,
  status = 200
) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        "Content-Type":
          "application/json; charset=utf-8",
        ...corsHeaders()
      }
    }
  );
}

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : String(error);
                  }
