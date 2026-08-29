import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react'
import App from '../App'
import { SHOWCASE } from '../data'

/** jsdom lacks the layout/observer APIs the map and slideshow touch. */
beforeEach(() => {
  window.location.hash = '#/'
  Element.prototype.scrollIntoView = vi.fn()
  Element.prototype.setPointerCapture = vi.fn()
  Element.prototype.releasePointerCapture = vi.fn()
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
})
afterEach(cleanup)

const flagship = SHOWCASE.products.find((p) => p.flagship)!

describe('home', () => {
  it('renders every product as a card linking to its route', () => {
    render(<App />)
    for (const p of SHOWCASE.products) {
      const link = document.querySelector(`a[href="#/p/${p.slug}"]`)
      expect(link, `no card for ${p.slug}`).toBeTruthy()
      expect(link!.textContent).toContain(p.name[0])
    }
  })

  it('shows the client count derived from the data, not a hard-coded number', () => {
    render(<App />)
    const total = SHOWCASE.clients.reduce((a, c) => a + c.items.length, 0)
    expect(screen.getByText(`${total}+`)).toBeInTheDocument()
  })

  it('switches every client group when its tab is clicked', () => {
    render(<App />)
    const second = SHOWCASE.clients[1]
    fireEvent.click(screen.getByRole('button', { name: new RegExp(second.title[0]) }))
    expect(screen.getByText(second.items[0].n[0])).toBeInTheDocument()
  })
})

describe('language toggle', () => {
  it('flips document direction and swaps copy', () => {
    render(<App />)
    expect(document.documentElement.dir).toBe('rtl')
    fireEvent.click(screen.getByRole('button', { name: 'English' }))
    expect(document.documentElement.dir).toBe('ltr')
    expect(document.documentElement.lang).toBe('en')
    expect(screen.getByRole('button', { name: 'عربي' })).toBeInTheDocument()
    // an english product name is now the card heading
    expect(screen.getAllByText(flagship.name[1]).length).toBeGreaterThan(0)
  })
})

describe('product route', () => {
  it('renders the product view for #/p/<slug>', () => {
    window.location.hash = `#/p/${flagship.slug}`
    render(<App />)
    expect(screen.getByRole('heading', { level: 2, name: flagship.name[0] })).toBeInTheDocument()
    expect(screen.getByText(`1 / ${flagship.imgs.length}`)).toBeInTheDocument()
  })

  it('advances and wraps the slideshow', () => {
    window.location.hash = `#/p/${flagship.slug}`
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'next' }))
    expect(screen.getByText(`2 / ${flagship.imgs.length}`)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'prev' }))
    fireEvent.click(screen.getByRole('button', { name: 'prev' }))
    expect(screen.getByText(`${flagship.imgs.length} / ${flagship.imgs.length}`)).toBeInTheDocument()
  })

  it('shows the caption of the current screen', () => {
    const withCap = SHOWCASE.products.find((p) => p.imgs.some((i) => i.cap))!
    const first = withCap.imgs.findIndex((i) => i.cap)
    window.location.hash = `#/p/${withCap.slug}`
    render(<App />)
    for (let i = 0; i < first; i++) fireEvent.click(screen.getByRole('button', { name: 'next' }))
    expect(screen.getByText(withCap.imgs[first].cap![0])).toBeInTheDocument()
  })

  it('lists "used by" organizations when the product has them', () => {
    const withUsers = SHOWCASE.products.find((p) => p.users?.length)!
    window.location.hash = `#/p/${withUsers.slug}`
    render(<App />)
    expect(screen.getByText(withUsers.users![0].n[0])).toBeInTheDocument()
  })

  it('falls back to the home grid for an unknown slug', () => {
    window.location.hash = '#/p/does-not-exist'
    render(<App />)
    expect(document.querySelector(`a[href="#/p/${flagship.slug}"]`)).toBeTruthy()
  })

  it('returns home from the back button', () => {
    window.location.hash = `#/p/${flagship.slug}`
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /كل المنتجات/ }))
    expect(window.location.hash).toBe('#/')
  })
})

describe('coverage map', () => {
  it('draws one pin per mapped organization', () => {
    render(<App />)
    expect(document.querySelectorAll('.pin-g').length).toBe(SHOWCASE.map.points.length)
  })

  it('legend counts match the data', () => {
    render(<App />)
    const csc = SHOWCASE.map.points.filter((p) => p.s === 'csc').length
    const legend = document.querySelector('.absolute.top-3\\.5')!
    expect(within(legend as HTMLElement).getByText(String(csc))).toBeInTheDocument()
  })
})
