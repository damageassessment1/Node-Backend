export function generateApplicationId(): string {
  const year = new Date().getFullYear();
  const uniquePart = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  return `GAZA-${year}-${uniquePart.toUpperCase()}`;
}