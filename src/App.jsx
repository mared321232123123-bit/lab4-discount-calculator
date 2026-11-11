import { useRef, useState } from 'react'
import { calculate, categories } from './calculate.js'

const empty = id => ({ id, price: '', category: 'Электроника', custom: false, percent: '0' })
const rub = cents => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(cents / 100)

export default function App() {
  const [rows, setRows] = useState([empty(1)])
  const nextId = useRef(2)
  const [promo, setPromo] = useState('')
  const [vat, setVat] = useState(true)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])

  function invalidate() {
    setResult(null)
    setError('')
  }
  function edit(id, key, value) {
    invalidate()
    setRows(previous => previous.map(row => row.id === id ? { ...row, [key]: value } : row))
  }
  function submit(event) {
    event.preventDefault()
    const invalid = rows.findIndex(row => !/^\d+(?:[.,]\d{1,2})?$/.test(row.price) ||
      Number(row.price.replace(',', '.')) <= 0 || Number(row.price.replace(',', '.')) > 1e9)
    if (invalid !== -1) return setError(`Товар ${invalid + 1}: введите цену от 0,01 до 1 млрд рублей`)
    const code = promo.trim().toUpperCase()
    if (code && code !== 'WELCOME10') return setError('Промокод не распознан')
    const items = rows.map(row => ({ ...calculate(row, Boolean(code), vat), id: row.id, category: row.category }))
    const total = items.reduce((sum, item) => sum + item.total, 0)
    setResult({ items, total })
    setHistory(previous => [total, ...previous].slice(0, 5))
    setError('')
  }

  return <main><h1>Калькулятор скидок</h1>
    <form className="panel stack" onSubmit={submit}>
      {rows.map((row, index) => <fieldset className="stack" key={row.id}>
        <legend>Товар {index + 1}</legend>
        <label>Цена в рублях<input inputMode="decimal" value={row.price} onChange={e => edit(row.id, 'price', e.target.value)} /></label>
        <label>Категория<select value={row.category} onChange={e => edit(row.id, 'category', e.target.value)}>
          {Object.entries(categories).map(([name, rate]) => <option key={name} value={name}>{name} · {rate}%</option>)}
        </select></label>
        <label><input type="checkbox" checked={row.custom} onChange={e => edit(row.id, 'custom', e.target.checked)} /> Своя скидка</label>
        {row.custom && <label>Скидка {row.percent}%<input type="range" min="0" max="50" value={row.percent} onChange={e => edit(row.id, 'percent', e.target.value)} /></label>}
        {rows.length > 1 && <button type="button" onClick={() => { invalidate(); setRows(rows.filter(item => item.id !== row.id)) }}>Удалить товар</button>}
      </fieldset>)}
      <label>Промокод<input value={promo} onChange={e => { invalidate(); setPromo(e.target.value) }} placeholder="WELCOME10" /></label>
      <label><input type="checkbox" checked={vat} onChange={e => { invalidate(); setVat(e.target.checked) }} /> Добавить НДС 22%</label>
      <div className="row">
        <button type="button" onClick={() => { invalidate(); setRows([...rows, empty(nextId.current++)]) }}>Добавить товар</button>
        <button>Рассчитать</button>
        <button type="button" onClick={() => { invalidate(); setRows([empty(nextId.current++)]); setPromo(''); setVat(true) }}>Сбросить</button>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
    </form>
    {result && <section aria-live="polite"><h2>К оплате {rub(result.total)}</h2>
      {result.items.map(item => <p key={item.id}>{item.category} · цена {rub(item.price)} · ставка {item.rate}% · общая скидка {rub(item.discount)} · после скидки {rub(item.net)} · НДС {rub(item.tax)} · итог {rub(item.total)}</p>)}
    </section>}
    {!!history.length && <section><h2>Последние расчёты</h2><ol>{history.map((value, index) => <li key={index}>{rub(value)}</li>)}</ol></section>}
  </main>
}
