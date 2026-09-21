import mammoth from 'mammoth'
import { extractText, getDocumentProxy } from 'unpdf'

// Vercel caps a serverless request body at ~4.5 MB, and base64 inflates by
// about a third, so the client is limited to 3 MB. Enforced here too because
// a client-side check is a convenience, not a guarantee.
const MAX_BYTES = 3 * 1024 * 1024

const PDF = 'application/pdf'
const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const DOC = 'application/msword'

async function extractPdf(buffer) {
  const pdf = await getDocumentProxy(new Uint8Array(buffer))
  const { text } = await extractText(pdf, { mergePages: true })
  return text
}

async function extractDocx(buffer) {
  const { value } = await mammoth.extractRawText({ buffer })
  return value
}

// PDF extraction tends to leave ragged spacing and stray page furniture.
function tidy(raw) {
  return raw
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { fileName, fileType, data } = req.body || {}

  if (!data || !fileType) {
    return res.status(400).json({ error: 'Missing file data or type.' })
  }

  let buffer
  try {
    buffer = Buffer.from(data, 'base64')
  } catch {
    return res.status(400).json({ error: 'The file could not be decoded.' })
  }

  if (buffer.length === 0) {
    return res.status(400).json({ error: 'That file is empty.' })
  }

  if (buffer.length > MAX_BYTES) {
    return res.status(413).json({ error: 'That file is larger than 3 MB.' })
  }

  try {
    let text

    if (fileType === PDF) {
      text = await extractPdf(buffer)
    } else if (fileType === DOCX) {
      text = await extractDocx(buffer)
    } else if (fileType === DOC) {
      return res.status(415).json({
        error: 'Legacy .doc files are not supported. Please save as .docx or PDF.',
      })
    } else {
      return res.status(415).json({ error: `Unsupported file type: ${fileType}` })
    }

    const cleaned = tidy(text || '')

    // A scanned resume extracts to nothing. Say so plainly rather than
    // handing the analyser an empty string and reporting a score of zero.
    if (cleaned.length < 50) {
      return res.status(422).json({
        error:
          'Almost no text could be read from that file. If it is a scanned image, paste the text instead.',
        code: 'NO_TEXT',
      })
    }

    return res.status(200).json({
      text: cleaned,
      characters: cleaned.length,
      fileName: fileName || null,
    })
  } catch (err) {
    console.error('parse-resume failed:', err)
    return res.status(500).json({
      error: 'That file could not be read. Try a different export, or paste the text.',
    })
  }
}
