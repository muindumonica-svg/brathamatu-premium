import { useState } from 'react'
import { Alert, Badge, Button, Card, Field, PageHeader, Select, Table } from '../../components/ui'
import { useCurrentUser } from '../../lib/auth/hooks'
import { ApiError } from '../../lib/api/client'
import { fetchPosProducts, type PosProduct } from '../../lib/api/pos'
import {
  useCreatePosSale,
  useCreatePosTerminal,
  useOpenPosShift,
  usePosProducts,
  usePosShifts,
  usePosTerminals,
} from '../../lib/pos/hooks'
import type { CreateSaleInput, PosSale } from '../../lib/api/pos'

interface CartLine {
  variant_id: string
  product_name: string
  sku: string | null
  barcode: string | null
  quantity: number
  unit: string
  unit_price: number
  tax_amount: number
  discount_amount: number
}

interface MixedPaymentLine {
  method: 'cash' | 'mpesa' | 'card'
  amount: string
  reference: string
}

function money(value: number, currency = 'KES'): string {
  return `${currency} ${value.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character)
}

export function PosTerminalPage() {
  const { data: user } = useCurrentUser()
  const tenantId = user?.current_tenant?.id

  const terminalsQuery = usePosTerminals(tenantId)
  const shiftsQuery = usePosShifts(tenantId)
  const createTerminal = useCreatePosTerminal(tenantId)
  const createSale = useCreatePosSale(tenantId)

  const terminals = terminalsQuery.data ?? []
  const shifts = shiftsQuery.data ?? []

  const [terminalId, setTerminalId] = useState('')
  const [newTerminalName, setNewTerminalName] = useState('')
  const [openingFloat, setOpeningFloat] = useState('0')
  const [search, setSearch] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [brand, setBrand] = useState('')
  const [brandTerm, setBrandTerm] = useState('')
  const [category, setCategory] = useState('')
  const [categoryTerm, setCategoryTerm] = useState('')
  const [letter, setLetter] = useState('')
  const [letterTerm, setLetterTerm] = useState('')
  const [searchPage, setSearchPage] = useState(1)
  const [barcode, setBarcode] = useState('')
  const [lookupBusy, setLookupBusy] = useState(false)
  const [cart, setCart] = useState<CartLine[]>([])
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mpesa' | 'card' | 'mixed'>('cash')
  const [cashTendered, setCashTendered] = useState('')
  const [mixedPayments, setMixedPayments] = useState<MixedPaymentLine[]>([
    { method: 'cash', amount: '', reference: '' },
    { method: 'mpesa', amount: '', reference: '' },
  ])
  const [error, setError] = useState<string | null>(null)
  const [lastSale, setLastSale] = useState<PosSale | null>(null)

  const activeTerminal = terminals.find((terminal) => terminal.id === terminalId) ?? terminals[0]
  const productsQuery = usePosProducts(tenantId, {
    terminalId: activeTerminal?.id ?? '',
    search: searchTerm || undefined,
    brand: brandTerm || undefined,
    category: categoryTerm || undefined,
    letter: letterTerm || undefined,
    page: searchPage,
    perPage: 8,
  })
  const openShift = shifts.find(
    (shift) => shift.status === 'open' && shift.terminal_id === activeTerminal?.id,
  )
  const openShiftMutation = useOpenPosShift(tenantId, activeTerminal?.id)

  const subtotal = cart.reduce((sum, line) => sum + line.quantity * line.unit_price, 0)
  const taxTotal = cart.reduce((sum, line) => sum + line.tax_amount, 0)
  const discountTotal = cart.reduce((sum, line) => sum + line.discount_amount, 0)
  const total = subtotal + taxTotal - discountTotal
  const cashAllocation = paymentMethod === 'mixed'
    ? mixedPayments.reduce((sum, line) => sum + (line.method === 'cash' ? Number(line.amount || 0) : 0), 0)
    : total
  const cashReceived = Number(cashTendered || (paymentMethod === 'mixed' ? cashAllocation : total))
  const change = paymentMethod === 'cash' || paymentMethod === 'mixed'
    ? Math.max(0, cashReceived - cashAllocation)
    : 0
  const mixedTotalCents = mixedPayments.reduce(
    (sum, line) => sum + Math.round(Number(line.amount || 0) * 100),
    0,
  )
  const mixedHasDistinctMethods = new Set(mixedPayments.map((line) => line.method)).size >= 2
  const mixedPaymentValid = paymentMethod !== 'mixed'
    || (mixedHasDistinctMethods
      && mixedPayments.every((line) => Number(line.amount) > 0)
      && mixedTotalCents === Math.round(total * 100)
      && cashReceived >= cashAllocation)
  const paymentValid = paymentMethod === 'cash'
    ? cashReceived >= total
    : mixedPaymentValid
  const currency = lastSale?.currency ?? 'KES'

  const searchResults = productsQuery.data?.products ?? []

  function runSearch() {
    setSearchTerm(search.trim())
    setBrandTerm(brand.trim())
    setCategoryTerm(category.trim())
    setLetterTerm(letter.trim())
    setSearchPage(1)
  }

  function addToCart(product: PosProduct, scannedBarcode?: string) {
    setError(null)
    const variants = product.variants.filter((variant) => variant.status === 'active')
    const variant =
      (scannedBarcode
        ? variants.find((candidate) =>
            candidate.barcodes.some((code) => code.barcode === scannedBarcode),
          )
        : undefined) ?? variants[0]

    if (!variant) {
      setError(`${product.name} has no active variant to sell.`)
      return
    }
    if (variant.selling_price === null || variant.selling_price <= 0) {
      setError(
        `No selling price is configured for ${product.name}. Set a catalogue variant retail_price, selling_price, unit_price or price before selling.`,
      )
      return
    }
    const unitPrice = variant.selling_price

    const barcodeValue =
      scannedBarcode ?? variant.barcodes.find((code) => code.is_primary)?.barcode
      ?? variant.barcodes[0]?.barcode ?? null
    setCart((current) => {
      const existing = current.findIndex((line) => line.variant_id === variant.id)
      if (existing >= 0) {
        const next = [...current]
        next[existing] = { ...next[existing], quantity: next[existing].quantity + 1 }
        return next
      }
      return [
        ...current,
        {
          variant_id: variant.id,
          product_name:
            product.variants.length > 1 && variant.name
              ? `${product.name} — ${variant.name}`
              : product.name,
          sku: variant.sku ?? product.sku ?? null,
          barcode: barcodeValue,
          quantity: 1,
          unit: variant.base_unit ?? product.base_unit ?? 'pcs',
          unit_price: unitPrice,
          tax_amount: 0,
          discount_amount: 0,
        },
      ]
    })
    setLastSale(null)
    setSearch('')
    setSearchTerm('')
  }

  async function handleBarcodeLookup() {
    const code = barcode.trim()
    if (!tenantId || !activeTerminal || code === '') return
    setLookupBusy(true)
    setError(null)
    try {
      const result = await fetchPosProducts(tenantId, {
        terminalId: activeTerminal.id,
        search: code,
        perPage: 50,
      })
      const match = result.products.find((product) =>
        product.variants.some((variant) =>
          variant.barcodes.some((candidate) => candidate.barcode === code),
        ),
      )
      if (!match) {
        setError(`No active product matches “${code}”.`)
        return
      }
      addToCart(match, code)
      setBarcode('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Barcode lookup failed.')
    } finally {
      setLookupBusy(false)
    }
  }

  function updateLine(index: number, value: number) {
    setCart((current) => {
      const next = [...current]
      next[index] = { ...next[index], quantity: value }
      return next
    })
  }

  function removeLine(index: number) {
    setCart((current) => current.filter((_, position) => position !== index))
  }

  function handleCreateTerminal() {
    if (newTerminalName.trim() === '') return
    setError(null)
    createTerminal.mutate(
      { name: newTerminalName.trim() },
      {
        onSuccess: (terminal) => {
          setNewTerminalName('')
          setTerminalId(terminal.id)
        },
        onError: (err) =>
          setError(err instanceof ApiError ? err.message : 'Could not create the terminal.'),
      },
    )
  }

  function handleOpenShift() {
    if (!activeTerminal) return
    setError(null)
    openShiftMutation.mutate(
      { opening_float: Number(openingFloat || 0) },
      {
        onError: (err) =>
          setError(err instanceof ApiError ? err.message : 'Could not open the shift.'),
      },
    )
  }

  function handleCheckout() {
    if (!activeTerminal) {
      setError('Create or select a POS terminal first.')
      return
    }
    if (!openShift) {
      setError('Open a shift before making sales.')
      return
    }
    if (cart.length === 0) {
      setError('The cart is empty.')
      return
    }
    if (cart.some((line) => line.unit_price <= 0)) {
      setError('Set a unit price above zero for every cart line.')
      return
    }
    if (!paymentValid) {
      setError(paymentMethod === 'cash'
        ? 'Cash tendered must be at least the sale total.'
        : 'Split payments must use at least two methods and add up exactly to the sale total.')
      return
    }

    const input: CreateSaleInput = {
      terminal_id: activeTerminal.id,
      payment_method: paymentMethod,
      cash_tendered: paymentMethod === 'cash'
        ? Number(cashTendered || total)
        : paymentMethod === 'mixed' && cashAllocation > 0
          ? cashReceived
          : undefined,
      payments: paymentMethod === 'mixed'
        ? mixedPayments.map((line) => ({
          method: line.method,
          amount: Number(line.amount),
          reference: line.reference.trim() || undefined,
        }))
        : undefined,
      items: cart.map((line) => ({
        variant_id: line.variant_id,
        barcode: line.barcode ?? undefined,
        quantity: line.quantity,
        tax_amount: line.tax_amount,
        discount_amount: line.discount_amount,
      })),
    }

    setError(null)
    createSale.mutate(input, {
      onSuccess: (sale) => {
        setLastSale(sale)
        setCart([])
        setCashTendered('')
        setPaymentMethod('cash')
      },
      onError: (err) =>
        setError(err instanceof ApiError ? err.message : 'Checkout failed.'),
    })
  }

  function printReceipt(sale: PosSale) {
    if (!sale.receipt) {
      setError('This sale has no generated receipt. Please refresh the sale record or contact support.')
      return
    }
    const receiptWindow = window.open('', '_blank', 'width=420,height=720')
    if (!receiptWindow) {
      setError('Allow pop-ups for this site to print the receipt.')
      return
    }

    const rows = sale.items.map((item) => `
      <tr>
        <td>${escapeHtml(item.product_name)}<small>${escapeHtml(item.sku ?? '')}</small></td>
        <td>${item.quantity}</td>
        <td>${money(item.unit_price, sale.currency)}</td>
        <td>${money(item.line_total + item.tax_amount - item.discount_amount, sale.currency)}</td>
      </tr>`).join('')
    const payments = sale.payments.map((payment) => `
      <p><span>${escapeHtml(payment.method.toUpperCase())}${payment.reference ? ` · ${escapeHtml(payment.reference)}` : ''}</span>
      <strong>${money(payment.amount, sale.currency)}</strong></p>`).join('')

    receiptWindow.document.write(`<!doctype html>
      <html><head><meta charset="utf-8"><title>Receipt ${escapeHtml(sale.receipt.receipt_number)}</title>
      <style>
        body{font:14px/1.45 Arial,sans-serif;color:#111;max-width:380px;margin:24px auto;padding:0 12px}
        h1,p{text-align:center;margin:0 0 8px}h1{font-size:20px}.muted{color:#555;font-size:12px}
        table{width:100%;border-collapse:collapse;margin:18px 0}
        th,td{text-align:left;padding:7px 3px;border-bottom:1px solid #ddd;font-size:12px}
        td small{display:block;color:#555} .totals p,.payments p{display:flex;justify-content:space-between;text-align:left;margin:6px 0}
        .grand{font-size:17px;border-top:1px solid #111;padding-top:8px}
        button{display:block;margin:20px auto;padding:10px 18px}
        @media print{body{margin:0 auto}button{display:none}}
      </style></head><body>
      <h1>${escapeHtml(user?.current_tenant?.name ?? 'BrathaMatu POS')}</h1>
      <p class="muted">Receipt ${escapeHtml(sale.receipt.receipt_number)}</p>
      <p class="muted">${escapeHtml(sale.reference)} · ${escapeHtml(sale.terminal_name ?? '')}</p>
      <p class="muted">${escapeHtml(sale.created_at ? new Date(sale.created_at).toLocaleString('en-KE') : '')}</p>
      <hr><p>${escapeHtml(sale.customer ?? 'Walk-in customer')}</p>
      <table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="totals">
        <p><span>Subtotal</span><strong>${money(sale.subtotal, sale.currency)}</strong></p>
        <p><span>Tax</span><strong>${money(sale.tax_amount, sale.currency)}</strong></p>
        <p><span>Discount</span><strong>-${money(sale.discount_amount, sale.currency)}</strong></p>
        <p class="grand"><span>Total</span><strong>${money(sale.total_amount, sale.currency)}</strong></p>
      </div>
      <div class="payments"><h2>Payment</h2>${payments}</div>
      ${sale.cash_change && sale.cash_change > 0 ? `<p><span>Change</span> <strong>${money(sale.cash_change, sale.currency)}</strong></p>` : ''}
      <p class="muted">Thank you for shopping with us.</p>
      <button onclick="window.print()">Print receipt</button>
      </body></html>`)
    receiptWindow.document.close()
    receiptWindow.opener = null
    window.setTimeout(() => {
      receiptWindow.focus()
      receiptWindow.print()
    }, 250)
  }

  if (terminalsQuery.isLoading || shiftsQuery.isLoading) {
    return <div className="py-16 text-center text-gray-500">Loading POS…</div>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="POS Terminal"
        description="Scan barcodes or search the catalogue, then take payment."
        actions={
          <div className="flex items-center gap-2">
            <Badge tone={activeTerminal ? 'green' : 'red'}>
              {activeTerminal ? activeTerminal.name : 'No terminal'}
            </Badge>
            <Badge tone={openShift ? 'green' : 'amber'}>
              {openShift ? 'Shift open' : 'Shift closed'}
            </Badge>
          </div>
        }
      />

      {error && <Alert kind="error">{error}</Alert>}
      {lastSale && (
        <Alert kind="success">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>
              Sale {lastSale.reference} completed — receipt {lastSale.receipt_number ?? 'missing'}. Total{' '}
              {money(lastSale.total_amount, lastSale.currency)}
              {lastSale.cash_change !== null && lastSale.cash_change > 0
                ? ` · change ${money(lastSale.cash_change, lastSale.currency)}`
                : ''}
            </span>
            <Button variant="secondary" onClick={() => printReceipt(lastSale)}>
              Print receipt
            </Button>
          </div>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-4">
          <Card title="Terminal & shift">
            <div className="space-y-4">
              {terminals.length > 0 ? (
                <Select
                  label="Terminal"
                  name="terminal"
                  value={activeTerminal?.id ?? ''}
                  onChange={(event) => setTerminalId(event.target.value)}
                >
                  {terminals.map((terminal) => (
                    <option key={terminal.id} value={terminal.id}>
                      {terminal.name}
                    </option>
                  ))}
                </Select>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    No terminal yet. Create one to start selling.
                  </p>
                  <Field
                    label="Terminal name"
                    name="terminal_name"
                    value={newTerminalName}
                    onChange={(event) => setNewTerminalName(event.target.value)}
                    placeholder="Till 1"
                  />
                  <Button
                    onClick={handleCreateTerminal}
                    loading={createTerminal.isPending}
                    disabled={newTerminalName.trim() === ''}
                  >
                    Create terminal
                  </Button>
                </div>
              )}

              {activeTerminal && !openShift && (
                <div className="space-y-3 border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-600">This terminal has no open shift.</p>
                  <Field
                    label="Opening float"
                    name="opening_float"
                    type="number"
                    min={0}
                    step="0.01"
                    value={openingFloat}
                    onChange={(event) => setOpeningFloat(event.target.value)}
                  />
                  <Button onClick={handleOpenShift} loading={openShiftMutation.isPending}>
                    Open shift
                  </Button>
                </div>
              )}

              {openShift && (
                <div className="space-y-1 border-t border-gray-100 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Opened</span>
                    <span>
                      {openShift.opened_at
                        ? new Date(openShift.opened_at).toLocaleString('en-KE')
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Float</span>
                    <span>{money(openShift.opening_float, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cash sales</span>
                    <span>{money(openShift.total_cash_sales, currency)}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card title="Scan or search">
            <div className="space-y-4">
              <Field
                label="Barcode"
                name="barcode"
                value={barcode}
                onChange={(event) => setBarcode(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    void handleBarcodeLookup()
                  }
                }}
                placeholder="Scan barcode and press Enter"
                autoFocus
              />
              <Button
                onClick={() => void handleBarcodeLookup()}
                loading={lookupBusy}
                disabled={barcode.trim() === ''}
              >
                Look up barcode
              </Button>

              <div className="space-y-3 border-t border-gray-100 pt-4">
                <Field
                  label="Catalogue search"
                  name="catalogue_search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      runSearch()
                    }
                  }}
                  placeholder="Product name, SKU or barcode"
                />
                  <Field
                    label="Brand filter"
                    name="pos_brand_filter"
                    value={brand}
                    onChange={(event) => setBrand(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        runSearch()
                      }
                    }}
                    placeholder="Any brand"
                  />
                  <Select
                    label="Letter filter"
                    name="pos_letter_filter"
                    value={letter}
                    onChange={(event) => setLetter(event.target.value)}
                  >
                    <option value="">All letters</option>
                    {'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('').map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </Select>
                  <Field
                    label="Category filter"
                    name="pos_category_filter"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        runSearch()
                      }
                    }}
                    placeholder="Category name"
                  />
                  <Button
                    variant="secondary"
                    onClick={runSearch}
                    disabled={
                      search.trim() === '' &&
                      brand.trim() === '' &&
                      category.trim() === '' &&
                      letter.trim() === ''
                    }
                  >
                    Search
                  </Button>

                  {productsQuery.isFetching && <p className="text-sm text-gray-500">Searching…</p>}
                  {(searchTerm !== '' || brandTerm !== '' || categoryTerm !== '' || letterTerm !== '') &&
                    !productsQuery.isFetching &&
                    searchResults.length === 0 && (
                    <p className="text-sm text-gray-500">No active products matched.</p>
                  )}
                {searchResults.length > 0 && (
                  <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                    {searchResults.map((product) => (
                      <li
                        key={product.id}
                        className="flex items-center justify-between gap-3 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {product.name}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {product.sku ?? 'No SKU'}
                            {product.barcode ? ` · ${product.barcode}` : ''}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {product.brand ?? 'No brand'}
                            {product.category ? ` · ${product.category.name}` : ''}
                            {' · '}
                            {product.variants[0]?.selling_price
                              ? money(product.variants[0].selling_price)
                              : 'Selling price not configured'}
                          </p>
                        </div>
                        <Button
                          variant="secondary"
                          onClick={() => addToCart(product)}
                          disabled={lookupBusy || !product.variants[0]?.selling_price}
                        >
                          Add
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
                {productsQuery.data && productsQuery.data.pagination.total > 0 && (
                  <div className="flex items-center justify-between gap-3 text-sm text-gray-600">
                    <span>
                      Page {productsQuery.data.pagination.current_page} of{' '}
                      {productsQuery.data.pagination.last_page} ·{' '}
                      {productsQuery.data.pagination.total} products
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        disabled={searchPage <= 1 || productsQuery.isFetching}
                        onClick={() => setSearchPage((page) => page - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="secondary"
                        disabled={
                          searchPage >= productsQuery.data.pagination.last_page ||
                          productsQuery.isFetching
                        }
                        onClick={() => setSearchPage((page) => page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-8">
          <Card title="Cart">
            {cart.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                Empty cart — scan a barcode or add a catalogue product.
              </p>
            ) : (
              <Table headers={['Product', 'Qty', 'Unit price', 'Line total', '']}>
                {cart.map((line, index) => (
                  <tr key={line.variant_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{line.product_name}</div>
                      <div className="text-xs text-gray-500">
                        {[line.sku, line.barcode].filter(Boolean).join(' · ') || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={1}
                        step="1"
                        value={line.quantity}
                        onChange={(event) =>
                          updateLine(
                            index,
                            Math.max(1, Number(event.target.value) || 1),
                          )
                        }
                        className="w-20 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-2 focus:outline-brand-600"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {money(line.unit_price, currency)}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">
                      {money(line.quantity * line.unit_price, currency)}
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="danger" onClick={() => removeLine(index)}>
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </Table>
            )}

            <div className="mt-4 space-y-2 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>{money(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span>{money(taxTotal, currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span>-{money(discountTotal, currency)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{money(total, currency)}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 border-t border-gray-200 pt-4 sm:grid-cols-2">
              <Select
                label="Payment method"
                name="payment_method"
                value={paymentMethod}
                onChange={(event) => {
                  setPaymentMethod(event.target.value as 'cash' | 'mpesa' | 'card' | 'mixed')
                  setError(null)
                }}
              >
                <option value="cash">Cash</option>
                <option value="mpesa">M-Pesa</option>
                <option value="card">Card</option>
                <option value="mixed">Mixed</option>
              </Select>
              {paymentMethod === 'cash' && (
                <Field
                  label="Cash tendered"
                  name="cash_tendered"
                  type="number"
                  min={0}
                  step="0.01"
                  value={cashTendered}
                  onChange={(event) => setCashTendered(event.target.value)}
                  placeholder={total.toFixed(2)}
                  hint={cashReceived < total
                    ? 'Cash tendered is below the sale total.'
                    : `Change: ${money(change, currency)}`}
                />
              )}
              {paymentMethod === 'mixed' && (
                <div className="space-y-3 sm:col-span-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-gray-800">Split tender amounts</p>
                    <Button
                      variant="secondary"
                      disabled={mixedPayments.length >= 3}
                      onClick={() => setMixedPayments((current) => [
                        ...current,
                        { method: 'card', amount: '', reference: '' },
                      ])}
                    >
                      Add payment method
                    </Button>
                  </div>
                  {mixedPayments.map((line, index) => (
                    <div key={index} className="grid grid-cols-1 items-end gap-3 rounded-lg border border-gray-200 p-3 sm:grid-cols-4">
                      <Select
                        label={`Payment method ${index + 1}`}
                        name={`mixed_payment_method_${index}`}
                        value={line.method}
                        onChange={(event) => setMixedPayments((current) => current.map((item, row) =>
                          row === index
                            ? { ...item, method: event.target.value as MixedPaymentLine['method'] }
                            : item,
                        ))}
                      >
                        <option value="cash">Cash</option>
                        <option value="mpesa">M-Pesa</option>
                        <option value="card">Card</option>
                      </Select>
                      <Field
                        label={`Amount ${index + 1}`}
                        name={`mixed_payment_amount_${index}`}
                        type="number"
                        min={0.01}
                        step="0.01"
                        value={line.amount}
                        onChange={(event) => setMixedPayments((current) => current.map((item, row) =>
                          row === index ? { ...item, amount: event.target.value } : item,
                        ))}
                      />
                      <Field
                        label={`Reference ${index + 1} (optional)`}
                        name={`mixed_payment_reference_${index}`}
                        value={line.reference}
                        onChange={(event) => setMixedPayments((current) => current.map((item, row) =>
                          row === index ? { ...item, reference: event.target.value } : item,
                        ))}
                      />
                      <Button
                        variant="danger"
                        disabled={mixedPayments.length <= 2}
                        onClick={() => setMixedPayments((current) => current.filter((_, row) => row !== index))}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <p className="text-sm text-gray-600">
                    Split total: {money(mixedTotalCents / 100, currency)} of {money(total, currency)}.
                    {!mixedPaymentValid && ' Amounts must match the sale total and include different payment methods.'}
                  </p>
                  {cashAllocation > 0 && (
                    <Field
                      label="Cash received for split payment"
                      name="mixed_cash_tendered"
                      type="number"
                      min={cashAllocation}
                      step="0.01"
                      value={cashTendered}
                      onChange={(event) => setCashTendered(event.target.value)}
                      placeholder={cashAllocation.toFixed(2)}
                      hint={`Cash change: ${money(change, currency)}`}
                    />
                  )}
                </div>
              )}
            </div>

            <Button
              className="mt-4 w-full"
              onClick={handleCheckout}
              loading={createSale.isPending}
              disabled={cart.length === 0 || !openShift || !activeTerminal || !paymentValid}
            >
              Complete sale
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
