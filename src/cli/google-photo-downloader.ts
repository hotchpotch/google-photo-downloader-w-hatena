import { ChromeDownloader } from "../libs/ChromeDownloader"
import { join } from "path"
import { projectRoot } from "../libs/projectRoot"
import { program } from "commander"
import { readFileSync, writeFileSync } from "fs"

const DEFAULT_OPTIONS = {
  userDataDir:
    process.platform === "win32"
      ? join(
          process.env.USERPROFILE,
          "AppData/Local/Google/Chrome",
          "User Data"
        )
      : `${process.env.HOME}/Library/Application Support/Google/Chrome`,
  chromePath:
    process.platform === "win32"
      ? join(
          process.env.USERPROFILE,
          "AppData/Local/Google/Chrome/Application/chrome.exe"
        )
      : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  profile: "Default",
  downloadPath: join(projectRoot, "photos"),
  outputList: join(projectRoot, "download.results"),
  timeout: 30000,
}

program
  .requiredOption("-l, --url-list <file>", "Google Photo URL list file")
  .option(
    "-u, --userDataDir <dir>",
    "Chrome's user-data-dir",
    DEFAULT_OPTIONS.userDataDir
  )
  .option(
    "-c, --chrome-path <path>",
    "Chrome exe path",
    DEFAULT_OPTIONS.chromePath
  )
  .option(
    "-o, --output-downloaded-list <path>",
    "result downloaded list",
    DEFAULT_OPTIONS.outputList
  )
  .option(
    "-p, --profile <profile name>",
    "Chrome profile name",
    DEFAULT_OPTIONS.profile
  )
  .option(
    "-d, --download-path <dir>",
    "download photos dir",
    DEFAULT_OPTIONS.downloadPath
  )
  .option(
    "-t, --timeout <msec>",
    "wait timeout (msec)",
    parseInt,
    DEFAULT_OPTIONS.timeout
  )
  .parse(process.argv)

const chromeDownloader = new ChromeDownloader({
  userDataDir: program.userDataDir,
  chromePath: program.chromePath,
  profile: program.profile,
  timeout: program.timeout,
  downloadPath: program.downloadPath,
})

const googlePhotoUrls = readFileSync(program.urlList).toString().split(/\r?\n/)

;(async () => {
  try {
    const result = await chromeDownloader.downloadImages(googlePhotoUrls)
    writeFileSync(
      program.outputDownloadedList,
      Object.entries(result)
        .map((a) => a.join(","))
        .join("\n")
    )
    console.log("FINISH, WROTE: ", program.outputDownloadedList)
  } catch (e) {
    console.log("ERROR", e)
  }
})()
/*
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
  const chromeDownloader = new ChromeDownloader()
  try {
    await chromeDownloader.downloadImages(lines)
  } catch (e) {
    console.log("error", e)
  }
})()
*/