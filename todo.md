# Tee‑Time CSV‑Upload MVP — Master TODO Checklist

> Mark each task `[ ]` → `[x]` when complete.  
> Sub‑tasks are indented. ⚑ = may run in parallel.

---

## 0 · Project Kick‑off
- [ ] Select repo host & create **tee‑time** private mono‑repo
- [ ] Add MIT license & initial `README.md`

---

## 1 · Dev‑Ops Bootstrap
- [ ] `.gitignore`, `.nvmrc` (LTS)
- [ ] Root `package.json`   
  - [ ] Workspaces: `apps/*`, `packages/*`
  - [ ] Scripts: `lint`, `format`, `test`
- [ ] ESLint + Prettier (Airbnb TS) config
- [ ] Husky pre‑commit → `lint --fix && test`
- [ ] Jest + ts‑jest setup
- [ ] Placeholder passing test
- [ ] GitHub Actions CI  
  - [ ] Install → lint → test → coverage artifact  
  - [ ] Badge in README

---

## 2 · Backend Skeleton ⚑
- [ ] Workspace `apps/api` (TypeScript)
- [ ] Express server (`src/server.ts`)
- [ ] Env loader + `PORT` default 3000
- [ ] `/health` route
- [ ] Error‑handling middleware
- [ ] Supertest integration test
- [ ] Dockerfile (api)
- [ ] docker‑compose (api + mongo stub)
- [ ] CI updated to spin compose

---

## 3 · Database & Models ⚑
- [ ] `packages/common` Mongoose connection
- [ ] Schemas  
  - [ ] User  
  - [ ] Course  
  - [ ] TeeTime  
  - [ ] UploadBatch
- [ ] Test DB via `mongodb-memory-server`
- [ ] Unit tests save/retrieve Course & TeeTime

---

## 4 · Auth & Sessions
- [ ] Google OAuth (passport)  
  - [ ] `/auth/google` & callback
- [ ] Apple OAuth
- [ ] JWT issue (1 yr) + refresh token store
- [ ] `requireAuth` middleware
- [ ] `/me` protected route
- [ ] Auth integration tests

---

## 5 · CSV Upload & Import
- [ ] Admin‑only POST `/admin/upload`
- [ ] Multer/multipart handling
- [ ] Validate header: `courseId,courseName,teeTime,holes,pricePerPlayer,availableSlots`
- [ ] Stream parse with `fast-csv`
- [ ] Row‑level validation
- [ ] Replace logic (delete & insert matching `courseId+teeTime`)
- [ ] Deduplicate identical rows silently
- [ ] Skip malformed rows; accumulate errors
- [ ] Save `UploadBatch` summary
- [ ] Response JSON stats
- [ ] Alert job: missing upload by 12 PM MT
- [ ] Tests: happy‑path, bad row skipped, duplicate row

---

## 6 · /​search API
- [ ] GET `/search` params: `date`, `courseId?`, `maxPrice?`, `slots?`, `startTime?`, `endTime?`, `cursor?`
- [ ] Zod validation
- [ ] Query TeeTime collection; filters
- [ ] Sort ascending, limit 20, `nextCursor`
- [ ] Integration tests with seeded data
- [ ] Swagger docs updated

---

## 7 · Push Notifications
- [ ] Firebase Cloud Messaging setup
- [ ] Device token model + registration route
- [ ] `NotificationPref` schema
- [ ] `/notifications/prefs` CRUD
- [ ] Worker (5 min) → query new tee‑times → send FCM
- [ ] Frequency throttle (immediate/daily/weekly)
- [ ] Unit tests on worker logic

---

## 8 · React Native Mobile App ⚑
- [ ] Workspace `apps/mobile` (Expo TypeScript)
- [ ] Shared ESLint/Prettier
- [ ] Google sign‑in flow
- [ ] AuthLoading screen (JWT check)
- [ ] TeeTimeList screen  
  - [ ] Axios fetch `/search?date=today`  
  - [ ] FlatList with infinite scroll  
  - [ ] Pull‑to‑refresh
- [ ] FiltersModal (price, slots, time‑range)
- [ ] Filter button + badge
- [ ] Push permissions + token POST
- [ ] Notification handler → deep‑link
- [ ] Jest snapshot tests

---

## 9 · Admin Dashboard
- [ ] Workspace `apps/admin` (Next.js)
- [ ] Login page (username/password env)
- [ ] Upload page  
  - [ ] Drag‑drop CSV  
  - [ ] Progress + summary
- [ ] History page  
  - [ ] Table of UploadBatch docs
- [ ] Alert banner if daily upload missing
- [ ] Course CRUD table
- [ ] Cypress e2e: login → upload fixture → verify summary

---

## 10 · Hardening & House‑Keeping
- [ ] Winston JSON logger
- [ ] Nightly purge job  
  - [ ] Delete TeeTimes < today  
  - [ ] Delete UploadBatch > 30 d
- [ ] Global RN error boundary → toast
- [ ] Detox smoke: login stub → list → WebView
- [ ] CI step to run Android emulator e2e
- [ ] Coverage ≥ 80 %

---

## 11 · Beta & Release
- [ ] Staging infra (Docker/Fly.io/k8s)
- [ ] CI → CD to staging
- [ ] TestFlight & Google Play Internal builds
- [ ] Collect beta feedback
- [ ] Production store metadata & launch
- [ ] Post‑launch monitoring (uptime, error logs)

---

## 12 · Maintenance
- [ ] Weekly dep audit (Dependabot)
- [ ] Monthly security review
- [ ] Update docs (`CONTRIBUTING.md`, API ref)

---
