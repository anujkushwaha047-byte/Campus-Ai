import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { createHmac, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, rmdirSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import test from "node:test";
import { pathToFileURL } from "node:url";

const authSecret = "isolated-test-secret-with-at-least-32-bytes";
const sectorEmails = [
  "it.admin@college.edu",
  "electrical.admin@college.edu",
  "water.admin@college.edu",
  "mess.admin@college.edu",
  "housekeeping.admin@college.edu",
  "hostel.admin@college.edu",
  "fire.admin@college.edu",
  "security.admin@college.edu",
  "facilities.admin@college.edu",
  "transport.admin@college.edu",
  "sports.admin@college.edu",
  "academics.admin@college.edu",
  "exam.admin@college.edu",
  "library.admin@college.edu",
  "fees.admin@college.edu",
  "general.admin@college.edu",
];
const sectorCredentials = Object.fromEntries(sectorEmails.map((email, index) => [
  email,
  `test-sector-password-${String(index).padStart(2, "0")}`,
]));
const staffCredentials = {
  "warden@college.edu": "test-warden-password",
  "maintenance@college.edu": "test-maintenance-password",
  "it.staff@college.edu": "test-it-staff-password",
  "electrical@college.edu": "test-electrical-password",
};

async function freePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const { port } = server.address();
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return port;
}

function productionEnvironment(dataDir) {
  return {
    ...process.env,
    NODE_ENV: "production",
    DEMO_MODE: "false",
    PORT: "3000",
    DATA_DIR: dataDir,
    ALLOW_EPHEMERAL_DATA: "true",
    APP_URL: "https://campus.example.test",
    CORS_ALLOWED_ORIGINS: "",
    AUTH_SECRET: "isolated-test-secret-with-at-least-32-bytes",
    ADMIN_EMAIL: "admin@college.edu",
    ADMIN_PASSWORD: "test-legacy-admin-password",
    STAFF_CREDENTIALS: JSON.stringify(staffCredentials),
    SECTOR_ADMIN_CREDENTIALS: JSON.stringify(sectorCredentials),
    SUPER_ADMIN_NAME: "Test Super Admin",
    SUPER_ADMIN_EMAIL: "superadmin@test.example",
    SUPER_ADMIN_PASSWORD: "test-super-admin-password",
    ALLOWED_COLLEGE_EMAIL_DOMAIN: "@its.edu.in",
    EMAIL_PROVIDER: "resend",
    RESEND_API_KEY: "re_localstub_api_key_12345678",
    OTP_FROM_EMAIL: "noreply@campus.example.test",
  };
}

async function expectProductionStartupFailure(overrides) {
  const dataDir = mkdtempSync(path.join(tmpdir(), `campus-ai-config-${randomUUID()}-`));
  const env = productionEnvironment(dataDir);
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) delete env[key];
    else env[key] = value;
  }
  const child = spawn(process.execPath, ["--import", "tsx", "server.ts"], {
    cwd: process.cwd(),
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (chunk) => { output += chunk; });
  child.stderr.on("data", (chunk) => { output += chunk; });
  try {
    const exitCode = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        child.kill();
        reject(new Error("Invalid production configuration did not stop startup."));
      }, 10_000);
      child.once("exit", (code) => {
        clearTimeout(timer);
        resolve(code);
      });
    });
    assert.notEqual(exitCode, 0);
    for (const secret of [
      env.AUTH_SECRET,
      env.ADMIN_PASSWORD,
      env.RESEND_API_KEY,
      env.SUPER_ADMIN_PASSWORD,
    ]) {
      if (secret) assert.equal(output.includes(secret), false);
    }
    return output;
  } finally {
    if (child.exitCode === null) child.kill();
    rmSync(dataDir, { recursive: true, force: true });
  }
}

async function startApp(dataDir, production = false, overrides = {}) {
  const port = await freePort();
  const origin = "https://campus.example.test";
  const providerStubPath = path.join(dataDir, `resend-stub-${randomUUID()}.mjs`);
  const otpCapturePath = path.join(dataDir, "test-only-otp-capture.txt");
  const otpClockPath = path.join(dataDir, "test-only-clock-offset.txt");
  const providerStatusPath = path.join(dataDir, "test-only-provider-status.txt");
  writeFileSync(providerStubPath, `
    import { existsSync, readFileSync, writeFileSync } from "node:fs";
    const realFetch = globalThis.fetch.bind(globalThis);
    globalThis.fetch = async (input, init) => {
      if (String(input) !== "https://api.resend.com/emails") return realFetch(input, init);
      const payload = JSON.parse(init.body);
      const code = payload.text.match(/code is ([0-9]{6})/)?.[1];
      if (code) writeFileSync(process.env.OTP_TEST_CAPTURE_PATH, code, { mode: 0o600 });
      const status = existsSync(process.env.OTP_TEST_PROVIDER_STATUS_PATH)
        ? Number(readFileSync(process.env.OTP_TEST_PROVIDER_STATUS_PATH, "utf8"))
        : 200;
      if (status === -1) throw new TypeError("simulated provider network failure");
      return new Response(status >= 200 && status < 300 ? '{"id":"test-message"}' : '{"message":"simulated failure"}', {
        status,
        headers: { "Content-Type": "application/json" }
      });
    };
    const realNow = Date.now.bind(Date);
    Date.now = () => realNow() + (existsSync(process.env.OTP_TEST_CLOCK_PATH)
      ? Number(readFileSync(process.env.OTP_TEST_CLOCK_PATH, "utf8"))
      : 0);
  `);
  const env = {
    ...process.env,
    PORT: String(port),
    DATA_DIR: dataDir,
    ALLOW_EPHEMERAL_DATA: production ? "true" : "false",
    NODE_ENV: production ? "production" : "development",
    DEMO_MODE: production ? "false" : "true",
    AUTH_SECRET: authSecret,
    ADMIN_EMAIL: "admin@college.edu",
    ADMIN_PASSWORD: "test-legacy-admin-password",
    STAFF_PASSWORD: "",
    STAFF_CREDENTIALS: JSON.stringify(staffCredentials),
    SECTOR_ADMIN_CREDENTIALS: JSON.stringify(sectorCredentials),
    SUPER_ADMIN_NAME: "Test Super Admin",
    SUPER_ADMIN_EMAIL: "superadmin@test.example",
    SUPER_ADMIN_PASSWORD: "test-super-admin-password",
    ALLOWED_COLLEGE_EMAIL_DOMAIN: production ? "@its.edu.in" : ".edu.in",
    EMAIL_PROVIDER: production ? "resend" : "",
    RESEND_API_KEY: production ? "re_localstub_api_key_12345678" : "",
    OTP_FROM_EMAIL: production ? "noreply@campus.example.test" : "",
    APP_URL: production ? origin : "",
    CORS_ALLOWED_ORIGINS: "",
    OTP_TEST_CAPTURE_PATH: otpCapturePath,
    OTP_TEST_CLOCK_PATH: otpClockPath,
    OTP_TEST_PROVIDER_STATUS_PATH: providerStatusPath,
    NODE_OPTIONS: [process.env.NODE_OPTIONS, `--import=${pathToFileURL(providerStubPath).href}`].filter(Boolean).join(" "),
    ...overrides,
  };
  const child = spawn(process.execPath, ["--import", "tsx", "server.ts"], {
    cwd: process.cwd(),
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (chunk) => { output += chunk; });
  child.stderr.on("data", (chunk) => { output += chunk; });
  let childError = null;
  let childExit = null;
  child.once("error", (error) => { childError = error; });
  child.once("exit", (code, signal) => { childExit = { code, signal }; });
  const childClosed = new Promise((resolve) => child.once("close", resolve));

  const baseUrl = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (childError || child.exitCode !== null) break;
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {}
    await delay(100);
  }
  if (!ready) {
    if (child.exitCode === null && child.signalCode === null) child.kill();
    await Promise.race([childClosed, delay(1000)]);
    const status = childError
      ? `spawn error: ${childError.message}`
      : childExit
        ? `exit code ${childExit.code}, signal ${childExit.signal ?? "none"}`
        : "still running after readiness deadline";
    throw new Error(`Test server failed to start (${status}). Process output: ${output}`);
  }
  return { child, baseUrl, origin, output: () => output, otpCapturePath, otpClockPath, providerStatusPath };
}

