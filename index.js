import htmlToPdfmake from 'html-to-pdfmake'
import pdfMake from 'pdfmake/build/pdfmake.js'
import pdfFonts from 'pdfmake/build/vfs_fonts.js'
import { JSDOM } from 'jsdom'

pdfMake.addVirtualFileSystem(pdfFonts)

async function htmlToPdf(htmlString) {
    const html = htmlToPdfmake(htmlString, { window: (new JSDOM()).window })
    const pdfDocGenerator = pdfMake.createPdf({ content: [html] })
    const base64 = await pdfDocGenerator.getBase64()
    return Buffer.from(base64, 'base64')
}

Bun.serve({
    port: 3000,
    routes: {
        '/': {
            POST: async (req) => {
                const html = await req.text()
                if (!html) {
                    return new Response('HTML body required', { status: 400 })
                }
                const pdf = await htmlToPdf(html)
                return new Response(pdf, {
                    headers: {
                        'Content-Type': 'application/pdf',
                        'Content-Length': String(pdf.byteLength),
                    }
                })
            }
        }
    }
})

console.log('Listening on http://localhost:3000')
console.log('Usage: curl -X POST http://localhost:3000 --data-binary @file.html --output out.pdf')
