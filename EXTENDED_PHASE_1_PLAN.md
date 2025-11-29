# Extended Phase 1 Plan: JSON #20-49 (30 Calculators)

**Strategy**: Maximum pre-deployment validation with 100% manual review sampling
**Time Budget**: ~14 hours (~28 minutes per submission × 30)
**Start Date**: November 28, 2025
**Exit Criteria**:
- 30/30 submissions approved (or issues documented)
- All critical errors resolved
- All new units integrated successfully
- Ready for Phase 2 deployment

---

## Batch Composition (from calc.csv rows 22-51)

### JSON #20: Speed Domain (New)
**Row 22**: Kilometers per Hour to Miles per Hour
- **Type**: Speed conversion (NEW UNIT KIND)
- **Units**: km/h → mph
- **Expected Units**: Need to define or find "kilometers_per_hour" and "miles_per_hour"
- **Bidirectional Pair**: JSON #21 (reverse)

### JSON #21: Speed Domain (New)
**Row 23**: Miles per Hour to Kilometers per Hour
- **Type**: Speed (reverse of #20)
- **Units**: mph → km/h

### JSON #22: Pressure Domain (New)
**Row 24**: Bar to PSI
- **Type**: Pressure conversion (NEW UNIT KIND)
- **Units**: bar → psi
- **Expected Units**: "bar", "psi" (may need to add)
- **Bidirectional Pair**: JSON #23 (reverse)

### JSON #23: Pressure Domain (New)
**Row 25**: PSI to Bar
- **Type**: Pressure (reverse of #22)
- **Units**: psi → bar

### JSON #24: Pressure Domain (Alt)
**Row 26**: kPa to PSI
- **Type**: Pressure variant
- **Units**: kilopascal → psi
- **Bidirectional Pair**: JSON #25 (reverse)

### JSON #25: Pressure Domain (Alt)
**Row 27**: PSI to kPa
- **Type**: Pressure (reverse of #24)
- **Units**: psi → kilopascal

### JSON #26: Power Domain (New)
**Row 28**: Kilowatts to Horsepower
- **Type**: Power conversion (NEW UNIT KIND)
- **Units**: kilowatt → horsepower
- **Expected Units**: "kilowatt", "horsepower"
- **Bidirectional Pair**: JSON #27 (reverse)

### JSON #27: Power Domain (New)
**Row 29**: Horsepower to Kilowatts
- **Type**: Power (reverse of #26)
- **Units**: horsepower → kilowatt

### JSON #28: Energy Domain
**Row 30**: Joules to Calories
- **Type**: Energy conversion
- **Units**: joule → calorie
- **Bidirectional Pair**: JSON #29 (reverse)

### JSON #29: Energy Domain
**Row 31**: Calories to Joules
- **Type**: Energy (reverse of #28)
- **Units**: calorie → joule

### JSON #30: Data Size Domain (New)
**Row 32**: Megabytes to Gigabytes
- **Type**: Data size conversion (NEW UNIT KIND)
- **Units**: megabyte → gigabyte
- **Bidirectional Pair**: JSON #31 (reverse)

### JSON #31: Data Size Domain (New)
**Row 33**: Gigabytes to Megabytes
- **Type**: Data size (reverse of #30)
- **Units**: gigabyte → megabyte

### JSON #32: Data Rate Domain (New)
**Row 34**: Mbps to MB/s
- **Type**: Data rate/bandwidth (NEW UNIT KIND)
- **Units**: megabit_per_second → megabyte_per_second
- **Bidirectional Pair**: JSON #33 (reverse)

### JSON #33: Data Rate Domain (New)
**Row 35**: MB/s to Mbps
- **Type**: Data rate (reverse of #32)
- **Units**: megabyte_per_second → megabit_per_second

### JSON #34: Time Domain
**Row 36**: Minutes to Seconds
- **Type**: Time conversion
- **Units**: minute → second
- **Existing Units**: minute, second already in system (hopefully)
- **Bidirectional Pair**: JSON #35 (reverse)

### JSON #35: Time Domain
**Row 37**: Seconds to Minutes
- **Type**: Time (reverse of #34)
- **Units**: second → minute

### JSON #36: Time Domain (Alt)
**Row 38**: Hours to Minutes
- **Type**: Time variant
- **Units**: hour → minute
- **Bidirectional Pair**: JSON #37 (reverse)

### JSON #37: Time Domain (Alt)
**Row 39**: Minutes to Hours
- **Type**: Time (reverse of #36)
- **Units**: minute → hour

### JSON #38: Currency Domain (New)
**Row 40**: USD to EUR
- **Type**: Currency conversion (NEW UNIT KIND)
- **Units**: usd → eur
- **Note**: Exchange rates are volatile; testing how ChatGPT handles
- **Bidirectional Pair**: JSON #39 (reverse)

### JSON #39: Currency Domain (New)
**Row 41**: EUR to USD
- **Type**: Currency (reverse of #38)
- **Units**: eur → usd

### JSON #40: Currency Domain (Alt)
**Row 42**: USD to GBP
- **Type**: Currency variant
- **Units**: usd → gbp
- **Bidirectional Pair**: JSON #41 (reverse)

### JSON #41: Currency Domain (Alt)
**Row 43**: GBP to USD
- **Type**: Currency (reverse of #40)
- **Units**: gbp → usd

### JSON #42: Currency Domain (Alt)
**Row 44**: EUR to GBP
- **Type**: Currency variant
- **Units**: eur → gbp
- **Bidirectional Pair**: JSON #43 (reverse)

### JSON #43: Currency Domain (Alt)
**Row 45**: GBP to EUR
- **Type**: Currency (reverse of #42)
- **Units**: gbp → eur

### JSON #44: Volume Domain (Extended)
**Row 46**: Cubic Meters to Liters
- **Type**: Volume variant (cubic_meter ↔ liter)
- **Units**: cubic_meter → liter
- **Expected Relationship**: 1 m³ = 1000 L
- **Bidirectional Pair**: JSON #45 (reverse)

### JSON #45: Volume Domain (Extended)
**Row 47**: Liters to Cubic Meters
- **Type**: Volume (reverse of #44)
- **Units**: liter → cubic_meter

### JSON #46: Density Domain (New)
**Row 48**: Kilograms per Cubic Meter (Density)
- **Type**: Density conversion (NEW UNIT KIND)
- **Units**: kg/m³ conversion
- **Note**: Likely to be complex—derived unit
- **Bidirectional Pair**: JSON #47 (reverse)

### JSON #47: Density Domain (New)
**Row 49**: Cubic Meters per Kilogram (Density reverse)
- **Type**: Density (reverse of #46)
- **Units**: Density variant

### JSON #48: Length Domain (Alt)
**Row 56**: Centimeters to Feet and Inches (Complex)
- **Type**: Length compound conversion
- **Units**: centimeter → feet + inches
- **Note**: May be complex (output is compound)
- **Bidirectional Pair**: JSON #49 (reverse)

### JSON #49: Length Domain (Alt)
**Row 57**: Feet and Inches to Centimeters (Complex)
- **Type**: Length compound (reverse of #48)
- **Units**: feet + inches → centimeter

---

## Expected Challenges & Unit System Extensions

### New Unit Kinds Encountered

| Unit Kind | Count | Examples | Existing? |
|-----------|-------|----------|-----------|
| Speed | 2 | km/h, mph | ❓ Check |
| Pressure | 6 | bar, psi, kPa | ❓ Check |
| Power | 2 | kW, hp | ❓ Check |
| Data Size | 4 | MB, GB | ❌ Likely new |
| Data Rate | 2 | Mbps, MB/s | ❌ Likely new |
| Currency | 6 | USD, EUR, GBP | ❌ Definitely new |
| Density | 2 | kg/m³, ? | ❌ Likely new |
| Time | 4 | minute, second, hour | ✅ Likely exists |

### Estimated New Units to Add

**High Confidence New Units** (will need to define):
- `bar` (pressure)
- `psi` (pressure)
- `kilopascal` or `kpa` (pressure)
- `kilowatt` (power)
- `horsepower` (power)
- `megabyte` (data size)
- `gigabyte` (data size)
- `megabit_per_second` or `mbps` (data rate)
- `megabyte_per_second` or `mb_per_second` (data rate)
- `usd`, `eur`, `gbp` (currency - requires exchange rate policy)
- `cubic_meter` (volume - may already exist)

**Estimated Total**: 10-12 new units (if not existing)

### Validation Hotspots

1. **Compound Conversions** (JSON #48-49)
   - Feet and Inches to Centimeters = compound input
   - May require new logic structure
   - Risk: Validator may not handle compound units

2. **Currency Conversions** (JSON #38-43)
   - Exchange rates are time-dependent
   - ChatGPT will provide fixed rates
   - May need special handling or disclaimers

3. **Derived Units** (JSON #46-47)
   - Density = kg/m³ (derived from mass and volume)
   - May not fit simple toBase/fromBase pattern
   - Risk: Unit system architecture challenge

4. **Data Rate Conversions** (JSON #32-33)
   - Bit vs Byte (1 byte = 8 bits)
   - Mbps (megabit) vs MB/s (megabyte)
   - Risk: Conversion factor must account for 8x multiplier

---

## Processing Workflow

### Per-Submission Process (Standard)

For each JSON #20-49:

1. **Receive JSON** from ChatGPT or submission
2. **Validate** with `node scripts/validate-json-units.js file.json --verbose`
   - Check unit IDs exist
   - Check URLs are plain (not Markdown)
   - Check kind matching
3. **If FAIL**:
   - Auto-fix with `node scripts/fix-json-cosmetics.js file.json --dry-run`
   - Review fixes
   - Apply with `node scripts/fix-json-cosmetics.js file.json --in-place`
   - Re-validate with `node scripts/validate-json-units.js file.json`
4. **If PASS**:
   - Proceed to Manual Review
5. **Manual Review** (12-section checklist, ~28 minutes)
   - Metadata, logic, introduction, methodology, examples, FAQs, citations, glossary, links, structure, overall quality
   - Score 0-10 per section
   - Document in `MANUAL_REVIEW_JSON_[#].md`
6. **If PASS**:
   - Commit to git with message including quality score
   - Move to next submission
7. **If FAIL**:
   - Document issues
   - Request changes or note for follow-up

### Validation Decisions

**Missing Unit Encountered**:
- Analyze the unit's definition
- Add to lib/conversions.ts with toBase/fromBase functions
- Add 3-6 aliases
- Re-validate all affected submissions
- Document unit addition decision in manual review

**New Unit Kind Encountered**:
- Add to `UnitKind` type in lib/conversions.ts if needed
- Define base unit for that kind
- Add all units for that kind with correct toBase/fromBase
- Test validation on 2-3 submissions using the new kind

**Compound Unit Encountered**:
- Evaluate whether validator can handle it
- If not: Document as special case
- Consider whether to extend validator or note limitation

---

## Quality Gates

### Validation Approval (Auto)
✅ **PASS Criteria**:
- All unit IDs valid and exist
- All URLs plain HTTPS
- Unit kinds match (except ingredient converters)
- JSON syntax valid

❌ **FAIL Criteria**:
- Invalid unit ID
- Markdown URL in citations
- Unit kind mismatch (non-ingredient)
- JSON syntax error

### Manual Review Approval
✅ **PASS Criteria**:
- Metadata: 8+/10
- Logic: 9+/10
- Introduction: 8+/10
- Methodology: 8+/10
- Examples: 8+/10
- FAQs: 8+/10
- Citations: 8+/10
- Links: 8+/10
- Structure: 10/10
- Overall Quality: 8+/10
- **Average: 85%+ (88/110 minimum)**

❌ **FAIL Criteria**:
- Any section: <7/10
- Critical errors in methodology
- Citations lack authority
- Examples mathematically incorrect

### Bidirectional Pair Verification

For each pair (forward + reverse):
- Validate both submissions pass
- Verify internal links reference each other
- Confirm reverse converses formula correctly
- Check both have similar quality scores
- Both must PASS for pair to be considered complete

---

## Success Metrics (Extended Phase 1)

| Metric | Target | Priority |
|--------|--------|----------|
| Submissions Processed | 30/30 | CRITICAL |
| Approval Rate | 95%+ | HIGH |
| Average Quality | 90%+ | HIGH |
| Error Catch Rate | 25%+ | MEDIUM |
| New Units Integrated | All without conflicts | CRITICAL |
| Bidirectional Pairs | 15/15 complete | HIGH |
| Manual Review Time | ~14 hours | MEDIUM |

---

## Exit Criteria

Phase 1 is **COMPLETE** when:
- ✅ All 30 submissions processed
- ✅ Approval/rejection decision documented for each
- ✅ All approved submissions committed to git
- ✅ All new units integrated and tested
- ✅ Manual review documents created for all submissions
- ✅ No critical errors in approved submissions
- ✅ Average quality ≥90% (or documented exceptions)

**Then**: Phase 2 launch with 50% sampling on JSON #50+

---

## Timeline (Estimated)

| Stage | Duration | Notes |
|-------|----------|-------|
| JSON #20-25 (6 submissions) | 2.8 hours | Speed/Pressure domains - baseline validation |
| JSON #26-31 (6 submissions) | 2.8 hours | Power/Energy/Data domains - new units |
| JSON #32-37 (6 submissions) | 2.8 hours | Data rate/Time domains - compound units |
| JSON #38-43 (6 submissions) | 2.8 hours | Currency domain - exchange rate handling |
| JSON #44-49 (6 submissions) | 2.8 hours | Volume/Density/Compound - edge cases |
| **Total** | **~14 hours** | Distributed across sessions |

---

## Next Step

**Awaiting next JSON submission (#20) from ChatGPT or manual input.**

Once received:
1. Save to `/home/uc/Projects/quantus2/data/configs/[name]-converter.json`
2. Run validation
3. Proceed through workflow above

**Go/No-go decision**: Extended Phase 1 is confirmed. Begin processing JSON #20.

