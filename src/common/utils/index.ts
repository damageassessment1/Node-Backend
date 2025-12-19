export function generateApplicationId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000); // 6 digits
  return `GAZA-${year}-${random}`;
}

