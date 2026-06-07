import 'react'

declare module '*.css'
declare module '*.scss'
declare module '*.module.css'
declare module '*.module.scss'

declare module 'react' {
  interface HTMLAttributes<T> {
    tw?: string
  }
}
