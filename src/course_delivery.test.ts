import { strict as assert } from "node:assert";
import { evaluateDeadline } from "./course_delivery.js";

const result = evaluateDeadline({ learnerId: "l1", course: "Checkout basics", dueDate: "2025-01-17", completedLessons: 2, totalLessons: 5 }, new Date("2025-01-15"));
assert.equal(result.status, "due-soon");
assert.equal(result.remainingLessons, 3);
console.log("deadline decision test passed");
