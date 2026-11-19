import type { FormEvent } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CollapsibleForm } from '../components/ui'
import { FORM_SUBMISSION_SUCCESS_EVENT } from '../lib/form-events'

describe('CollapsibleForm', () => {
  it('starts closed and collapses with a success notice after a successful submission', () => {
    const handleSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault())
    render(
      <CollapsibleForm>
        <form onSubmit={handleSubmit}>
          <label>
            Product name
            <input name="name" />
          </label>
          <button type="submit">Save</button>
        </form>
      </CollapsibleForm>,
    )

    const disclosure = screen.getByText('Show form').closest('details')
    expect(disclosure).not.toHaveAttribute('open')

    fireEvent.click(screen.getByText('Show form'))
    expect(disclosure).toHaveAttribute('open')
    expect(screen.getByRole('textbox', { name: 'Product name' })).toBeInTheDocument()

    fireEvent.submit(screen.getByRole('button', { name: 'Save' }).closest('form')!)
    expect(handleSubmit).toHaveBeenCalledOnce()

    act(() => {
      window.dispatchEvent(new Event(FORM_SUBMISSION_SUCCESS_EVENT))
    })

    expect(screen.getByText('Submitted successfully · Show form')).toBeInTheDocument()
    expect(disclosure).not.toHaveAttribute('open')
  })
})
