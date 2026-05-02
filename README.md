# Drift Happens 🌊

> მინდა ავღნიშნო რომ ეს პროექტი არის ძალიან საინტერესო ჩემთვის, რადგან ლაივ ინფორმაციას ეხება რაც ჩემი ინტერესია.
>
> ასევე მინდა ავღნიშნო რომ ჯერ არ არის მთლიანად დასრულებული პროექტი. საშუალოდ დავახარჯე დაახლოებით **25-30 საათი** და იდეალურობამდე არ არის მიყვანილი, რათქმაუნდა, და ჩემი აზრით კიდევ დასჭირდება დიდი მუშაობა. ამ პროექტით მინდა გაჩვენოთ ჩემი პოტენციალი.

---

## 🚀 გაშვების ინსტრუქცია

### Prerequisites
- Node.js 18+
- Docker Desktop

### პროექტის გაშვება

**1. რეპოზიტორის კლონირება:**
```bash
git clone <repository-url>
```

**2. Dependencies-ების ინსტალაცია:**
```bash
cd be && npm install
cd ../fe && npm install
cd ..
```

**3. Docker-ით გაშვება:**
```bash
docker compose up --build
```

**4. მონაცემთა ბაზის seed:**

Docker Desktop-ით: გახსენით API კონტეინერი → Exec ჩანართი → გაუშვით:
```bash
npx prisma db seed
```

ან command line-იდან:
```bash
docker exec -it <api_container_name> npx prisma db seed
```

**5. გახსენით ბრაუზერში:**
- Frontend: http://localhost:4200
- Backend: http://localhost:3000

---

## 🛠️ ტექნოლოგიური სტეკი

| შრე | ტექნოლოგია | მიზეზი |
| --- | --- | --- |
| Frontend | Angular | დიდი გამოცდილება, ჩემი ფავორიტი framework |
| Backend | NestJS | Angular-ის მსგავსი სტრუქტურა, ჩემი საყვარელი backend stack |
| ORM | Prisma | მონაცემთა ბაზასთან მუშაობის გამარტივება |
| Database | PostgreSQL | საიმედო, production-ready relational DB |
| WebSocket | Socket.io | რეალურ დროში განახლებები frontend-ზე |

---

## 📋 პროექტის აღწერა

*(დეტალური აღწერა მალე დაემატება)*

---

## 🏗️ არქიტექტურა

*(დიაგრამები და არქიტექტურული გადაწყვეტილებები მალე დაემატება)*

---

## ✅ Acceptance Criteria სტატუსი

*(მალე დაემატება)*
