'use client'

import Script from 'next/script'

export default function AdScript() {
  return (
    <>
      <Script id="adsterra-config" strategy="beforeInteractive">
        {`
          atOptions = {
            'key' : '254552b61f462d259783d3c8d1517810',
            'format' : 'iframe',
            'height' : 250,
            'width' : 300,
            'params' : {}
          };
        `}
      </Script>
      <Script
        id="adsterra-script"
        strategy="lazyOnload"
        src="//www.highperformanceformat.com/254552b61f462d259783d3c8d1517810/invoke.js"
      />
    </>
  )
}