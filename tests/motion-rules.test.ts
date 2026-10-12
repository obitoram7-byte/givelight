import assert from "node:assert/strict";
import test from "node:test";

import { shouldAdvanceLiveTotal, shouldCelebrateVerifiedDonation } from "../src/lib/motion";

test("verified payments are the only state allowed to trigger celebration and live-total animation", () => {
  assert.equal(shouldCelebrateVerifiedDonation("paid", false), true);
  assert.equal(shouldCelebrateVerifiedDonation("pending_payment", false), false);
  assert.equal(shouldCelebrateVerifiedDonation("paid", true), false);

  assert.equal(shouldAdvanceLiveTotal(200, 240, "paid", false), true);
  assert.equal(shouldAdvanceLiveTotal(200, 240, "pending_payment", false), false);
  assert.equal(shouldAdvanceLiveTotal(200, 240, "paid", true), false);
  assert.equal(shouldAdvanceLiveTotal(200, 200, "paid", false), false);
});
