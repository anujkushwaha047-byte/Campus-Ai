import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { createHmac, randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import test from "node:test";

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

async function startApp(dataDir, production = false, overrides = {}) {
  const port = await freePort();
  const origin = "https://campus.example.test";
  const env = {
    ...process.env,
    PORT: String(port),
    DATA_DIR: dataDir,
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
    APP_URL: production ? origin : "",
    CORS_ALLOWED_ORIGINS: "",
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

  const baseUrl = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (child.exitCode !== null) break;
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
    child.kill();
    throw new Error(`Test server failed to start. Process output: ${output}`);
  }
  return { child, baseUrl, origin, output: () => output };
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

  assert.equal((await request(app.baseUrl, "/api/auth/session", { token: "invalid-token" })).response.status, 401);
  assert.equal((await request(app.baseUrl, "/api/auth/session", { token: expiredToken() })).response.status, 401);
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
      rollNumber: "23AIML001",
      email: "attacker@college.edu.in",
      phone: "9876543210",
    },
  });
  assert.equal(otpMismatch.response.status, 403);
  const demoOtp = await request(app.baseUrl, "/api/auth/send-otp", {
    method: "POST",
    body: {
      rollNumber: "23AIML001",
      email: "student@college.edu.in",
      phone: "9876543210",
    },
  });
  assert.equal(demoOtp.response.status, 200);
  assert.match(demoOtp.data.demoOtp, /^\d{6}$/);

  const adminLogin = await request(app.baseUrl, "/api/auth/demo-login", {
    method: "POST",
    body: { account: "super_admin" },
  });
  assert.equal(adminLogin.response.status, 200);
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
      email: "student@college.edu.in",
      phone: "9876543210",
    },
  });
  assert.equal(productionOtp.response.status, 503);
  assert.equal(productionOtp.data.demoOtp, undefined);

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
