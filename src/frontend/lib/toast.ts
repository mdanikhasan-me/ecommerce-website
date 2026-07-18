type ToastKind = 'success' | 'error'

function showToast(kind: ToastKind, message: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('boilabin:toast-needed'))
  }

  void import('react-hot-toast').then(({ default: toast }) => {
    toast[kind](message, { id: 'boilabin-feedback' })
  })
}

const toast = {
  success(message: string) {
    showToast('success', message)
  },
  error(message: string) {
    showToast('error', message)
  },
}

export default toast
