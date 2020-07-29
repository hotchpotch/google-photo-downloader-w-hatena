import { ChromeDownloader } from "../libs/ChromeDownloader"

async function getStdinLines() {
  const buffers = []
  for await (const chunk of process.stdin) {
    buffers.push(chunk)
  }
  const buffer = Buffer.concat(buffers)
  const source = buffer.toString()
  return source.split(/\r?\n/)
}

;(async () => {
  const lines = await getStdinLines()
  const chromeDownloader = new ChromeDownloader()
  try {
    await chromeDownloader.downloadImages(lines)
  } catch (e) {
    console.log("error", e)
  }
})()
