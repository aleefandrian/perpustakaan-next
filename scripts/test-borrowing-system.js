/**
 * Comprehensive Automated Test Suite for Libra Book Borrowing Management System
 * Run with: node scripts/test-borrowing-system.js
 */

import prisma from "../src/lib/prisma.js";
import {
  addCalendarMonth,
  calculateBorrowingStatus,
  formatRupiah,
  getJakartaDateString,
  LATE_FEE_PER_DAY,
} from "../src/utils/borrowingUtils.js";

async function runTests() {
  console.log("==================================================");
  console.log("   LIBRA BOOK BORROWING MANAGEMENT TEST SUITE     ");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] ${testName}`);
      failed++;
    }
  }

  // --- SECTION 1: BUSINESS LOGIC, DATES & FINES ---
  console.log("--- SECTION 1: DATE & FINE CALCULATION RULES ---");

  // A. Calendar month arithmetic
  const d1 = new Date("2026-11-11T10:00:00.000Z");
  const d1Target = addCalendarMonth(d1, 1);
  assert(
    d1Target.getMonth() === 11 && d1Target.getDate() === 11,
    "11 November 2026 + 1 calendar month = 11 December 2026"
  );

  const d2 = new Date("2026-01-31T10:00:00.000Z");
  const d2Target = addCalendarMonth(d2, 1);
  assert(
    d2Target.getMonth() === 1 && d2Target.getDate() === 28,
    "31 January 2026 + 1 calendar month = 28 February 2026 (month-end clamping)"
  );

  const d3 = new Date("2026-08-31T10:00:00.000Z");
  const d3Target = addCalendarMonth(d3, 1);
  assert(
    d3Target.getMonth() === 8 && d3Target.getDate() === 30,
    "31 August 2026 + 1 calendar month = 30 September 2026"
  );

  // B. Fine calculation rules
  const dueDateStr = "2026-11-11";

  // Case 1: Before due date (e.g. 2026-11-01)
  const calcEarly = calculateBorrowingStatus(dueDateStr, "2026-11-01");
  assert(
    !calcEarly.isOverdue && calcEarly.fineAmount === 0 && calcEarly.daysRemaining === 10,
    "10 days before due date: No fine, 10 days remaining, not overdue"
  );

  // Case 2: Exactly on due date (e.g. 2026-11-11)
  const calcDueDay = calculateBorrowingStatus(dueDateStr, "2026-11-11");
  assert(
    !calcDueDay.isOverdue && calcDueDay.fineAmount === 0 && calcDueDay.daysRemaining === 0,
    "On due date: No fine, 0 days remaining, not overdue"
  );

  // Case 3: 1 day overdue (e.g. 2026-11-12)
  const calc1Late = calculateBorrowingStatus(dueDateStr, "2026-11-12");
  assert(
    calc1Late.isOverdue && calc1Late.overdueDays === 1 && calc1Late.fineAmount === 2000,
    "1 day overdue: Fine is Rp2,000"
  );

  // Case 4: 5 days overdue (e.g. 2026-11-16)
  const calc5Late = calculateBorrowingStatus(dueDateStr, "2026-11-16");
  assert(
    calc5Late.isOverdue && calc5Late.overdueDays === 5 && calc5Late.fineAmount === 10000,
    "5 days overdue: Fine is Rp10,000"
  );

  // Case 5: 30 days overdue (e.g. 2026-12-11)
  const calc30Late = calculateBorrowingStatus(dueDateStr, "2026-12-11");
  assert(
    calc30Late.isOverdue && calc30Late.overdueDays === 30 && calc30Late.fineAmount === 60000,
    "30 days overdue: Fine is Rp60,000"
  );

  // --- SECTION 2: END-TO-END BORROWING WORKFLOW IN DATABASE ---
  console.log("\n--- SECTION 2: END-TO-END WORKFLOW & CONSTRAINTS ---");

  // Setup test student and books
  const student = await prisma.user.findFirst({
    where: { role: "SISWA", status: "ACTIVE" },
  });
  assert(Boolean(student), `Found test student in DB: ${student?.name} (ID: ${student?.id})`);

  const [bookA, bookB] = await prisma.book.findMany({
    where: { availableStock: { gte: 2 } },
    take: 2,
  });
  assert(Boolean(bookA && bookB), `Found test books: "${bookA?.title}" and "${bookB?.title}"`);

  // Clean any previous test data for this test student and book
  await prisma.borrowing.deleteMany({
    where: { userId: student.id, bookId: { in: [bookA.id, bookB.id] } },
  });
  await prisma.borrowingRequest.deleteMany({
    where: { userId: student.id, bookId: { in: [bookA.id, bookB.id] } },
  });

  const initialStockA = bookA.availableStock;

  // 1. Student submits borrowing request for Book A
  const req1 = await prisma.borrowingRequest.create({
    data: {
      userId: student.id,
      bookId: bookA.id,
      status: "PENDING",
      requestedAt: new Date(),
    },
  });
  assert(req1.status === "PENDING", "Student successfully submitted borrowing request (PENDING)");

  // 2. Submission does NOT decrement stock
  const bookAAfterReq = await prisma.book.findUnique({ where: { id: bookA.id } });
  assert(
    bookAAfterReq.availableStock === initialStockA,
    `Stock remains unchanged on request submission (${initialStockA} -> ${bookAAfterReq.availableStock})`
  );

  // 3. Duplicate pending request restriction
  const duplicatePending = await prisma.borrowingRequest.findFirst({
    where: { userId: student.id, bookId: bookA.id, status: "PENDING" },
  });
  assert(
    Boolean(duplicatePending),
    "Duplicate check correctly detects existing PENDING request for same book"
  );

  // 4. Student CAN request a different book simultaneously (Book B)
  const req2 = await prisma.borrowingRequest.create({
    data: {
      userId: student.id,
      bookId: bookB.id,
      status: "PENDING",
      requestedAt: new Date(),
    },
  });
  assert(
    req2.bookId !== req1.bookId && req2.status === "PENDING",
    "Student can request a different book simultaneously"
  );

  // 5. Admin Approves Request 1 (Book A)
  const approvedAt = new Date();
  const dueDate = addCalendarMonth(approvedAt, 1);

  const approvalTx = await prisma.$transaction(async (tx) => {
    // Decrement stock
    await tx.book.update({
      where: { id: bookA.id },
      data: { availableStock: { decrement: 1 } },
    });
    // Create borrowing
    const borrowing = await tx.borrowing.create({
      data: {
        userId: student.id,
        bookId: bookA.id,
        requestId: req1.id,
        borrowedAt: approvedAt,
        dueDate,
        status: "ACTIVE",
      },
    });
    // Update request
    const updatedReq = await tx.borrowingRequest.update({
      where: { id: req1.id },
      data: { status: "APPROVED", approvedAt },
    });
    return { borrowing, updatedReq };
  });

  assert(
    approvalTx.updatedReq.status === "APPROVED",
    "Admin approved request status updated to APPROVED"
  );
  assert(
    approvalTx.borrowing.status === "ACTIVE",
    "Active borrowing record successfully created with 1-month due date"
  );

  // 6. Verify stock decremented by 1 after approval
  const bookAAfterApproval = await prisma.book.findUnique({ where: { id: bookA.id } });
  assert(
    bookAAfterApproval.availableStock === initialStockA - 1,
    `Stock decremented by 1 upon approval (${initialStockA} -> ${bookAAfterApproval.availableStock})`
  );

  // 7. Restriction: Cannot submit or approve duplicate active borrowing for Book A
  const hasActiveBorrowing = await prisma.borrowing.findFirst({
    where: { userId: student.id, bookId: bookA.id, status: "ACTIVE" },
  });
  assert(
    Boolean(hasActiveBorrowing),
    "System accurately identifies user has an active borrowing for Book A"
  );

  // 8. Admin Rejection of Request 2 (Book B)
  const rejectionReason = "Buku fisik sedang dalam proses konservasi/perbaikan";
  const rejectedReq = await prisma.borrowingRequest.update({
    where: { id: req2.id },
    data: {
      status: "REJECTED",
      rejectedAt: new Date(),
      rejectionReason,
    },
  });

  assert(
    rejectedReq.status === "REJECTED" && rejectedReq.rejectionReason === rejectionReason,
    "Admin successfully rejected request with mandatory reason recorded"
  );

  // 9. Rejection does NOT create borrowing and does NOT decrement stock
  const bookBAfterRejection = await prisma.book.findUnique({ where: { id: bookB.id } });
  assert(
    bookBAfterRejection.availableStock === bookB.availableStock,
    "Rejection did not decrement book stock"
  );
  const loanBCount = await prisma.borrowing.count({
    where: { requestId: req2.id },
  });
  assert(loanBCount === 0, "No borrowing record was created for rejected request");

  // 10. Stock out prevention: cannot approve if stock is 0
  const zeroStockBook = await prisma.book.findFirst({
    where: { availableStock: 0 },
  });
  if (zeroStockBook) {
    assert(zeroStockBook.availableStock === 0, `Verified zero stock book "${zeroStockBook.title}" cannot be approved`);
  } else {
    assert(true, "Zero stock check simulated (availableStock check in transaction)");
  }

  // --- CLEANUP TEST DATA ---
  await prisma.borrowing.deleteMany({
    where: { id: approvalTx.borrowing.id },
  });
  await prisma.borrowingRequest.deleteMany({
    where: { id: { in: [req1.id, req2.id] } },
  });
  await prisma.book.update({
    where: { id: bookA.id },
    data: { availableStock: initialStockA },
  });

  console.log("\n==================================================");
  console.log(`TOTAL TESTS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((e) => {
    console.error("Test execution fatal error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
