// Parses strings like "₹30,000 - ₹1,00,000" into { min, max } numbers.
// Falls back to { min: 0, max: 0 } if the format is unexpected so the
// calculator never crashes on unusual data.
function parseInvestmentRange(rangeText) {
  if (!rangeText) return { min: 0, max: 0 };

  const numbers = rangeText
    .replace(/[₹,]/g, "")
    .match(/\d+(\.\d+)?/g);

  if (!numbers || numbers.length === 0) return { min: 0, max: 0 };

  const values = numbers.map(Number);
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

module.exports = { parseInvestmentRange, sanitizeUser };
