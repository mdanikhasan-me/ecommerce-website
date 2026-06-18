type BooleanAriaValue = 'true' | 'false'

function booleanAria(value: boolean): BooleanAriaValue {
  return value ? 'true' : 'false'
}

export function ariaPressed(pressed: boolean): { 'aria-pressed': BooleanAriaValue } {
  return { 'aria-pressed': booleanAria(pressed) }
}

export function ariaCurrentPage(current: boolean): { 'aria-current'?: 'page' } {
  return current ? { 'aria-current': 'page' } : {}
}

export function ariaDisabled(disabled: boolean): { 'aria-disabled'?: 'true' } {
  return disabled ? { 'aria-disabled': 'true' } : {}
}
