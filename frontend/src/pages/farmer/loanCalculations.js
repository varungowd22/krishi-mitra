const SCHEME_REFERENCE = {
  kccBaseRate: 7,
  kccEffectiveRate: 4,
  cropSubventionLimit: 300000,
  alliedSubventionLimit: 200000,
  rateAboveLimit: 9,
};

export function estimateKccInterest(amount, months, onTime = true, allied = false) {
  if (
    !Number.isFinite(amount) || amount <= 0 || amount > Number.MAX_SAFE_INTEGER ||
    !Number.isFinite(months) || months <= 0 || months > 12
  ) {
    throw new RangeError("Enter a loan amount above zero and a term from 1 to 12 months.");
  }
  const subsidyLimit = allied ? SCHEME_REFERENCE.alliedSubventionLimit : SCHEME_REFERENCE.cropSubventionLimit;
  const coveredAmount = Math.min(amount, subsidyLimit);
  const amountAboveLimit = Math.max(0, amount - coveredAmount);
  const benefitRate = onTime ? SCHEME_REFERENCE.kccEffectiveRate : SCHEME_REFERENCE.kccBaseRate;
  const interest = (
    coveredAmount * benefitRate / 100 +
    amountAboveLimit * SCHEME_REFERENCE.rateAboveLimit / 100
  ) * months / 12;
  const savedByOnTimeRepayment = coveredAmount *
    (SCHEME_REFERENCE.kccBaseRate - SCHEME_REFERENCE.kccEffectiveRate) / 100 * months / 12;
  return {
    amount,
    months,
    interest: Math.round(interest),
    totalToRepay: Math.round(amount + interest),
    savedByOnTimeRepayment: Math.round(savedByOnTimeRepayment),
    coveredAmount,
    amountAboveLimit,
    estimatedRate: amountAboveLimit > 0 ? "Blended estimate" : `${benefitRate}% reference`,
  };
}

export function estimateEmi(principal, annualRate, months) {
  if (
    !Number.isFinite(principal) || principal <= 0 || principal > Number.MAX_SAFE_INTEGER ||
    !Number.isFinite(annualRate) || annualRate < 0 || annualRate > 100 ||
    !Number.isFinite(months) || !Number.isInteger(months) || months <= 0 || months > 600
  ) {
    throw new RangeError("Enter a loan above zero, a rate from 0 to 100%, and 1 to 600 monthly payments.");
  }
  const monthlyRate = annualRate / 1200;
  const payment = monthlyRate === 0
    ? principal / months
    : principal * monthlyRate * (1 + monthlyRate) ** months /
      ((1 + monthlyRate) ** months - 1);
  if (!Number.isFinite(payment)) {
    throw new RangeError("This loan amount is too large to calculate safely.");
  }
  return {
    emi: Math.round(payment),
    totalPaid: Math.round(payment * months),
    totalInterest: Math.round(payment * months - principal),
  };
}
