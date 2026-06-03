'use client'

import Link from 'next/link'

interface AdminReportExportLinkProps {
  href: string
  label: string
  reportSensitivityLabel: string
  warningLabel: string
}

export function buildAdminReportExportConfirmationMessage({
  label,
  reportSensitivityLabel,
  warningLabel,
}: Pick<AdminReportExportLinkProps, 'label' | 'reportSensitivityLabel' | 'warningLabel'>) {
  return [
    `${label} may download sensitive CSV data.`,
    reportSensitivityLabel,
    warningLabel,
    'Only continue if you are prepared to handle the export securely.',
  ].join('\n\n')
}

export function AdminReportExportLink({
  href,
  label,
  reportSensitivityLabel,
  warningLabel,
}: AdminReportExportLinkProps) {
  const confirmationMessage = buildAdminReportExportConfirmationMessage({
    label,
    reportSensitivityLabel,
    warningLabel,
  })

  return (
    <Link
      href={href}
      className="btn-outline text-xs"
      aria-label={`${label}: ${reportSensitivityLabel}`}
      title={warningLabel}
      onClick={(event) => {
        if (!window.confirm(confirmationMessage)) {
          event.preventDefault()
        }
      }}
    >
      {label}
    </Link>
  )
}
