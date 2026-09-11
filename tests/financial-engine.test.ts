// tests/financial-engine.test.ts
import Decimal from "decimal.js";
import {
  processDeposit,
  processWithdraw,
  processTransfer,
  processAdminAdjustment,
} from "../server/services/transaction.service";
import { getFallbackState, withFallbackTx } from "../server/db/fallback-engine";
import { updateAccountStatus } from "../server/services/account.service";

async function runTests() {
  console.log("==================================================");
  console.log("  RUNNING APEX BANK FINANCIAL ENGINE TESTS        ");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  const state = getFallbackState();

  // Setup test account
  const testAcc1 = state.bank_accounts[0]; // Somchai
  const testAcc2 = state.bank_accounts[1]; // Manee

  console.log(`Initial balances: Acc1 (${testAcc1.account_number}) = ฿${testAcc1.balance}, Acc2 (${testAcc2.account_number}) = ฿${testAcc2.balance}`);

  // TEST 1: Deposit adds funds correctly
  try {
    const accBefore = getFallbackState().bank_accounts.find((a) => a.id === testAcc1.id)!;
    const beforeBal = new Decimal(accBefore.balance);
    const depositAmount = 5000.00;
    const tx = await processDeposit({
      accountId: testAcc1.id,
      amount: depositAmount,
      description: "Test deposit",
      actorId: 1,
    });

    const accAfter = getFallbackState().bank_accounts.find((a) => a.id === testAcc1.id)!;
    const afterBal = new Decimal(accAfter.balance);
    assert(
      afterBal.minus(beforeBal).equals(new Decimal(depositAmount)),
      "Deposit accurately increments account balance"
    );
    assert(tx.type === "DEPOSIT" && tx.status === "COMPLETED", "Deposit transaction is marked COMPLETED");
  } catch (err: any) {
    assert(false, `Deposit test error: ${err.message}`);
  }

  // TEST 2: Withdraw reduces funds
  try {
    const accBefore = getFallbackState().bank_accounts.find((a) => a.id === testAcc1.id)!;
    const beforeBal = new Decimal(accBefore.balance);
    const withdrawAmount = 2000.00;
    const tx = await processWithdraw({
      accountId: testAcc1.id,
      amount: withdrawAmount,
      description: "Test withdrawal",
      actorId: 2,
    });

    const accAfter = getFallbackState().bank_accounts.find((a) => a.id === testAcc1.id)!;
    const afterBal = new Decimal(accAfter.balance);
    assert(
      beforeBal.minus(afterBal).equals(new Decimal(withdrawAmount)),
      "Withdrawal accurately decrements account balance"
    );
    assert(tx.type === "WITHDRAW", "Withdraw transaction record created");
  } catch (err: any) {
    assert(false, `Withdraw test error: ${err.message}`);
  }

  // TEST 3: Insufficient balance rejection
  try {
    const hugeAmount = 999_999_999.00;
    let failedAsExpected = false;
    try {
      await processWithdraw({
        accountId: testAcc1.id,
        amount: hugeAmount,
        description: "Attempt overdraw",
        actorId: 2,
      });
    } catch (e: any) {
      if (e.message.includes("INSUFFICIENT_FUNDS")) {
        failedAsExpected = true;
      }
    }
    assert(failedAsExpected, "Overdraw attempt correctly rejected with INSUFFICIENT_FUNDS");
  } catch (err: any) {
    assert(false, `Overdraw test unexpected error: ${err.message}`);
  }

  // TEST 4: Atomic Transfer between accounts
  try {
    const acc1Before = getFallbackState().bank_accounts.find((a) => a.id === testAcc1.id)!;
    const acc2Before = getFallbackState().bank_accounts.find((a) => a.id === testAcc2.id)!;
    const senderBefore = new Decimal(acc1Before.balance);
    const receiverBefore = new Decimal(acc2Before.balance);
    const transferAmount = 1500.00;

    const tx = await processTransfer({
      fromAccountId: testAcc1.id,
      toAccountNumber: testAcc2.account_number,
      amount: transferAmount,
      description: "Rent share",
      actorId: 2,
    });

    const acc1After = getFallbackState().bank_accounts.find((a) => a.id === testAcc1.id)!;
    const acc2After = getFallbackState().bank_accounts.find((a) => a.id === testAcc2.id)!;
    const senderAfter = new Decimal(acc1After.balance);
    const receiverAfter = new Decimal(acc2After.balance);

    assert(
      senderBefore.minus(senderAfter).equals(new Decimal(transferAmount)) &&
        receiverAfter.minus(receiverBefore).equals(new Decimal(transferAmount)),
      "Transfer atomically debits sender and credits receiver in exact amounts"
    );
    assert(tx.type === "TRANSFER" && tx.status === "COMPLETED", "Transfer record created with COMPLETED status");
  } catch (err: any) {
    assert(false, `Transfer test error: ${err.message}`);
  }

  // TEST 5: Idempotency Protection
  try {
    const key = `idempo-test-${Date.now()}`;
    const accBefore = getFallbackState().bank_accounts.find((a) => a.id === testAcc1.id)!;
    const amount = 500.00;

    // First request
    const tx1 = await processTransfer({
      fromAccountId: testAcc1.id,
      toAccountNumber: testAcc2.account_number,
      amount,
      description: "Idempotent payment",
      actorId: 2,
      idempotencyKey: key,
    });

    const balAfterFirst = new Decimal(
      getFallbackState().bank_accounts.find((a) => a.id === testAcc1.id)!.balance
    );

    // Duplicate second request with same key
    const tx2 = await processTransfer({
      fromAccountId: testAcc1.id,
      toAccountNumber: testAcc2.account_number,
      amount,
      description: "Idempotent payment",
      actorId: 2,
      idempotencyKey: key,
    });

    const balAfterSecond = new Decimal(
      getFallbackState().bank_accounts.find((a) => a.id === testAcc1.id)!.balance
    );

    assert(
      tx1.id === tx2.id && balAfterFirst.equals(balAfterSecond),
      "Idempotency prevents double spending when identical request key is resent"
    );
  } catch (err: any) {
    assert(false, `Idempotency test error: ${err.message}`);
  }

  // TEST 6: Suspended account rejection
  try {
    // Suspend testAcc2
    await updateAccountStatus(testAcc2.id, "SUSPENDED", "Security review test", 1);

    let transferBlocked = false;
    try {
      await processTransfer({
        fromAccountId: testAcc1.id,
        toAccountNumber: testAcc2.account_number,
        amount: 100,
        actorId: 2,
      });
    } catch (e: any) {
      if (e.message.includes("RECIPIENT_INACTIVE")) {
        transferBlocked = true;
      }
    }

    assert(transferBlocked, "Transactions to SUSPENDED accounts are strictly rejected");

    // Reactivate
    await updateAccountStatus(testAcc2.id, "ACTIVE", "Restored active status", 1);
  } catch (err: any) {
    assert(false, `Suspended account test error: ${err.message}`);
  }

  // TEST 7: Admin Adjustment with Reason
  try {
    const accBefore = getFallbackState().bank_accounts.find((a) => a.id === testAcc1.id)!;
    const beforeBal = new Decimal(accBefore.balance);
    const adjustAmount = 250.00;
    const tx = await processAdminAdjustment({
      accountId: testAcc1.id,
      type: "CREDIT",
      amount: adjustAmount,
      reason: "Compensation for maintenance disruption",
      actorId: 1,
    });

    const accAfter = getFallbackState().bank_accounts.find((a) => a.id === testAcc1.id)!;
    const afterBal = new Decimal(accAfter.balance);
    assert(
      afterBal.minus(beforeBal).equals(new Decimal(adjustAmount)),
      "Admin adjustment correctly credits balance with compulsory reason"
    );
    assert(tx.type === "ADJUSTMENT", "Admin adjustment logged as ADJUSTMENT");
  } catch (err: any) {
    assert(false, `Admin adjustment test error: ${err.message}`);
  }

  console.log("==================================================");
  console.log(`Test results: ${passed} passed, ${failed} failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
