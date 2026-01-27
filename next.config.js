/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // pdfkit은 런타임에 __dirname 기반으로 data/*.afm 등을 읽습니다.
    // Next 번들링에 포함되면 경로가 .next/server/vendor-chunks 로 바뀌어 파일을 못 찾는 문제가 있어 외부 패키지로 유지합니다.
    serverComponentsExternalPackages: ['pdfkit'],
  },
}

module.exports = nextConfig
