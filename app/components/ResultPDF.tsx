export async function downloadResultPDF({
  code,
  label,
  summary,
}: {
  code: string
  label: string
  summary: string
}) {
  if (typeof window === 'undefined') {
    throw new Error('PDF 다운로드는 브라우저에서만 가능합니다.')
  }

  const params = new URLSearchParams({ code, label, summary })
  const res = await fetch(`/api/result-pdf?${params.toString()}`)
  if (!res.ok) {
    throw new Error('PDF 생성에 실패했습니다.')
  }

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `엄마유형테스트_결과_${code}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
