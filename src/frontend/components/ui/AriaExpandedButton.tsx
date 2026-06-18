import { forwardRef, createElement, type ComponentPropsWithoutRef } from 'react'

type AriaExpandedButtonProps = Omit<ComponentPropsWithoutRef<'button'>, 'aria-expanded'> & {
  expanded: boolean
}

export const AriaExpandedButton = forwardRef<HTMLButtonElement, AriaExpandedButtonProps>(
  function AriaExpandedButton({ expanded, ...props }, ref) {
    return createElement('button', {
      ...props,
      ref,
      'aria-expanded': expanded ? 'true' : 'false',
    })
  },
)

AriaExpandedButton.displayName = 'AriaExpandedButton'
