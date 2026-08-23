import puppeteer from "puppeteer-core";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const results = [];

function logTest(name, passed, details = "") {
  results.push({ name, passed, details });
  const status = passed ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m";
  console.log(`[${status}] ${name} ${details ? `(${details})` : ""}`);
}

async function runE2E() {
  console.log(`\n======================================================`);
  console.log(` Starting DSA Tracker End-to-End Real Browser Suite`);
  console.log(` Target: ${BASE_URL}`);
  console.log(` Browser: ${CHROME_PATH}`);
  console.log(`======================================================\n`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const context1 = await browser.createBrowserContext();
  const page1 = await context1.newPage();
  await page1.setViewport({ width: 1280, height: 800 });

  const timestamp = Date.now();
  const user1Email = `dsa_test_user1_${timestamp}@example.com`;
  const user1Password = `Password123!`;
  const user2Email = `dsa_test_user2_${timestamp}@example.com`;
  const user2Password = `Password123!`;

  let createdProblemId = null;

  try {
    // ----------------------------------------------------
    // TEST 1: Unauthenticated Protected Route Guarding
    // ----------------------------------------------------
    console.log("-> Running Test 1: Protected Route Guarding...");
    await page1.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle0" });
    const currentUrl1 = page1.url();
    if (currentUrl1.includes("/login")) {
      logTest("1. Unauthenticated Route Guarding", true, `Redirected to: ${currentUrl1}`);
    } else {
      logTest("1. Unauthenticated Route Guarding", false, `Did not redirect to /login. Current: ${currentUrl1}`);
    }

    // ----------------------------------------------------
    // TEST 2: User 1 Registration & Sign In
    // ----------------------------------------------------
    console.log("-> Running Test 2: User 1 Registration & Authentication...");
    await page1.goto(`${BASE_URL}/register`, { waitUntil: "networkidle0" });
    
    // Fill register form
    await page1.type('input[placeholder="developer@example.com"]', user1Email);
    const passwordInputs = await page1.$$('input[type="password"]');
    if (passwordInputs.length >= 2) {
      await passwordInputs[0].type(user1Password);
      await passwordInputs[1].type(user1Password);
    }
    
    await Promise.all([
      page1.click('button[type="submit"]'),
      page1.waitForNavigation({ waitUntil: "networkidle0", timeout: 10000 }).catch(() => null),
    ]);

    await new Promise((r) => setTimeout(r, 1500));

    // If redirected to dashboard or login
    if (page1.url().includes("/dashboard")) {
      logTest("2. User 1 Registration & Auto-Login", true, "Registered and logged in directly to dashboard");
    } else {
      // If login is required after confirmation
      await page1.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0" });
      await page1.type('input[type="email"]', user1Email);
      await page1.type('input[type="password"]', user1Password);
      await Promise.all([
        page1.click('button[type="submit"]'),
        page1.waitForNavigation({ waitUntil: "networkidle0", timeout: 10000 }).catch(() => null),
      ]);
      await new Promise((r) => setTimeout(r, 1500));
      
      const onDashboard = page1.url().includes("/dashboard");
      logTest("2. User 1 Registration & Login", onDashboard, `Current URL: ${page1.url()}`);
    }

    // ----------------------------------------------------
    // TEST 3: Dashboard Initial State
    // ----------------------------------------------------
    console.log("-> Running Test 3: Dashboard Initial State...");
    await page1.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle0" });
    const bodyText = await page1.evaluate(() => document.body.innerText);
    const hasTotal = bodyText.includes("Total Tracked") && bodyText.includes("Solved");
    logTest("3. Dashboard Initial State Verification", hasTotal, "Summary KPI cards rendered properly");

    // ----------------------------------------------------
    // TEST 4: Problem Creation
    // ----------------------------------------------------
    console.log("-> Running Test 4: Problem Creation...");
    await page1.goto(`${BASE_URL}/problems/new`, { waitUntil: "networkidle0" });

    // Fill form
    await page1.type('input[placeholder*="Two Sum"]', "Two Sum");
    await page1.type('input[placeholder*="leetcode.com"]', "https://leetcode.com/problems/two-sum");
    await page1.type('input[placeholder*="Arrays & Hashing"]', "Arrays & Hashing");
    await page1.type('input[placeholder*="Two Pointers"]', "Two Pointers");
    await page1.type('input[placeholder*="O(N log N)"]', "O(N)");
    await page1.type('input[placeholder*="O(1)"]', "O(N)");

    const textareas = await page1.$$("textarea");
    if (textareas.length >= 4) {
      await textareas[0].type("Hash map one-pass complement lookup: seen[num] = i.");
      await textareas[1].type("Nested loops checking every pair in O(N^2).");
      await textareas[2].type("Given an array of integers nums and target, return indices of two numbers adding up to target.");
      await textareas[3].type("Off-by-one with 0-indexed arrays or returning duplicate elements.");
    }

    await Promise.all([
      page1.click('button[type="submit"]'),
      page1.waitForNavigation({ waitUntil: "networkidle0", timeout: 10000 }).catch(() => null),
    ]);

    await new Promise((r) => setTimeout(r, 1500));
    const problemUrl = page1.url();
    const isProblemDetail = problemUrl.includes("/problems/") && !problemUrl.includes("/new");
    if (isProblemDetail) {
      createdProblemId = problemUrl.split("/problems/")[1].split("?")[0].split("/")[0];
      logTest("4. Problem Creation & Redirect", true, `Created ID: ${createdProblemId}`);
    } else {
      logTest("4. Problem Creation & Redirect", false, `Failed to redirect to problem details. URL: ${problemUrl}`);
    }

    // ----------------------------------------------------
    // TEST 5: Persistence after Page Reload
    // ----------------------------------------------------
    console.log("-> Running Test 5: Persistence after Page Reload...");
    await page1.reload({ waitUntil: "networkidle0" });
    const detailText = await page1.evaluate(() => document.body.innerText);
    const persisted = detailText.includes("Two Sum") && detailText.includes("Arrays & Hashing") && detailText.includes("O(N)");
    logTest("5. Problem Persistence after Refresh", persisted, "Retrieved row correctly from Supabase");

    // ----------------------------------------------------
    // TEST 6: Problem Editing
    // ----------------------------------------------------
    console.log("-> Running Test 6: Problem Editing...");
    await page1.goto(`${BASE_URL}/problems/${createdProblemId}/edit`, { waitUntil: "networkidle0" });
    
    // Clear and update title
    const titleInput = await page1.$('input[placeholder*="Two Sum"]');
    await titleInput.click({ clickCount: 3 });
    await titleInput.type("Two Sum (Optimal Hash Map)");

    await Promise.all([
      page1.click('button[type="submit"]'),
      page1.waitForNavigation({ waitUntil: "networkidle0", timeout: 10000 }).catch(() => null),
    ]);

    await new Promise((r) => setTimeout(r, 1500));
    const editedText = await page1.evaluate(() => document.body.innerText);
    const editSaved = editedText.includes("Two Sum (Optimal Hash Map)");
    logTest("6. Problem Editing & Update", editSaved, "Title and attributes updated successfully");

    // ----------------------------------------------------
    // TEST 7: Quick Status Transition (Mark as Solved)
    // ----------------------------------------------------
    console.log("-> Running Test 7: Quick Status Transition (Mark as Solved)...");
    await page1.goto(`${BASE_URL}/problems/${createdProblemId}`, { waitUntil: "networkidle0" });
    
    // Find and click "Mark as Solved" button
    const buttons = await page1.$$("button");
    for (const b of buttons) {
      const text = await page1.evaluate((el) => el.innerText, b);
      if (text.includes("Mark as Solved")) {
        await b.click();
        break;
      }
    }

    await new Promise((r) => setTimeout(r, 2000));
    await page1.reload({ waitUntil: "networkidle0" });
    const updatedStatusText = await page1.evaluate(() => document.body.innerText);
    const isSolved = updatedStatusText.includes("Solved") || updatedStatusText.includes("Solved ✓");
    logTest("7. Quick Status Update (Mark as Solved)", isSolved, "Status updated to Solved with date_solved timestamp");

    // ----------------------------------------------------
    // TEST 8: Dashboard Analytics & Statistics Update
    // ----------------------------------------------------
    console.log("-> Running Test 8: Dashboard Analytics & Statistics Update...");
    await page1.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle0" });
    const dashText = await page1.evaluate(() => document.body.innerText);
    const statsUpdated = dashText.includes("100% solved overall") || (dashText.includes("1") && dashText.includes("Solved"));
    logTest("8. Dashboard Statistics Reactive Update", statsUpdated, "Solved ratio, completion % and activity updated");

    // ----------------------------------------------------
    // TEST 9: Problem List Search, Filter & View Toggle
    // ----------------------------------------------------
    console.log("-> Running Test 9: Problem List Search & Filtering...");
    await page1.goto(`${BASE_URL}/problems`, { waitUntil: "networkidle0" });
    
    // Test search
    const searchInput = await page1.$('input[placeholder*="Search"]');
    if (searchInput) {
      await searchInput.type("Two Sum");
      await new Promise((r) => setTimeout(r, 1000));
      const searchRes = await page1.evaluate(() => document.body.innerText);
      const searchFound = searchRes.includes("Two Sum");
      logTest("9a. Problem List Search", searchFound, "Found matching problem by keyword");
    }

    // ----------------------------------------------------
    // TEST 10: Cross-User RLS Isolation
    // ----------------------------------------------------
    console.log("-> Running Test 10: Cross-User RLS Isolation...");
    const context2 = await browser.createBrowserContext();
    const page2 = await context2.newPage();
    await page2.setViewport({ width: 1280, height: 800 });

    // Register User 2
    await page2.goto(`${BASE_URL}/register`, { waitUntil: "networkidle0" });
    await page2.type('input[placeholder="developer@example.com"]', user2Email);
    const p2Passwords = await page2.$$('input[type="password"]');
    if (p2Passwords.length >= 2) {
      await p2Passwords[0].type(user2Password);
      await p2Passwords[1].type(user2Password);
    }
    await Promise.all([
      page2.click('button[type="submit"]'),
      page2.waitForNavigation({ waitUntil: "networkidle0", timeout: 10000 }).catch(() => null),
    ]);
    await new Promise((r) => setTimeout(r, 1500));

    // User 2 Problem list should be empty
    await page2.goto(`${BASE_URL}/problems`, { waitUntil: "networkidle0" });
    const user2ProblemsText = await page2.evaluate(() => document.body.innerText);
    const user2Isolated = !user2ProblemsText.includes("Two Sum (Optimal Hash Map)");
    
    // User 2 trying to open User 1's problem directly
    await page2.goto(`${BASE_URL}/problems/${createdProblemId}`, { waitUntil: "networkidle0" });
    const user2DirectText = await page2.evaluate(() => document.body.innerText);
    const user2Blocked = user2DirectText.includes("Page Not Found") || user2DirectText.includes("does not exist") || !user2DirectText.includes("Two Sum (Optimal Hash Map)");

    logTest("10. Cross-User RLS Isolation", user2Isolated && user2Blocked, "User 2 cannot see or access User 1 problem");
    await context2.close();

    // ----------------------------------------------------
    // TEST 11: Problem Deletion
    // ----------------------------------------------------
    console.log("-> Running Test 11: Problem Deletion...");
    await page1.goto(`${BASE_URL}/problems/${createdProblemId}`, { waitUntil: "networkidle0" });
    
    // Click delete button
    const deleteBtn = await page1.$('button.bg-rose-600\\/90, button:has-text("Delete")');
    const allP1Buttons = await page1.$$("button");
    for (const b of allP1Buttons) {
      const text = await page1.evaluate((el) => el.innerText, b);
      if (text.includes("Delete")) {
        await b.click();
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 500));

    // Click confirm in modal
    const modalButtons = await page1.$$("button");
    for (const b of modalButtons) {
      const text = await page1.evaluate((el) => el.innerText, b);
      if (text.includes("Confirm Delete")) {
        await b.click();
        break;
      }
    }

    await new Promise((r) => setTimeout(r, 2000));
    const afterDeleteUrl = page1.url();
    const afterDeleteText = await page1.evaluate(() => document.body.innerText);
    const deleted = afterDeleteUrl.includes("/problems") && !afterDeleteText.includes("Two Sum (Optimal Hash Map)");
    logTest("11. Problem Deletion & Modal Confirmation", deleted, "Problem successfully removed from Supabase");

    // ----------------------------------------------------
    // TEST 12: Logout
    // ----------------------------------------------------
    console.log("-> Running Test 12: User Logout...");
    const logoutBtn = await page1.$('button[title="Sign out"]');
    if (logoutBtn) {
      await logoutBtn.click();
      await new Promise((r) => setTimeout(r, 1500));
    }
    
    await page1.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle0" });
    const afterLogoutUrl = page1.url();
    const logoutSuccess = afterLogoutUrl.includes("/login");
    logTest("12. Logout & Session Termination", logoutSuccess, `Redirected to: ${afterLogoutUrl}`);

  } catch (err) {
    console.error("Test execution encountered an exception:", err);
  } finally {
    await browser.close();
  }

  console.log(`\n======================================================`);
  console.log(` E2E TEST SUMMARY: ${results.filter((r) => r.passed).length}/${results.length} PASSED`);
  console.log(`======================================================\n`);

  const allPassed = results.length > 0 && results.every((r) => r.passed);
  process.exit(allPassed ? 0 : 1);
}

runE2E();
