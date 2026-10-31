export const STR = {
  appName: 'کد ای فارم',
  tagline: 'برنامه ای برای راحتی در سفارش دارو',

  // Nav
  nav: {
    home: 'صفحه اصلی',
    create: 'ایجاد کد جدید',
    all: 'همه مشترکان',
    about: 'درباره ما',
    settings: 'تنظیمات',
    logout: 'خروج',
    collapse: 'باز/بسته کردن منو',
  },

  // Auth
  auth: {
    loginTitle: 'برای استفاده از اپلیکیشن وارد حساب کاربری خود شوید',
    username: 'نام کاربری',
    password: 'رمز عبور',
    usernamePlaceholder: 'نام کاربری',
    passwordPlaceholder: 'رمز عبور',
    login: 'ورود',
    createAdminTitle: 'خوش آمدید! حساب کاربری مدیر را بسازید',
    createAdminSubtitle: 'این حساب تنها یک بار ساخته می‌شود و برای ورود به برنامه استفاده می‌شود.',
    confirmPassword: 'تکرار رمز عبور',
    createAdmin: 'ساخت حساب',
    usernameRequired: 'نام کاربری الزامی است.',
    passwordMin: 'رمز عبور باید حداقل ۶ کاراکتر باشد.',
    passwordsNotMatch: 'تکرار رمز عبور با رمز عبور همخوانی ندارد.',
    invalidLogin: 'نام کاربری یا رمز عبور اشتباه است.',
    logoutConfirm: 'آیا از حساب خود خارج می‌شوید؟',
  },

  // Common
  common: {
    confirm: 'تایید',
    cancel: 'انصراف',
    close: 'بستن',
    save: 'ذخیره',
    edit: 'ویرایش',
    delete: 'حذف',
    print: 'پرینت',
    search: 'جستجو',
    next: 'بعدی',
    prev: 'قبلی',
    noResult: 'نتیجه‌ای یافت نشد.',
    loading: 'در حال بارگذاری...',
    required: 'الزامی',
    optional: 'اختیاری',
    back: 'بازگشت',
  },

  // Home
  home: {
    title: 'صفحه اصلی',
    subtitle: 'برای دریافت نسخه بیمار، لطفا کد اشتراک یا نام بیمار را وارد کنید.',
    searchPlaceholder: 'مثال: مهدی حنیفه یا 101',
    emptyState: 'هیچ بیماری با این کد یا نام پیدا نشد.',
    multipleMatches: 'چند نتیجه پیدا شد. لطفاً مورد مورد نظر را انتخاب کنید:',
  },

  // Create
  create: {
    title: 'ایجاد کد جدید',
    subtitle: 'برای ایجاد کد اشتراک جدید، لطفا اطلاعات بیمار را وارد کنید.',
    name: 'نام و نام‌خانوادگی بیمار',
    namePlaceholder: 'مثال: مهدی حنیفه',
    phone: 'شماره تلفن بیمار',
    phonePlaceholder: '09xxxxxxxxx',
    address: 'آدرس بیمار',
    addressPlaceholder: 'آدرس کامل را وارد کنید',
    success: 'کد اشتراک بیمار با موفقیت ایجاد شد.',
    duplicatePhone: 'این شماره تلفن قبلاً ثبت شده است.',
  },

  // All customers
  all: {
    title: 'همه مشترکان',
    subtitle: 'تمامی مشترکان دارای کد اشتراک را مشاهده کنید.',
    searchPlaceholder: 'جستجو بر اساس نام یا کد اشتراک...',
    cols: {
      row: 'ردیف',
      name: 'نام و نام‌خانوادگی بیمار',
      phone: 'شماره تلفن بیمار',
      code: 'کد اشتراک بیمار',
      actions: 'ویرایش اطلاعات',
    },
    perPage: 'ردیف در صفحه',
    page: 'صفحه',
    of: 'از',
  },

  // Dialogs
  patient: {
    infoTitle: 'اطلاعات بیمار',
    editTitle: 'ویرایش اطلاعات بیمار',
    saveEdit: 'ثبت ویرایش',
    code: 'کد اشتراک',
    name: 'نام و نام‌خانوادگی',
    phone: 'شماره تلفن',
    address: 'آدرس',
    createdAt: 'تاریخ ثبت',
    updatedAt: 'تاریخ آخرین ویرایش',
  },

  success: {
    title: 'عملیات موفق',
    subtitle: 'کد اشتراک بیمار با موفقیت ایجاد شد.',
    done: 'تایید',
    print: 'پرینت برگه',
    newOne: 'ثبت بیمار جدید',
  },

  // Validation
  validation: {
    nameRequired: 'لطفاً نام بیمار را وارد کنید.',
    nameMin: 'نام باید حداقل ۳ کاراکتر باشد.',
    phoneInvalid: 'شماره موبایل باید با 09 شروع و ۱۱ رقم باشد.',
    phoneWarn: 'هشدار: این شماره تلفن قبلاً برای بیماری دیگر ثبت شده است.',
  },

  // Settings / backup
  settings: {
    title: 'تنظیمات',
    pharmacyName: 'نام داروخانه',
    pharmacyNamePlaceholder: 'مثال: داروخانه دکتر حنیفه',
    paperSize: 'اندازه کاغذ پرینت',
    paperA5: 'A5',
    paperThermal: 'حرارتی ۸۰ میلی‌متر',
    backup: 'پشتیبان‌گیری',
    backupDesc: 'گرفتن نسخه پشتیبان از پایگاه داده در یک فایل.',
    restore: 'بازیابی',
    restoreDesc: 'بازیابی پایگاه داده از یک فایل پشتیبان (اطلاعات فعلی جایگزین می‌شود).',
    doBackup: 'تهیه پشتیبان',
    doRestore: 'انتخاب فایل و بازیابی',
    backupOk: 'پشتیبان‌گیری با موفقیت انجام شد.',
    restoreOk: 'بازیابی با موفقیت انجام شد. برنامه مجدداً راه‌اندازی می‌شود.',
    restoreWarn: 'بازیابی اطلاعات فعلی را جایگزین می‌کند. آیا مطمئن هستید؟',
  },

  // About
  about: {
    title: 'درباره ما',
    version: 'نسخه',
    text: 'کد ای فارم یک ابزار آفلاین برای مدیریت مشترکان داروخانه است. هدف ما ساده‌سازی فرآیند ثبت، جستجو و چاپ برگه اشتراک بیماران است.',
  },

  // Print
  print: {
    title: 'پیش‌نمایش چاپ',
    printNow: 'چاپ',
    paperSize: 'کاغذ',
    pharmacyName: 'نام داروخانه',
    code: 'کد اشتراک',
    name: 'نام و نام‌خانوادگی',
    phone: 'شماره تماس',
    address: 'آدرس',
    date: 'تاریخ',
  },
} as const;