async function startOtpApp(t) {
  const dataDir = mkdtempSync(path.join(tmpdir(), `campus-ai-otp-${randomUUID()}-`));
  writeFileSync(path.join(dataDir, "students.csv"),
    "student_id,roll_number,email,phone,email_verified,registration_date\n" +
    "STU001,23AIML001,student@college.edu.in,9876543210,true,2026-08-15\n" +
    "STU002,2021MEB021,ankit.singh@college.edu.in,9876501234,true,2026-08-15\n" +
    "STU003,2023ECE052,abhinav.tiwari@college.edu.in,9123456780,true,2026-08-15\n");
  const app = await startApp(dataDir, false, {
    DEMO_MODE: "false",
    EMAIL_PROVIDER: "resend",
    RESEND_API_KEY: "re_localstub_api_key_12345678",
    OTP_FROM_EMAIL: "noreply@campus.example.test",
  });
  t.after(async () => {
    await stopApp(app.child);
    rmSync(dataDir, { recursive: true, force: true });
  });
  return app;
}

async function stopApp(child) {
  if (child.exitCode !== null) return;
  child.kill();
  await Promise.race([
    new Promise((resolve) => child.once("exit", resolve)),
    delay(5000).then(() => { throw new Error("Test server did not stop."); }),
  ]);
}

