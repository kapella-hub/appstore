/**
 * A practical floor for ordinary between-session variation in a mechanical
 * watch, expressed in seconds per day.
 *
 * A fit's standard error measures scatter within one run. It does not include
 * changes in placement, state of wind, temperature, or the watch itself
 * between runs. The floor prevents tiny fit errors from turning ordinary
 * between-session movement into a false failure.
 */
export const AGREEMENT_FLOOR_SECONDS_PER_DAY = 2.0;

function requireFinite(name, value) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }
}

/**
 * Compare two timegrapher rate readings.
 *
 * @param {object} readings
 * @param {number} readings.firstRate First rate in seconds/day.
 * @param {number} readings.firstStandardError First 1-sigma fit uncertainty.
 * @param {number} readings.secondRate Second rate in seconds/day.
 * @param {number} readings.secondStandardError Second 1-sigma fit uncertainty.
 * @param {number} [readings.agreementFloor=2] Between-session floor in seconds/day.
 * @returns {{difference:number, midpoint:number, combinedUncertainty:number,
 *   agreementLimit:number, agrees:boolean}}
 */
export function compareReadings({
  firstRate,
  firstStandardError,
  secondRate,
  secondStandardError,
  agreementFloor = AGREEMENT_FLOOR_SECONDS_PER_DAY,
}) {
  requireFinite("firstRate", firstRate);
  requireFinite("firstStandardError", firstStandardError);
  requireFinite("secondRate", secondRate);
  requireFinite("secondStandardError", secondStandardError);
  requireFinite("agreementFloor", agreementFloor);

  if (firstStandardError < 0 || secondStandardError < 0) {
    throw new RangeError("standard errors must be zero or greater");
  }
  if (agreementFloor < 0) {
    throw new RangeError("agreementFloor must be zero or greater");
  }

  const difference = Math.abs(secondRate - firstRate);
  const combinedUncertainty = Math.hypot(
    firstStandardError,
    secondStandardError,
  );
  const agreementLimit = Math.max(
    2 * combinedUncertainty,
    agreementFloor,
  );

  return {
    difference,
    midpoint: (firstRate + secondRate) / 2,
    combinedUncertainty,
    agreementLimit,
    agrees: difference <= agreementLimit,
  };
}
