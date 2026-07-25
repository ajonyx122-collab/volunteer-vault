// Builds a spreadsheet (CSV opens in Excel / Google Sheets) of a volunteer's
// hour log — the thing NHS coordinators and counselors actually ask for.
export function downloadHoursCsv(user, activity) {
  const header = ['Date', 'Opportunity', 'Organization', 'Hours', 'Status']
  const rows = activity.map((entry) => [
    new Date(entry.date).toLocaleDateString('en-US'),
    entry.title,
    entry.orgName ?? '',
    entry.hours,
    entry.status === 'verified' ? 'Verified' : 'Pending',
  ])
  const totalVerified = activity
    .filter((e) => e.status === 'verified')
    .reduce((sum, e) => sum + e.hours, 0)
  rows.push([])
  rows.push(['Total verified hours', '', '', totalVerified, ''])
  rows.push([`Verified record: www.volunteervault.org/u/${user.username}`, '', '', '', ''])

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','))
    .join('\r\n')

  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `volunteer-hours-${user.username}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}