async function request(baseUrl, route, { method = "GET", token, body, headers = {} } = {}) {
  const response = await fetch(`${baseUrl}${route}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json();
  return { response, data };
}

function expiredToken() {
  const payload = Buffer.from(JSON.stringify({
    email: "expired@test.example",
    name: "Expired",
    role: "student",
    studentId: "STU001",
    rollNumber: "23AIML001",
    exp: Date.now() - 1000,
  })).toString("base64url");
  const signature = createHmac("sha256", authSecret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function legacyTokenWithoutSessionVersion() {
  const payload = Buffer.from(JSON.stringify({
    email: "legacy@test.example",
    name: "Legacy",
    role: "student",
    studentId: "STU001",
    rollNumber: "23AIML001",
    exp: Date.now() + 60_000,
  })).toString("base64url");
  const signature = createHmac("sha256", authSecret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

test("auth, ownership, department scope, logout, persistence, CORS, and OTP protections", async (t) => {
  const dataDir = mkdtempSync(path.join(tmpdir(), `campus-ai-security-${randomUUID()}-`));
  let app;
  let productionApp;
  t.after(async () => {
    if (app) await stopApp(app.child);
    if (productionApp) await stopApp(productionApp.child);
    rmSync(dataDir, { recursive: true, force: true });
  });

  app = await startApp(dataDir);

  const studentLogin = await request(app.baseUrl, "/api/auth/demo-login", {
    method: "POST",
    body: { account: "student", rollNumber: "23AIML001" },
  });
  assert.equal(studentLogin.response.status, 200);
  const studentToken = studentLogin.data.token;
  const wardenLogin = await request(app.baseUrl, "/api/auth/staff-login", {
    method: "POST",
    body: { email: "warden@college.edu", password: staffCredentials["warden@college.edu"] },
  });
  assert.equal(wardenLogin.response.status, 200);
  assert.equal((await request(app.baseUrl, "/api/auth/staff-login", {
    method: "POST",
    body: { email: "warden@college.edu", password: staffCredentials["electrical@college.edu"] },
  })).response.status, 401);
  const wardenNotifications = await request(app.baseUrl, "/api/notifications", {
    token: wardenLogin.data.token,
  });
  assert.equal(wardenNotifications.data.notifications.some((notification) => notification.id === "notif-1"), false);
  assert.equal((await request(app.baseUrl, "/api/complaints/assigned", {
    token: wardenLogin.data.token,
  })).data.complaints.some((complaint) => complaint.department !== "Hostel / Warden"), false);
  assert.equal((await request(app.baseUrl, "/api/auth/admin-login", {
    method: "POST",
    body: { email: "it.admin@college.edu", password: "test-legacy-admin-password" },
  })).response.status, 401);
  assert.equal((await request(app.baseUrl, "/api/auth/admin-login", {
    method: "POST",
    body: { email: "admin@college.edu", password: sectorCredentials["it.admin@college.edu"] },
  })).response.status, 401);
  const sectorAdminLogin = await request(app.baseUrl, "/api/auth/admin-login", {
    method: "POST",
    body: {
      email: "it.admin@college.edu",
      password: sectorCredentials["it.admin@college.edu"],
    },
  });
  assert.equal(sectorAdminLogin.response.status, 200);
  assert.equal(sectorAdminLogin.data.role, "sector_admin");
  assert.equal((await request(app.baseUrl, "/api/notifications", {
    token: sectorAdminLogin.data.token,
  })).data.notifications.some((notification) => notification.id === "notif-1"), false);
  assert.equal((await request(app.baseUrl, "/api/admin/students", {
    token: sectorAdminLogin.data.token,
  })).response.status, 403);

  assert.equal((await request(app.baseUrl, "/api/auth/session", { token: "invalid-token" })).response.status, 401);
  assert.equal((await request(app.baseUrl, "/api/auth/session", { token: expiredToken() })).response.status, 401);
  assert.equal((await request(app.baseUrl, "/api/auth/session", {
    token: legacyTokenWithoutSessionVersion(),
  })).response.status, 401);
  assert.equal((await request(app.baseUrl, "/api/admin/accounts", {
    token: studentToken,
    headers: { "x-user-role": "super_admin" },
  })).response.status, 403);
  assert.equal((await request(app.baseUrl, "/api/complaints/CMP-101", { token: studentToken })).response.status, 403);

  const created = await request(app.baseUrl, "/api/complaints", {
    method: "POST",
    token: studentToken,
    body: { title: "Security regression test", description: "A regression test complaint." },
  });
  assert.equal(created.response.status, 201);
  const complaintId = created.data.complaint.id;
  assert.equal(created.data.complaint.sector, "Security");

  const otherStudent = await request(app.baseUrl, "/api/auth/demo-login", {
    method: "POST",
    body: { account: "student", rollNumber: "2022CSB1044" },
  });
  assert.equal(otherStudent.response.status, 200);
  assert.equal((await request(app.baseUrl, `/api/complaints/${complaintId}`, {
    token: otherStudent.data.token,
  })).response.status, 403);

  const otpMismatch = await request(app.baseUrl, "/api/auth/send-otp", {
    method: "POST",
    body: {
      rollNumber: "UNKNOWN-OTP-ROLL",
      email: "student@college.edu.in",
      phone: "9876543210",
    },
  });
  assert.equal(otpMismatch.response.status, 202);
  const demoOtp = await request(app.baseUrl, "/api/auth/send-otp", {
    method: "POST",
    body: {
      rollNumber: "23AIML001",
      email: "student@college.edu.in",
      phone: "9876543210",
    },
  });
  assert.equal(demoOtp.response.status, 202);
  assert.match(demoOtp.data.demoOtp, /^\d{6}$/);
  const verifiedDemoStudent = await request(app.baseUrl, "/api/auth/verify-otp", {
    method: "POST",
    body: {
      rollNumber: "23AIML001",
      email: "student@college.edu.in",
      phone: "9876543210",
      otp: demoOtp.data.demoOtp,
    },
  });
  assert.equal(verifiedDemoStudent.response.status, 200);
  assert.equal((await request(app.baseUrl, "/api/auth/session", {
    token: verifiedDemoStudent.data.token,
  })).response.status, 200);
  assert.equal((await request(app.baseUrl, "/api/auth/verify-otp", {
    method: "POST",
    body: {
      rollNumber: "23AIML001",
      email: "student@college.edu.in",
      otp: demoOtp.data.demoOtp,
    },
  })).response.status, 400);

  const adminLogin = await request(app.baseUrl, "/api/auth/demo-login", {
    method: "POST",
    body: { account: "super_admin" },
  });
  assert.equal(adminLogin.response.status, 200);
  assert.equal((await request(app.baseUrl, "/api/notifications", {
    token: adminLogin.data.token,
  })).data.notifications.some((notification) => notification.id === "notif-1"), true);
  assert.equal((await request(app.baseUrl, "/api/admin/accounts", {
    token: adminLogin.data.token,
  })).response.status, 403);
  const assignment = await request(app.baseUrl, `/api/complaints/${complaintId}/assign`, {
    method: "POST",
    token: adminLogin.data.token,
    body: {
      department: "Electrical",
      assignedTo: "Electrical Staff",
      assignedToId: "demo-electrical-staff",
    },
  });
  assert.equal(assignment.response.status, 200);
  const assignmentNotifications = await request(app.baseUrl, "/api/notifications", {
    token: studentToken,
  });
  const assignmentTimelineLength = assignment.data.complaint.timeline.length;
  const repeatedAssignment = await request(app.baseUrl, `/api/complaints/${complaintId}/assign`, {
    method: "POST",
    token: adminLogin.data.token,
    body: {
      department: "Electrical",
      assignedTo: "Electrical Staff",
      assignedToId: "demo-electrical-staff",
    },
  });
  assert.equal(repeatedAssignment.response.status, 200);
  assert.equal(repeatedAssignment.data.complaint.timeline.length, assignmentTimelineLength);
  const repeatedAssignmentNotifications = await request(app.baseUrl, "/api/notifications", {
    token: studentToken,
  });
  assert.equal(repeatedAssignmentNotifications.data.notifications.length, assignmentNotifications.data.notifications.length);
  assert.equal((await request(app.baseUrl, `/api/complaints/${complaintId}`, {
    token: sectorAdminLogin.data.token,
  })).response.status, 403);
  const electricalLogin = await request(app.baseUrl, "/api/auth/demo-login", {
    method: "POST",
    body: { account: "electrical_staff" },
  });
  const itLogin = await request(app.baseUrl, "/api/auth/demo-login", {
    method: "POST",
    body: { account: "it_staff" },
  });
  const electricalAssignments = await request(app.baseUrl, "/api/complaints/assigned", {
    token: electricalLogin.data.token,
  });
  const itAssignments = await request(app.baseUrl, "/api/complaints/assigned", {
    token: itLogin.data.token,
  });
  assert.ok(electricalAssignments.data.complaints.some((complaint) => complaint.id === complaintId));
  assert.equal(itAssignments.data.complaints.some((complaint) => complaint.id === complaintId), false);
  const electricalNotifications = await request(app.baseUrl, "/api/notifications", {
    token: electricalLogin.data.token,
  });
  const itNotifications = await request(app.baseUrl, "/api/notifications", {
    token: itLogin.data.token,
  });
  assert.equal(electricalNotifications.data.notifications.some((notification) =>
    notification.complaintId === complaintId && notification.recipientType === "admin"), true);
  assert.equal(itNotifications.data.notifications.some((notification) =>
    notification.complaintId === complaintId && notification.recipientType === "admin"), false);
  assert.equal((await request(app.baseUrl, `/api/complaints/${complaintId}/status`, {
    method: "PATCH",
    token: itLogin.data.token,
    body: { status: "In Progress" },
  })).response.status, 403);
  const spoofedComment = await request(app.baseUrl, `/api/complaints/${complaintId}`, {
    method: "PATCH",
    token: electricalLogin.data.token,
    body: { newComment: "Staff activity", author: "Forged administrator" },
  });
  assert.equal(spoofedComment.response.status, 200);
  assert.equal(spoofedComment.data.complaint.comments.at(-1).author, "Demo Electrical Staff");
  const progress = await request(app.baseUrl, `/api/complaints/${complaintId}/status`, {
    method: "PATCH",
    token: electricalLogin.data.token,
    body: { status: "In Progress" },
  });
  assert.equal(progress.response.status, 200);
  const resolved = await request(app.baseUrl, `/api/complaints/${complaintId}/status`, {
    method: "PATCH",
    token: electricalLogin.data.token,
    body: { status: "Resolved" },
  });
  assert.equal(resolved.response.status, 200);
  assert.equal((await request(app.baseUrl, `/api/complaints/${complaintId}`, {
    token: studentToken,
  })).data.complaint.status, "Resolved");

  const adminAccountLogin = await request(app.baseUrl, "/api/auth/admin-login", {
    method: "POST",
    body: { email: "superadmin@test.example", password: "test-super-admin-password" },
  });
  assert.equal(adminAccountLogin.response.status, 200);
  const rejectedPromotion = await request(app.baseUrl, "/api/admin/accounts", {
    method: "POST",
    token: adminAccountLogin.data.token,
    body: {
      name: "Attempted Super Admin",
      email: "promoted@test.example",
      password: "test-college-admin-password",
      role: "super_admin",
    },
  });
  assert.equal(rejectedPromotion.response.status, 403);
  const collegeAdmin = await request(app.baseUrl, "/api/admin/accounts", {
    method: "POST",
    token: adminAccountLogin.data.token,
    body: {
      name: "Test College Admin",
      email: "collegeadmin@test.example",
      password: "test-college-admin-password",
    },
  });
  assert.equal(collegeAdmin.response.status, 201);
  assert.equal("passwordHash" in collegeAdmin.data.account, false);
  assert.equal((await request(app.baseUrl, "/api/admin/accounts", {
    method: "POST",
    token: adminAccountLogin.data.token,
    body: {
      name: "Duplicate College Admin",
      email: "collegeadmin@test.example",
      password: "another-college-admin-password",
    },
  })).response.status, 409);
  const collegeAdminLogin = await request(app.baseUrl, "/api/auth/admin-login", {
    method: "POST",
    body: { email: "collegeadmin@test.example", password: "test-college-admin-password" },
  });
  assert.equal(collegeAdminLogin.response.status, 200);
  assert.equal((await request(app.baseUrl, "/api/admin/accounts", {
    token: collegeAdminLogin.data.token,
    method: "POST",
    body: {
      name: "Attempted Super Admin",
      email: "another-superadmin@test.example",
      password: "test-another-super-admin-password",
      role: "super_admin",
    },
  })).response.status, 403);
  assert.equal((await request(app.baseUrl, "/api/admin/accounts", {
    token: collegeAdminLogin.data.token,
  })).response.status, 403);
  const accountDeactivated = await request(app.baseUrl, `/api/admin/accounts/${collegeAdmin.data.account.id}`, {
    method: "PATCH",
    token: adminAccountLogin.data.token,
    body: { active: false },
  });
  assert.equal(accountDeactivated.response.status, 200);
  assert.equal((await request(app.baseUrl, "/api/auth/session", {
    token: collegeAdminLogin.data.token,
  })).response.status, 401);
  const accountReactivated = await request(app.baseUrl, `/api/admin/accounts/${collegeAdmin.data.account.id}`, {
    method: "PATCH",
    token: adminAccountLogin.data.token,
    body: { active: true },
  });
  assert.equal(accountReactivated.response.status, 200);
  const oldCollegePasswordReset = await request(app.baseUrl, `/api/admin/accounts/${collegeAdmin.data.account.id}/reset-password`, {
    method: "POST",
    token: adminAccountLogin.data.token,
    body: { password: "test-reset-college-admin-password" },
  });
  assert.equal(oldCollegePasswordReset.response.status, 200);
  assert.equal((await request(app.baseUrl, "/api/auth/admin-login", {
    method: "POST",
    body: { email: "collegeadmin@test.example", password: "test-college-admin-password" },
  })).response.status, 401);
  const resetCollegeAdminLogin = await request(app.baseUrl, "/api/auth/admin-login", {
    method: "POST",
    body: { email: "collegeadmin@test.example", password: "test-reset-college-admin-password" },
  });
  assert.equal(resetCollegeAdminLogin.response.status, 200);
  assert.equal((await request(app.baseUrl, "/api/auth/session", {
    token: collegeAdminLogin.data.token,
  })).response.status, 401);

  const devAllowedOrigin = await fetch(`${app.baseUrl}/api/health`, {
    headers: { Origin: "http://localhost:5173" },
  });
  assert.equal(devAllowedOrigin.headers.get("access-control-allow-origin"), "http://localhost:5173");
  const disallowedDevOrigin = await fetch(`${app.baseUrl}/api/health`, {
    headers: { Origin: "https://untrusted.example" },
  });
  assert.equal(disallowedDevOrigin.status, 403);

  assert.equal((await request(app.baseUrl, "/api/auth/logout", {
    method: "POST",
    token: studentToken,
  })).response.status, 200);
  assert.equal((await request(app.baseUrl, "/api/auth/session", { token: studentToken })).response.status, 401);

  await stopApp(app.child);
  app = null;
  app = await startApp(dataDir, false, {
    STAFF_CREDENTIALS: JSON.stringify({
      ...staffCredentials,
      "warden@college.edu": "rotated-warden-password",
    }),
  });
  assert.equal((await request(app.baseUrl, "/api/auth/session", { token: studentToken })).response.status, 401);
  assert.equal((await request(app.baseUrl, "/api/auth/session", {
    token: wardenLogin.data.token,
  })).response.status, 401);
  const studentAfterRestart = await request(app.baseUrl, "/api/auth/demo-login", {
    method: "POST",
    body: { account: "student", rollNumber: "23AIML001" },
  });
  assert.equal((await request(app.baseUrl, `/api/complaints/${complaintId}`, {
    token: studentAfterRestart.data.token,
  })).data.complaint.status, "Resolved");

  await stopApp(app.child);
  app = null;
  writeFileSync(path.join(dataDir, "students.csv"), readFileSync(path.join(dataDir, "students.csv"), "utf8")
    .replace("student@college.edu.in", "student@its.edu.in"));
  productionApp = await startApp(dataDir, true);
  assert.equal((await request(productionApp.baseUrl, "/api/auth/session", {
    token: studentAfterRestart.data.token,
  })).response.status, 401);
  const allowedProductionOrigin = await fetch(`${productionApp.baseUrl}/api/health`, {
    headers: { Origin: productionApp.origin },
  });
  assert.equal(allowedProductionOrigin.headers.get("access-control-allow-origin"), productionApp.origin);
  assert.equal(allowedProductionOrigin.headers.get("access-control-allow-credentials"), null);
  const rejectedProductionOrigin = await fetch(`${productionApp.baseUrl}/api/health`, {
    headers: { Origin: "http://localhost:5173" },
  });
  assert.equal(rejectedProductionOrigin.status, 403);
  const productionOtp = await request(productionApp.baseUrl, "/api/auth/send-otp", {
    method: "POST",
    body: {
      rollNumber: "23AIML001",
      email: "student@its.edu.in",
      phone: "9876543210",
    },
  });
  assert.equal(productionOtp.response.status, 202);
  assert.equal(productionOtp.data.demoOtp, undefined);
  assert.equal(productionOtp.data.token, undefined);
  assert.ok(existsSync(productionApp.otpCapturePath));
  const productionOtpCode = readFileSync(productionApp.otpCapturePath, "utf8");
  const rejectedDomainOtp = await request(productionApp.baseUrl, "/api/auth/send-otp", {
    method: "POST",
    body: {
      rollNumber: "23AIML001",
      email: "student@college.edu.in",
      phone: "9876543210",
    },
  });
  assert.equal(rejectedDomainOtp.response.status, productionOtp.response.status);
  assert.equal(rejectedDomainOtp.data.success, true);
  assert.equal(rejectedDomainOtp.data.demoOtp, undefined);
  assert.equal(readFileSync(productionApp.otpCapturePath, "utf8"), productionOtpCode);
  const unknownProductionOtp = await request(productionApp.baseUrl, "/api/auth/send-otp", {
    method: "POST",
    body: {
      rollNumber: "UNKNOWN-PRODUCTION-ROLL",
      email: "student@its.edu.in",
      phone: "9876543210",
    },
  });
  assert.equal(unknownProductionOtp.response.status, productionOtp.response.status);
  assert.deepEqual(unknownProductionOtp.data, productionOtp.data);
  assert.match(productionOtpCode, /^\d{6}$/);
  assert.equal(JSON.stringify(productionOtp.data).includes(productionOtpCode), false);
  assert.equal(productionApp.output().includes(productionOtpCode), false);
  const productionOtpVerification = await request(productionApp.baseUrl, "/api/auth/verify-otp", {
    method: "POST",
    body: {
      rollNumber: "23AIML001",
      email: "student@its.edu.in",
      otp: productionOtpCode,
    },
  });
  assert.equal(productionOtpVerification.response.status, 200);
  assert.equal((await request(productionApp.baseUrl, "/api/auth/session", {
    token: productionOtpVerification.data.token,
  })).response.status, 200);
  assert.equal((await request(productionApp.baseUrl, "/api/auth/verify-otp", {
    method: "POST",
    body: {
      rollNumber: "23AIML001",
      email: "student@its.edu.in",
      otp: productionOtpCode,
    },
  })).response.status, 400);

  let limitedLogin;
  for (let attempt = 0; attempt < 12; attempt += 1) {
    limitedLogin = await request(productionApp.baseUrl, "/api/auth/admin-login", {
      method: "POST",
      body: { email: "admin@college.edu", password: "incorrect-password" },
    });
    if (limitedLogin.response.status === 429) break;
  }
  assert.equal(limitedLogin.response.status, 429);
});

test("OTP delivery succeeds only after provider acceptance and verification is single-use", async (t) => {
  const app = await startOtpApp(t);
  const send = await request(app.baseUrl, "/api/auth/send-otp", {
    method: "POST",
    body: {
      rollNumber: "23AIML001",
      email: "student@college.edu.in",
      phone: "9876543210",
    },
  });
  assert.equal(send.response.status, 202);
  assert.equal(send.data.demoOtp, undefined);
  assert.ok(existsSync(app.otpCapturePath));
  assert.match(app.output(), /\[OTP\] Send request received\./);
  assert.match(app.output(), /\[OTP\] Resend send attempt started\./);
  assert.match(app.output(), /\[OTP\] Resend accepted send request: HTTP 200\./);
  const code = readFileSync(app.otpCapturePath, "utf8");
  assert.match(code, /^\d{6}$/);

  const cooldown = await request(app.baseUrl, "/api/auth/send-otp", {
    method: "POST",
    body: {
      rollNumber: "23AIML001",
      email: "student@college.edu.in",
      phone: "9876543210",
    },
  });
  assert.equal(cooldown.response.status, 429);

  const verified = await request(app.baseUrl, "/api/auth/verify-otp", {
    method: "POST",
    body: {
      rollNumber: "23AIML001",
      email: "student@college.edu.in",
      otp: code,
    },
  });
  assert.equal(verified.response.status, 200);
  assert.equal((await request(app.baseUrl, "/api/auth/session", {
    token: verified.data.token,
  })).response.status, 200);
  assert.equal((await request(app.baseUrl, "/api/auth/verify-otp", {
    method: "POST",
    body: {
      rollNumber: "23AIML001",
      email: "student@college.edu.in",
      otp: code,
    },
  })).response.status, 400);
  assert.equal(app.output().includes(code), false);

  writeFileSync(app.providerStatusPath, "503");
  const unknownRequest = await request(app.baseUrl, "/api/auth/send-otp", {
    method: "POST",
    body: {
      rollNumber: "UNKNOWN-OTP-ROLL",
      email: "ankit.singh@college.edu.in",
      phone: "9876501234",
    },
  });
  assert.equal(unknownRequest.response.status, 202);
  assert.match(app.output(), /\[OTP\] Send request skipped: no matching registered student\./);
  const failedDelivery = await request(app.baseUrl, "/api/auth/send-otp", {
    method: "POST",
    body: {
      rollNumber: "2021MEB021",
      email: "ankit.singh@college.edu.in",
      phone: "9876501234",
    },
  });
  assert.equal(failedDelivery.response.status, 202);
  assert.deepEqual(failedDelivery.data, unknownRequest.data);
  assert.equal(failedDelivery.data.demoOtp, undefined);
  assert.equal(failedDelivery.data.token, undefined);
  assert.match(app.output(), /\[OTP\] Registered student matched; continuing OTP delivery\./);
  assert.equal(JSON.stringify(failedDelivery.data).includes(readFileSync(app.otpCapturePath, "utf8")), false);
  assert.equal((await request(app.baseUrl, "/api/auth/verify-otp", {
    method: "POST",
    body: {
      rollNumber: "2021MEB021",
      email: "ankit.singh@college.edu.in",
      otp: readFileSync(app.otpCapturePath, "utf8"),
    },
  })).response.status, 400);

  writeFileSync(app.providerStatusPath, "-1");
  const networkFailure = await request(app.baseUrl, "/api/auth/send-otp", {
    method: "POST",
    body: {
      rollNumber: "2023ECE052",
      email: "abhinav.tiwari@college.edu.in",
      phone: "9123456780",
    },
  });
  assert.equal(networkFailure.data.success, unknownRequest.data.success);
  assert.equal(networkFailure.data.message, unknownRequest.data.message);
  assert.equal(networkFailure.data.expiresInSeconds, unknownRequest.data.expiresInSeconds);
  assert.equal(networkFailure.data.token, undefined);
  assert.equal((await request(app.baseUrl, "/api/auth/verify-otp", {
    method: "POST",
    body: {
      rollNumber: "2023ECE052",
      email: "abhinav.tiwari@college.edu.in",
      otp: readFileSync(app.otpCapturePath, "utf8"),
    },
  })).response.status, 400);
  assert.match(app.output(), /\[OTP\] Resend send failed: HTTP 503\./);
  assert.match(app.output(), /\[OTP\] Resend send failed: network request error\./);

  writeFileSync(app.otpClockPath, "21000");
  writeFileSync(app.providerStatusPath, "403");
  const pendingDomainFailure = await request(app.baseUrl, "/api/auth/send-otp", {
    method: "POST",
    body: {
      rollNumber: "2021MEB021",
      email: "ankit.singh@college.edu.in",
      phone: "9876501234",
    },
  });
  assert.equal(pendingDomainFailure.response.status, 202);
  assert.equal(pendingDomainFailure.data.success, true);
  assert.match(app.output(), /\[OTP\] Resend send failed: HTTP 403\./);

  for (const sensitiveValue of [
    "student@college.edu.in",
    "ankit.singh@college.edu.in",
    "abhinav.tiwari@college.edu.in",
    "re_localstub_api_key_12345678",
    "test-legacy-admin-password",
    "test-super-admin-password",
    code,
  ]) {
    assert.equal(app.output().includes(sensitiveValue), false);
  }
});

test("OTP expiry and exact registered identity binding are enforced", async (t) => {
  const app = await startOtpApp(t);
  const sent = await request(app.baseUrl, "/api/auth/send-otp", {
    method: "POST",
    body: {
      rollNumber: "23AIML001",
      email: "student@college.edu.in",
      phone: "9876543210",
    },
  });
  assert.equal(sent.response.status, 202);
  const expiredCode = readFileSync(app.otpCapturePath, "utf8");
  writeFileSync(app.otpClockPath, "301000");
  assert.equal((await request(app.baseUrl, "/api/auth/verify-otp", {
    method: "POST",
    body: { rollNumber: "23AIML001", email: "student@college.edu.in", otp: expiredCode },
  })).response.status, 400);
});

test("OTP requests and verification stay bound to the registered email and roll number", async (t) => {
  const app = await startOtpApp(t);
  const mismatchedEmailRequest = await request(app.baseUrl, "/api/auth/send-otp", {
    method: "POST",
    body: {
      rollNumber: "23AIML001",
      email: "wrong@college.edu.in",
      phone: "9876543210",
    },
  });
  assert.equal(mismatchedEmailRequest.response.status, 202);
  assert.equal(mismatchedEmailRequest.data.demoOtp, undefined);
  const firstSend = await request(app.baseUrl, "/api/auth/send-otp", {
    method: "POST",
    body: {
      rollNumber: "23AIML001",
      email: "student@college.edu.in",
      phone: "9876543210",
    },
  });
  assert.equal(firstSend.response.status, 202);
  const firstCode = readFileSync(app.otpCapturePath, "utf8");
  assert.equal((await request(app.baseUrl, "/api/auth/verify-otp", {
    method: "POST",
    body: { rollNumber: "23AIML001", email: "ankit.singh@college.edu.in", otp: firstCode },
  })).response.status, 400);
  assert.equal((await request(app.baseUrl, "/api/auth/verify-otp", {
    method: "POST",
    body: { rollNumber: "23AIML001", email: "student@college.edu.in", otp: firstCode },
  })).response.status, 200);
});

test("an exhausted OTP challenge is indistinguishable from an unknown challenge", async (t) => {
  const app = await startOtpApp(t);
  const sent = await request(app.baseUrl, "/api/auth/send-otp", {
    method: "POST",
    body: {
      rollNumber: "2021MEB021",
      email: "ankit.singh@college.edu.in",
      phone: "9876501234",
    },
  });
  assert.equal(sent.response.status, 202);
  const noChallenge = await request(app.baseUrl, "/api/auth/verify-otp", {
    method: "POST",
    body: { rollNumber: "NOT-REGISTERED", email: "unknown@college.edu.in", otp: "000000" },
  });
  assert.equal(noChallenge.response.status, 400);
  for (let attempt = 0; attempt < 4; attempt += 1) {
    assert.equal((await request(app.baseUrl, "/api/auth/verify-otp", {
      method: "POST",
      body: { rollNumber: "2021MEB021", email: "ankit.singh@college.edu.in", otp: "000000" },
    })).response.status, 400);
  }
  const exhaustedChallenge = await request(app.baseUrl, "/api/auth/verify-otp", {
    method: "POST",
    body: { rollNumber: "2021MEB021", email: "ankit.singh@college.edu.in", otp: "000000" },
  });
  assert.equal(exhaustedChallenge.response.status, 400);
  assert.deepEqual(exhaustedChallenge.data, noChallenge.data);
  const afterExhaustion = await request(app.baseUrl, "/api/auth/verify-otp", {
    method: "POST",
    body: { rollNumber: "2021MEB021", email: "ankit.singh@college.edu.in", otp: "000000" },
  });
  assert.equal(afterExhaustion.response.status, 400);
  assert.deepEqual(afterExhaustion.data, noChallenge.data);
});

test("OTP send requests are rate limited per client", async (t) => {
  const app = await startOtpApp(t);
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const limited = await request(app.baseUrl, "/api/auth/send-otp", {
      method: "POST",
      body: {
        rollNumber: `UNKNOWN-${attempt}`,
        email: "unknown@college.edu.in",
        phone: "9876543210",
      },
    });
    assert.equal(limited.response.status, 202);
  }
  assert.equal((await request(app.baseUrl, "/api/auth/send-otp", {
    method: "POST",
    body: {
      rollNumber: "UNKNOWN-LAST",
      email: "unknown@college.edu.in",
      phone: "9876543210",
    },
  })).response.status, 429);
  assert.match(app.output(), /\[OTP\] Send request rejected by rate limit\./);
});

test("production startup rejects missing or insecure configuration without printing secrets", async () => {
  const requiredVariables = [
    "APP_URL",
    "AUTH_SECRET",
    "ADMIN_PASSWORD",
    "STAFF_CREDENTIALS",
    "SECTOR_ADMIN_CREDENTIALS",
    "SUPER_ADMIN_NAME",
    "SUPER_ADMIN_EMAIL",
    "SUPER_ADMIN_PASSWORD",
    "EMAIL_PROVIDER",
    "RESEND_API_KEY",
    "OTP_FROM_EMAIL",
    "DATA_DIR",
    "DEMO_MODE",
  ];
  for (const variable of requiredVariables) {
    await expectProductionStartupFailure({ [variable]: undefined });
  }

  const insecureConfigurations = [
    { AUTH_SECRET: "a".repeat(64) },
    { APP_URL: "http://campus.example.test" },
    { ALLOW_EPHEMERAL_DATA: "false", DATA_DIR: "relative-data" },
    { ALLOW_EPHEMERAL_DATA: "invalid" },
    {
      ALLOW_EPHEMERAL_DATA: "true",
      DATA_DIR: path.resolve(process.cwd(), "data"),
    },
    { DEMO_MODE: "true" },
    { EMAIL_PROVIDER: "sendgrid" },
    { ALLOWED_COLLEGE_EMAIL_DOMAIN: ".edu.in" },
    { RESEND_API_KEY: "not-a-resend-key" },
    { RESEND_API_KEY: "re_replace-with-your-private-key" },
    { OTP_FROM_EMAIL: "not-an-email-address" },
    { STAFF_CREDENTIALS: "not-json" },
    { PORT: "3000-extra" },
  ];
  for (const environment of insecureConfigurations) {
    await expectProductionStartupFailure(environment);
  }
});

test("a fresh production data directory contains no demo student accounts", async (t) => {
  const dataDir = mkdtempSync(path.join(tmpdir(), `campus-ai-production-roster-${randomUUID()}-`));
  const app = await startApp(dataDir, true);
  t.after(async () => {
    await stopApp(app.child);
    rmSync(dataDir, { recursive: true, force: true });
  });
  const roster = readFileSync(path.join(dataDir, "students.csv"), "utf8");
  assert.equal(roster.trim(), "student_id,roll_number,email,phone,email_verified,registration_date");
  const send = await request(app.baseUrl, "/api/auth/send-otp", {
    method: "POST",
    body: {
      rollNumber: "23AIML001",
      email: "student@college.edu.in",
      phone: "9876543210",
    },
  });
  assert.equal(send.response.status, 202);
  assert.equal(send.data.demoOtp, undefined);
  assert.equal(existsSync(app.otpCapturePath), false);
});

test("ephemeral production storage warns and expires sessions when the process restarts", async (t) => {
  const dataDir = mkdtempSync(path.join(tmpdir(), `campus-ai-ephemeral-production-${randomUUID()}-`));
  let app = await startApp(dataDir, true);
  t.after(async () => {
    if (app) await stopApp(app.child);
    rmSync(dataDir, { recursive: true, force: true });
  });

  assert.match(app.output(), /Ephemeral DATA_DIR enabled/);
  const login = await request(app.baseUrl, "/api/auth/admin-login", {
    method: "POST",
    body: { email: "admin@college.edu", password: "test-legacy-admin-password" },
  });
  assert.equal(login.response.status, 200);

  await stopApp(app.child);
  app = await startApp(dataDir, true);
  assert.equal((await request(app.baseUrl, "/api/auth/session", {
    token: login.data.token,
  })).response.status, 401);
});

test("untargeted and other-user notifications are not exposed through the notification API", async (t) => {
  const dataDir = mkdtempSync(path.join(tmpdir(), `campus-ai-notification-scope-${randomUUID()}-`));
  writeFileSync(path.join(dataDir, "notifications.json"), JSON.stringify([
    {
      id: "untargeted-student",
      recipientType: "student",
      complaintId: "CMP-OTHER",
      title: "Another student's private status",
      message: "Private status details",
      timestamp: new Date().toISOString(),
      read: false,
      type: "status",
    },
    {
      id: "other-student",
      recipientType: "student",
      recipientId: "STU002",
      complaintId: "CMP-OTHER",
      title: "Another student's assigned status",
      message: "Private assigned status details",
      timestamp: new Date().toISOString(),
      read: false,
      type: "status",
    },
    {
      id: "untargeted-admin",
      recipientType: "admin",
      complaintId: "CMP-OTHER",
      title: "Untargeted administrative alert",
      message: "Alert details",
      timestamp: new Date().toISOString(),
      read: false,
      type: "critical",
    },
  ]));
  const app = await startApp(dataDir);
  t.after(async () => {
    await stopApp(app.child);
    rmSync(dataDir, { recursive: true, force: true });
  });

  const student = await request(app.baseUrl, "/api/auth/demo-login", {
    method: "POST",
    body: { account: "student", rollNumber: "23AIML001" },
  });
  const studentNotifications = await request(app.baseUrl, "/api/notifications", {
    token: student.data.token,
  });
  assert.deepEqual(studentNotifications.data.notifications, []);

  const sectorAdmin = await request(app.baseUrl, "/api/auth/admin-login", {
    method: "POST",
    body: {
      email: "it.admin@college.edu",
      password: sectorCredentials["it.admin@college.edu"],
    },
  });
  const sectorNotifications = await request(app.baseUrl, "/api/notifications", {
    token: sectorAdmin.data.token,
  });
  assert.deepEqual(sectorNotifications.data.notifications, []);

  const mainAdmin = await request(app.baseUrl, "/api/auth/admin-login", {
    method: "POST",
    body: { email: "admin@college.edu", password: "test-legacy-admin-password" },
  });
  const adminNotifications = await request(app.baseUrl, "/api/notifications", {
    token: mainAdmin.data.token,
  });
  assert.equal(adminNotifications.data.notifications.some((notification) =>
    notification.id === "untargeted-admin"), true);
});

test("failed rate-limit persistence restores the previous in-memory attempt count", async (t) => {
  const dataDir = mkdtempSync(path.join(tmpdir(), `campus-ai-rate-limit-write-${randomUUID()}-`));
  const app = await startApp(dataDir);
  t.after(async () => {
    await stopApp(app.child);
    rmSync(dataDir, { recursive: true, force: true });
  });
  const loginBody = { email: "admin@college.edu", password: "incorrect-password" };
  assert.equal((await request(app.baseUrl, "/api/auth/admin-login", {
    method: "POST",
    body: loginBody,
  })).response.status, 401);

  const rateLimitPath = path.join(dataDir, "login-attempts.json");
  unlinkSync(rateLimitPath);
  mkdirSync(rateLimitPath);
  assert.equal((await request(app.baseUrl, "/api/auth/admin-login", {
    method: "POST",
    body: loginBody,
  })).response.status, 503);

  rmdirSync(rateLimitPath);
  assert.equal((await request(app.baseUrl, "/api/auth/admin-login", {
    method: "POST",
    body: loginBody,
  })).response.status, 401);
  const persistedAttempts = JSON.parse(readFileSync(rateLimitPath, "utf8"));
  assert.equal(persistedAttempts.length, 1);
  assert.equal(persistedAttempts[0].count, 2);
});

test("staff IDs resolve to staff accounts and remain bound to valid credentials and permissions", async (t) => {
  const dataDir = mkdtempSync(path.join(tmpdir(), `campus-ai-staff-id-${randomUUID()}-`));
  writeFileSync(path.join(dataDir, "students.csv"),
    "student_id,roll_number,email,phone,email_verified,registration_date\n" +
    "STU001,STUDENT/001,student@college.edu.in,9876543210,true,2026-08-15\n");
  const app = await startApp(dataDir);
  t.after(async () => {
    await stopApp(app.child);
    rmSync(dataDir, { recursive: true, force: true });
  });

  const admin = await request(app.baseUrl, "/api/auth/admin-login", {
    method: "POST",
    body: { email: "superadmin@test.example", password: "test-super-admin-password" },
  });
  assert.equal(admin.response.status, 200);

  const staticByStaffId = await request(app.baseUrl, "/api/auth/staff-login", {
    method: "POST",
    body: { identifier: "WARDEN/001", password: staffCredentials["warden@college.edu"] },
  });
  assert.equal(staticByStaffId.response.status, 200);
  assert.equal(staticByStaffId.data.staff.staffId, "WARDEN/001");
  assert.equal(staticByStaffId.data.staff.role, "warden");
  assert.equal((await request(app.baseUrl, "/api/auth/staff-login", {
    method: "POST",
    body: { identifier: "WARDEN/999", password: staffCredentials["warden@college.edu"] },
  })).response.status, 401);
  assert.equal((await request(app.baseUrl, "/api/auth/staff-login", {
    method: "POST",
    body: { identifier: "WARDEN/001", password: "incorrect-password" },
  })).response.status, 401);
  assert.equal((await request(app.baseUrl, "/api/auth/staff-login", {
    method: "POST",
    body: { identifier: "WARDEN/001" },
  })).response.status, 401);

  const created = await request(app.baseUrl, "/api/admin/staff-accounts", {
    method: "POST",
    token: admin.data.token,
    body: {
      name: "Test IT Staff",
      email: "new.it.staff@test.example",
      role: "staff",
      department: "IT / Network",
      password: "test-managed-staff-password",
    },
  });
  assert.equal(created.response.status, 201);
  assert.equal(created.data.account.staffId, "IT/002");
  assert.equal("passwordHash" in created.data.account, false);
  const persistedStaff = JSON.parse(readFileSync(path.join(dataDir, "staff-accounts.json"), "utf8"));
  assert.match(persistedStaff[0].passwordHash, /^scrypt\$/);
  assert.notEqual(persistedStaff[0].passwordHash, "test-managed-staff-password");
  assert.equal((await request(app.baseUrl, "/api/admin/staff-accounts", {
    token: admin.data.token,
  })).data.accounts.some((account) => account.staffId === "IT/002"), true);

  const staffLogin = await request(app.baseUrl, "/api/auth/staff-login", {
    method: "POST",
    body: { identifier: created.data.account.staffId, password: "test-managed-staff-password" },
  });
  assert.equal(staffLogin.response.status, 200);
  assert.equal(staffLogin.data.role, "staff");
  assert.equal(staffLogin.data.staff.department, "IT / Network");
  assert.equal((await request(app.baseUrl, "/api/admin/staff-accounts", {
    token: staffLogin.data.token,
  })).response.status, 403);
  assert.equal((await request(app.baseUrl, "/api/admin/accounts", {
    token: staffLogin.data.token,
  })).response.status, 403);
  assert.equal((await request(app.baseUrl, "/api/auth/staff-login", {
    method: "POST",
    body: { identifier: created.data.account.staffId, password: "incorrect-password" },
  })).response.status, 401);

  assert.equal((await request(app.baseUrl, "/api/admin/staff-accounts", {
    method: "POST",
    token: admin.data.token,
    body: {
      name: "Duplicate Staff ID",
      email: "duplicate.staff@test.example",
      role: "staff",
      department: "Other",
      staffId: created.data.account.staffId,
      password: "test-duplicate-staff-password",
    },
  })).response.status, 409);
  assert.equal((await request(app.baseUrl, "/api/admin/staff-accounts", {
    method: "POST",
    token: admin.data.token,
    body: {
      name: "Student ID Collision",
      email: "collision.staff@test.example",
      role: "staff",
      department: "Other",
      staffId: "STUDENT/001",
      password: "test-collision-staff-password",
    },
  })).response.status, 409);
  assert.equal((await request(app.baseUrl, "/api/admin/staff-accounts", {
    method: "POST",
    token: admin.data.token,
    body: {
      name: "Role Escalation",
      email: "escalation.staff@test.example",
      role: "super_admin",
      department: "Administration",
      password: "test-escalation-password",
    },
  })).response.status, 400);

  const deactivated = await request(app.baseUrl, `/api/admin/staff-accounts/${created.data.account.id}`, {
    method: "PATCH",
    token: admin.data.token,
    body: { active: false },
  });
  assert.equal(deactivated.response.status, 200);
  assert.equal((await request(app.baseUrl, "/api/auth/staff-login", {
    method: "POST",
    body: { identifier: created.data.account.staffId, password: "test-managed-staff-password" },
  })).response.status, 401);
  assert.equal((await request(app.baseUrl, "/api/auth/session", {
    token: staffLogin.data.token,
  })).response.status, 401);

  const collegeAdmin = await request(app.baseUrl, "/api/admin/accounts", {
    method: "POST",
    token: admin.data.token,
    body: {
      name: "Restricted College Admin",
      email: "restricted.college.admin@test.example",
      password: "test-college-admin-password",
    },
  });
  assert.equal(collegeAdmin.response.status, 201);
  const collegeAdminLogin = await request(app.baseUrl, "/api/auth/admin-login", {
    method: "POST",
    body: { email: "restricted.college.admin@test.example", password: "test-college-admin-password" },
  });
  assert.equal(collegeAdminLogin.response.status, 200);
  assert.equal((await request(app.baseUrl, "/api/admin/staff-accounts", {
    token: collegeAdminLogin.data.token,
  })).response.status, 403);
});
