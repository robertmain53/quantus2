# Pilot Phase Checklist (JSON #10-19)

**Objective**: Process 10 new calculator submissions through the automated validation + cosmetics fixing pipeline, with 100% manual review to verify infrastructure works before scaling.

---

## Phase Overview

- **Submissions to Process**: JSON #10-19 (10 files)
- **Automation Applied**: Validator + Auto-Fixer
- **Manual Review**: 100% (all 10 files)
- **Success Criteria**: 0 issues found in manual review
- **Timeline**: 2-3 days
- **Next Step**: If successful, proceed to Phase 2 (JSON #20-49 with 50% sampling)

---

## For Each Submission

### 1️⃣ Receive JSON Submission

- [ ] File received: `data/configs/json-#X-name.json`
- [ ] File is readable and not corrupted
- [ ] File size is reasonable (~5-15 KB)

### 2️⃣ Run Validation

```bash
CONFIG="data/configs/json-#X-name.json"
node scripts/validate-json-units.js --config "$CONFIG" --verbose
```

- [ ] Validation passes (exit code 0)
- [ ] No critical issues reported
- [ ] All unit IDs found in lib/conversions.ts
- [ ] Unit kinds match (or ingredient converter detected)

**If validation fails**:
- [ ] Return to user with specific error message
- [ ] Skip to manual review only (don't apply auto-fixes to invalid JSON)
- [ ] Document failure reason

### 3️⃣ Preview Cosmetics Fixes

```bash
node scripts/fix-json-cosmetics.js --config "$CONFIG" --dry-run --verbose
```

- [ ] Review what will be fixed
- [ ] Note any Markdown URLs that will be converted
- [ ] Verify fixes look correct

**If no fixes needed**:
- [ ] File is already clean
- [ ] Skip to manual review

### 4️⃣ Apply Fixes (If Needed)

```bash
node scripts/fix-json-cosmetics.js --config "$CONFIG" --in-place
```

- [ ] File modified successfully
- [ ] No errors during write operation

### 5️⃣ Re-Validate

```bash
node scripts/validate-json-units.js --config "$CONFIG"
```

- [ ] Validation still passes after fixes (exit code 0)
- [ ] No regressions introduced
- [ ] JSON remains valid

**If validation fails after fixes**:
- [ ] 🚨 CRITICAL: Auto-fixer caused regression
- [ ] Restore original file from backup
- [ ] Document issue
- [ ] Alert for infrastructure investigation

### 6️⃣ Manual Review (Content Quality)

Review the fixed JSON for content quality:

**Metadata** (3 min)
- [ ] Title is clear, descriptive, and SEO-friendly
- [ ] Description accurately summarizes the tool
- [ ] No placeholder text or Lorem Ipsum
- [ ] Title is appropriate length (50-60 chars ideal)

**Logic** (2 min)
- [ ] Conversion type is correct for tool purpose
- [ ] Unit IDs make sense for the tool
- [ ] Order is correct (from_unit → to_unit)

**Introduction** (3 min)
- [ ] Introduces the tool clearly
- [ ] Explains use case
- [ ] Mentions accuracy/assumptions
- [ ] Tone is professional and accessible

**Methodology** (5 min)
- [ ] Explains the conversion accurately
- [ ] Includes formula or explanation
- [ ] References authoritative sources
- [ ] Addresses edge cases or assumptions
- [ ] Suitable for the target audience (home user, lab, professional)

**Examples** (3 min)
- [ ] Examples are realistic and helpful
- [ ] Math is correct
- [ ] Demonstrates typical use cases
- [ ] At least 2-3 examples

**FAQs** (5 min)
- [ ] Questions address real user concerns
- [ ] Answers are clear and complete
- [ ] Covers common mistakes or edge cases
- [ ] 5+ FAQs present
- [ ] No unanswered questions

**Citations** (3 min)
- [ ] URLs are plain HTTPS (not Markdown format)
- [ ] Sources are authoritative (.gov, .edu, academic journals)
- [ ] All URLs are accessible (spot-check 2-3)
- [ ] Citations are relevant to the conversion
- [ ] 3+ citations present

**Links** (2 min)
- [ ] Internal links follow /conversions/category/ pattern
- [ ] Internal links point to valid categories
- [ ] External links (if any) are relevant

**Summary/Glossary** (2 min)
- [ ] Summary recaps key points
- [ ] Glossary (if present) defines technical terms
- [ ] No repetition with introduction

**Overall Quality** (3 min)
- [ ] Content is accurate and well-researched
- [ ] No obvious typos or grammar errors
- [ ] Consistent tone throughout
- [ ] Appropriate depth for audience
- [ ] No Lorem Ipsum or test content

### 7️⃣ Document Results

**If all manual review items pass** ✅:
```
JSON #X: ✅ APPROVED
- Automation: PASS
- Manual Review: PASS
- Ready for CSV import
```

**If manual review finds issues** ⚠️:
```
JSON #X: ⚠️  ISSUES FOUND
Issues:
1. [Issue description]
2. [Issue description]

Action: Return to user with feedback
```

---

## Batch Processing Template

### Process All 10 at Once

```bash
#!/bin/bash

FAILED=0
PASSED=0
REVIEWED=0

for JSON_NUM in {10..19}; do
  CONFIG="data/configs/json-$JSON_NUM-*.json"
  echo "===== Processing JSON #$JSON_NUM ====="

  # Validate
  if ! node scripts/validate-json-units.js --config $CONFIG --verbose; then
    echo "❌ Validation failed"
    ((FAILED++))
    continue
  fi

  # Fix cosmetics
  node scripts/fix-json-cosmetics.js --config $CONFIG --dry-run && \
  node scripts/fix-json-cosmetics.js --config $CONFIG --in-place

  # Re-validate
  if ! node scripts/validate-json-units.js --config $CONFIG; then
    echo "❌ Validation failed after fixes"
    ((FAILED++))
    continue
  fi

  echo "✅ Automated checks passed - ready for manual review"
  ((PASSED++))
  echo
done

echo "=========================================="
echo "Summary: $PASSED passed, $FAILED failed"
```

---

## Key Metrics to Track

| Metric | Target | Notes |
|--------|--------|-------|
| Validation Pass Rate | 100% | Should pass 10/10 |
| Auto-Fixer Success | 100% | No regressions |
| Manual Review Time | ~20 min each | 200 min total |
| Issues Found in Manual Review | 0 | Indicates infrastructure working |
| Content Quality Issues | 0-2 | Expected (content not automation issue) |

---

## Success Criteria for Proceeding to Phase 2

✅ All 10 files pass automated validation
✅ All 10 files pass automated cosmetics fixing
✅ All 10 files re-validate after fixes
✅ Manual review finds 0 structural/automation issues
✅ Content quality is acceptable (typos, factual errors acceptable, will fix)

**If ANY of above fail**:
→ Stop and investigate infrastructure issue
→ Review logs
→ Adjust automation if needed
→ Re-test on existing 9 JSONs
→ Restart pilot with first 3 submissions again

---

## Common Findings (Expected)

### OK to Find During Manual Review

- ✅ Minor typos or grammar errors (expected from AI generation)
- ✅ Controversial methodology explanation (user preference)
- ✅ Missing related link (can add later)
- ✅ Citation accessibility issues (can verify later)

### Should NOT Find (Infrastructure Issue)

- ❌ Markdown URLs in citations (auto-fixer should catch)
- ❌ Missing required fields (validator should catch)
- ❌ Invalid unit IDs (validator should catch)
- ❌ Malformed JSON (validator should catch)

**If you find any of the above, it indicates automation failed and needs investigation.**

---

## Troubleshooting During Pilot

### Issue: Validation Fails

**Check**:
1. Is the JSON syntactically valid? (Try `node -c` to parse)
2. Are unit IDs spelled correctly?
3. Does the converter type match the file purpose?

**Fix**:
- Return file to user for correction
- Do not attempt auto-fixes on invalid JSON

### Issue: Auto-Fixer Doesn't Fix Markdown URLs

**Check**:
1. Are URLs really in Markdown format `[url](url)`?
2. Run with `--dry-run --verbose` to see detection

**Example Valid Detection**:
```
✓ Fixed Markdown URL in citations[0]:
  Before: [https://example.com](https://example.com)
  After:  https://example.com
```

### Issue: Re-validation Fails After Fixes

**This is Critical** 🚨

**Steps**:
1. Restore original file
2. Run auto-fixer again in isolation
3. Check what it changed
4. Run validator in verbose mode
5. Document the exact failure
6. Pause pilot and investigate infrastructure

### Issue: Manual Review Takes Too Long

**Tips**:
- Use the checklist items (each has time estimate)
- Skim introduction/methodology first
- Focus on accuracy of conversions
- 20 minutes per file is reasonable pace

---

## Daily Standup

### Each Day During Pilot

```
Date: [date]

COMPLETED:
- JSON #X: ✅ PASS (OR ❌ ISSUES)
- JSON #Y: ✅ PASS (OR ❌ ISSUES)

IN PROGRESS:
- JSON #Z: Validation stage

BLOCKERS:
- None (or describe if any)

TOMORROW:
- Process JSON #A, #B, #C
```

---

## Post-Pilot Decision Tree

### After All 10 Are Processed

**❓ Did all 10 pass validation?**
- YES → Continue
- NO → Investigate failures, adjust infrastructure, restart pilot

**❓ Did all 10 pass auto-fixing?**
- YES → Continue
- NO → Investigate failures, adjust auto-fixer logic, restart pilot

**❓ Did all 10 re-validate successfully?**
- YES → Continue
- NO → CRITICAL: Stop, investigate, fix infrastructure

**❓ Did manual review find 0 automation issues?**
- YES → ✅ **PROCEED TO PHASE 2**
- NO → Investigate automation issue, fix, restart pilot on first 3

**❓ Was content quality acceptable?**
- YES → ✅ **PROCEED TO PHASE 2**
- NO → Document content issues, gather feedback, continue to Phase 2
  - Note: Content quality is user responsibility, not automation issue

---

## Phase 2 Decision

**If Pilot Succeeds** (all checkboxes above = YES):

```
PILOT PHASE RESULT: ✅ SUCCESS

Status: Ready for Phase 2 (JSON #20-49)
Plan: Same automation + 50% random manual review
Timeline: 5 days
Confidence Level: HIGH
```

**If Pilot Finds Infrastructure Issues**:

```
PILOT PHASE RESULT: ⚠️  ISSUES FOUND

Issues:
1. [Issue description]

Actions:
1. [Fix action]
2. [Fix action]
3. Re-test on existing 9 JSONs
4. Restart pilot on first 5 submissions
```

---

## Files to Keep Safe

During pilot, preserve:
- `/home/uc/Projects/quantus2/scripts/validate-json-units.js` (backup before changes)
- `/home/uc/Projects/quantus2/scripts/fix-json-cosmetics.js` (backup before changes)
- Original JSON files (don't delete even after fixing)

---

## Handoff to Phase 2

**Once pilot succeeds**, document:
- [ ] Number of files processed: 10
- [ ] Number passed: ___ of 10
- [ ] Average automation time per file: ___ min
- [ ] Average manual review time per file: ___ min
- [ ] Total time invested: ___ hours
- [ ] Issues found: ___
- [ ] Confidence in automation: HIGH / MEDIUM / LOW
- [ ] Recommended sampling rate for Phase 2: 50%

---

**Status**: Ready to Begin Pilot Phase

**Next Action**: Receive JSON #10-19 submissions and begin processing

---

**Created**: November 28, 2025
**Pilot Target**: JSON #10-19 (10 submissions)
**Success Criteria**: 0 automation issues found in manual review

