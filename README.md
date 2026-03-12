# 🎬 افلامك — منصة الأفلام والمسلسلات | Aflaamak Movie Streaming Platform

<div dir="rtl">

## 📋 المتطلبات الأساسية

قبل تشغيل المشروع تأكد من تثبيت:

- **Node.js** (الإصدار 18 أو أحدث) — [تحميل من هنا](https://nodejs.org/)
- **MongoDB** — إما محلياً أو عبر [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (مجاني)

---

## 🚀 خطوات التشغيل المحلي (على جهازك)

### الخطوة 1 — استنساخ المشروع

```bash
git clone https://github.com/Ammar88908/movie-streaming-app.git
cd movie-streaming-app
```

### الخطوة 2 — تثبيت الحزم

```bash
npm install
```

### الخطوة 3 — إعداد ملف البيئة

انسخ الملف النموذجي وعدّله:

```bash
cp .env.example .env
```

افتح ملف `.env` وعدّل القيم:

```env
MONGODB_URI=mongodb://localhost:27017/aflaamak
ADMIN_PASSWORD=كلمة_مرور_قوية
PORT=3000
```

> **تلميح:** استبدل `كلمة_مرور_قوية` بكلمة مرور من اختيارك — ستستخدمها للدخول إلى لوحة الإدارة.

### الخطوة 4 — تشغيل الخادم

```bash
npm start
```

### الخطوة 5 — فتح الموقع

افتح المتصفح وانتقل إلى:

```
http://localhost:3000
```

---

## 🌐 إعداد MongoDB Atlas (للنشر السحابي)

إذا كنت تريد النشر على الإنترنت أو لا تريد تثبيت MongoDB محلياً:

1. اذهب إلى [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) وأنشئ حساباً مجانياً.
2. أنشئ **Cluster** جديد (اختر الخطة المجانية M0).
3. من **Database Access** أضف مستخدماً جديداً بكلمة مرور.
4. من **Network Access** أضف `0.0.0.0/0` للسماح بالاتصال من أي مكان.
5. اضغط **Connect** ثم **Connect your application** وانسخ رابط الاتصال.
6. ضع الرابط في `.env`:

```env
MONGODB_URI=mongodb+srv://المستخدم:كلمة_المرور@cluster0.xxxxx.mongodb.net/aflaamak?retryWrites=true&w=majority
```

---

## 🔐 لوحة الإدارة

بعد تشغيل الموقع، يمكنك الدخول إلى لوحة الإدارة لإضافة الأفلام والمسلسلات:

1. اضغط على **"لوحة الإدارة"** في أعلى الموقع، أو انتقل مباشرةً إلى:
   ```
   http://localhost:3000/admin.html
   ```
2. أدخل كلمة المرور التي حددتها في `ADMIN_PASSWORD` داخل ملف `.env`.
3. بعد الدخول يمكنك:
   - **إضافة** فيلم أو مسلسل مع رابط الصورة ورابط الفيديو
   - **تعديل** أي محتوى موجود
   - **حذف** المحتوى

### أنواع روابط الفيديو المدعومة

| النوع | مثال |
|-------|-------|
| يوتيوب | `https://www.youtube.com/watch?v=xxxxx` |
| فيميو | `https://vimeo.com/xxxxx` |
| رابط مباشر | `https://example.com/video.mp4` |
| أي رابط iframe | أي رابط `https://` مدعوم |

---

## ☁️ النشر على الإنترنت

### Render (مجاني — موصى به)

1. اذهب إلى [Render.com](https://render.com/) وسجّل دخولاً بحساب GitHub.
2. اضغط **New → Web Service**.
3. اختر مستودع `movie-streaming-app`.
4. اضبط الإعدادات:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. من **Environment** أضف المتغيرات:
   - `MONGODB_URI` ← رابط MongoDB Atlas
   - `ADMIN_PASSWORD` ← كلمة المرور
   - `PORT` ← `3000`
6. اضغط **Create Web Service** وانتظر النشر.
7. سيكون موقعك متاحاً على: `https://اسم-مشروعك.onrender.com`

### Railway (مجاني)

1. اذهب إلى [Railway.app](https://railway.app/) وسجّل دخولاً.
2. اضغط **New Project → Deploy from GitHub repo**.
3. اختر المستودع.
4. من **Variables** أضف `MONGODB_URI` و`ADMIN_PASSWORD`.
5. Railway سيكتشف `npm start` تلقائياً ويبدأ النشر.

### Glitch

1. اذهب إلى [Glitch.com](https://glitch.com/).
2. اضغط **New Project → Import from GitHub**.
3. الصق رابط المستودع.
4. افتح ملف `.env` على Glitch وأضف المتغيرات.
5. سيكون موقعك على: `https://اسم-مشروعك.glitch.me`

---

## 🗂️ هيكل المشروع

```
movie-streaming-app/
├── server.js          ← الخادم الرئيسي (Express + MongoDB)
├── package.json       ← تبعيات المشروع
├── .env               ← متغيرات البيئة (لا ترفعه على GitHub!)
├── .env.example       ← نموذج لملف البيئة
└── public/
    ├── index.html     ← الصفحة الرئيسية
    ├── admin.html     ← لوحة الإدارة
    ├── script.js      ← كود الواجهة الأمامية
    └── styles.css     ← التصميم
```

---

## ❓ مشاكل شائعة وحلولها

| المشكلة | الحل |
|---------|------|
| `Cannot connect to MongoDB` | تأكد أن MongoDB يعمل محلياً أو تحقق من رابط Atlas |
| `EADDRINUSE: port 3000` | غيّر `PORT` في `.env` إلى `3001` أو أي رقم آخر |
| صفحة بيضاء في المتصفح | تأكد أن الخادم يعمل وافتح `http://localhost:3000` |
| لا يمكن الدخول للوحة الإدارة | تأكد من `ADMIN_PASSWORD` في `.env` وأعد تشغيل الخادم |

</div>

---

## 📋 Prerequisites

- **Node.js** v18+ — [Download](https://nodejs.org/)
- **MongoDB** — local install or free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/Ammar88908/movie-streaming-app.git
cd movie-streaming-app

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env and set MONGODB_URI and ADMIN_PASSWORD

# 4. Run
npm start

# 5. Open browser at http://localhost:3000
```

## 🔐 Admin Panel

Navigate to `http://localhost:3000/admin.html` and enter the password set in `ADMIN_PASSWORD` to add, edit, or delete movies/series.

## ⚙️ Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/aflaamak` |
| `ADMIN_PASSWORD` | Password for the admin panel | `MySecretPass123` |
| `PORT` | Server port (default: 3000) | `3000` |