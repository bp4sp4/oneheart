const fs = require('fs')
const path = require('path')

const file = path.resolve(__dirname, '..', 'data', 'questions.json')
const qs = JSON.parse(fs.readFileSync(file, 'utf8'))

const axisPairs = [ ['R','E'], ['S','L'], ['P','O'], ['C','T'] ]
const codeMap = {
  RSPC:{code:'RSPC',label:'알스피씨',summary:'차분한 준비형 엄마'},
  RSPT:{code:'RSPT',label:'알스피티',summary:'믿음형 준비 엄마'},
  ROPC:{code:'ROPC',label:'알옵씨',summary:'참고형 준비 엄마'},
  ROPT:{code:'ROPT',label:'알옵티',summary:'균형형 준비 엄마'},
  RLPC:{code:'RLPC',label:'알엘피씨',summary:'관찰형 엄마'},
  RLPT:{code:'RLPT',label:'알엘피티',summary:'안정 신뢰형 엄마'},
  RLTC:{code:'RLTC',label:'알엘티씨',summary:'비교 관찰형 엄마'},
  RLTT:{code:'RLTT',label:'알엘티티',summary:'유연 관찰형 엄마'},
  ESPC:{code:'ESPC',label:'엣스피씨',summary:'계획 실행형 엄마'},
  ESPT:{code:'ESPT',label:'엣스피티',summary:'동기부여형 엄마'},
  EOPC:{code:'EOPC',label:'엣옵씨',summary:'정보 수집형 엄마'},
  EOPT:{code:'EOPT',label:'엣옵티',summary:'균형 소통형 엄마'},
  ELPC:{code:'ELPC',label:'엣엘피씨',summary:'감정 공감형 엄마'},
  ELPT:{code:'ELPT',label:'엣엘피티',summary:'따뜻한 신뢰형 엄마'},
  ELTC:{code:'ELTC',label:'엣엘티씨',summary:'공감 비교형 엄마'},
  ELTT:{code:'ELTT',label:'엣엘티티',summary:'자유 공감형 엄마'},
}

const axisIndex = { a:0, b:1, c:2, d:3 }
const sums = [0,0,0,0]

qs.forEach((q,i)=>{
  const v = 1
  const val = q.reversed ? -v : v
  const a = (q.axis && axisIndex[q.axis.toLowerCase()] !== undefined) ? axisIndex[q.axis.toLowerCase()] : Math.floor(i/25)
  const axis = (typeof a === 'number') ? a : Math.floor(i/25)
  sums[axis] += val
})

const chosen = sums.map((s,i)=> s>0 ? axisPairs[i][0] : axisPairs[i][1])
const code = chosen.join('')
const mapping = codeMap[code] || { code, label: code, summary: '' }

console.log('Per-axis sums (A,B,C,D):', sums.join(', '))
console.log('Total sum:', sums.reduce((a,b)=>a+b,0))
console.log('Chosen letters per axis:', chosen.join(', '))
console.log('Final code:', code)
console.log('Mapping:', mapping)
