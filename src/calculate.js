export const categories = { Электроника: 5, Одежда: 15, Продукты: 10, Книги: 20, Другое: 0 }

export function calculate(row, promo, withVat) {
  const price = Math.round(Number(row.price.replace(',', '.')) * 100)
  const rate = row.custom ? Number(row.percent) : categories[row.category]
  const discounted = Math.round(price * (1 - rate / 100))
  const net = promo ? Math.round(discounted * 0.9) : discounted
  const tax = withVat ? Math.round(net * 0.22) : 0
  return { price, rate, discount: price - net, net, tax, total: net + tax }
}
