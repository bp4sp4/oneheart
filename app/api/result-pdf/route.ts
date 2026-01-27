import { NextResponse } from 'next/server'
import PDFDocument from 'pdfkit/js/pdfkit.standalone.js'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

function toStr(v: string | null) {
  return (v ?? '').toString()
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = toStr(searchParams.get('code'))
  const label = toStr(searchParams.get('label'))
  const summary = toStr(searchParams.get('summary'))

  if (!code || !label) {
    return NextResponse.json({ error: 'Missing code/label' }, { status: 400 })
  }

  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'NotoSansKR-Regular.ttf')
  if (!fs.existsSync(fontPath)) {
    return NextResponse.json({ error: 'Font not found (public/fonts/NotoSansKR-Regular.ttf)' }, { status: 500 })
  }

  const doc = new PDFDocument({ size: 'A4', margin: 56 })
  const chunks: Uint8Array[] = []

  doc.on('data', (chunk: Uint8Array) => chunks.push(chunk))

  const pdfBytes: Uint8Array = await new Promise((resolve, reject) => {
    doc.on('end', () => {
      const buffer = Buffer.concat(chunks as unknown as Uint8Array[])
      resolve(new Uint8Array(buffer))
    })
    doc.on('error', reject)

    doc.registerFont('NotoSansKR', fontPath)
    doc.font('NotoSansKR')

    // Header
    doc.fillColor('#0064FF').fontSize(26).text('엄마 유형 테스트 결과', { align: 'left' })
    doc.moveDown(0.6)
    doc.fillColor('#111827').fontSize(16).text(`${code} — ${label}`)

    doc.moveDown(0.8)
    doc
      .fillColor('#374151')
      .fontSize(12)
      .text('당신의 선택은 우연이 아니라, 반복되어 온 패턴의 증거입니다.', { lineGap: 4 })

    doc.moveDown(1)

    // Main card
    doc
      .roundedRect(56, 170, 483, 240, 16)
      .fillAndStroke('#F8FAFC', '#E5E7EB')

    doc.fillColor('#111827').fontSize(14).text('핵심 해석', 80, 195)

    const bodyText = summary || '당신은 일상 속 선택과 기준이 분명한 타입입니다. 작은 습관들이 모여 큰 방향을 만듭니다.'

    doc
      .fillColor('#374151')
      .fontSize(12)
      .text(bodyText, 80, 220, { width: 435, lineGap: 6 })

    // Callouts
    doc.fillColor('#111827').fontSize(14).text('오늘의 제안', 80, 325)
    const tips = [
      '아이에게 “지금 충분히 잘하고 있어”라는 문장을 하루 한 번 선물해보세요.',
      '내가 지키고 싶은 기준 1가지만 적고, 나머지는 과감히 내려두기.',
      '완벽보다 “지속 가능한 리듬”을 선택하면 에너지가 오래 갑니다.',
    ]
    doc.fillColor('#374151').fontSize(12)
    let y = 350
    for (const t of tips) {
      doc.text(`• ${t}`, 80, y, { width: 435, lineGap: 4 })
      y += 22
    }

    // Footer
    doc
      .fillColor('#9CA3AF')
      .fontSize(10)
      .text(`생성일: ${new Date().toLocaleString('ko-KR')}`, 56, 760)
    doc.text('© 2026 oneheart.kr', 56, 776)

    doc.end()
  })

  return new NextResponse(pdfBytes as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent('엄마유형테스트_결과.pdf')}`,
      'Cache-Control': 'no-store',
    },
  })
}
