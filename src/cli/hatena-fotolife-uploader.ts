import { program } from "commander"
import { dirname, join, resolve, basename } from "path"
import * as mkdirp from "mkdirp"
import * as glob from "glob"
import { HatenaFotolifeUploader } from "../libs/HatenaFotolifeUploader"
import { existsSync, writeFileSync } from "fs"

const projectRoot = dirname(dirname(resolve(__dirname)))
const defaultFotolifeResult = join(projectRoot, "fotolife_results")
const defaultPhotos = join(projectRoot, "photos")

program
  .requiredOption("-u, --username <hatena id>", "username (hatena_id)")
  .requiredOption("-a, --apikey <api key>", "AtomPub API key")
  .option(
    "-f, --folder <folder name>",
    "fotolife's folder name",
    "Google Photos"
  )
  .option(
    "-r, --results-dir <dir>",
    "results data directory",
    defaultFotolifeResult
  )
  .option("-p, --photos-dir <dir>", "photos directory", defaultPhotos)
  .parse(process.argv)

mkdirp.sync(program.resultsDir)
const photos = glob.sync(program.photosDir + "/*")
const uploader = new HatenaFotolifeUploader({
  username: program.username,
  apikey: program.apikey,
  folder: program.folder,
})

function getResultPath(photo: string) {
  const name = basename(photo)
  return join(program.resultsDir, name + ".data")
}

function existResult(photo: string) {
  const path = getResultPath(photo)
  return existsSync(path)
}

;(async () => {
  for (const photo of photos) {
    const resultPath = getResultPath(photo)
    if (existResult(photo)) {
      console.log("SKIP: " + resultPath + " exist.")
    } else {
      try {
        console.log("UPLOAD START:", photo)
        const resultUrl = await uploader.upload(photo)
        writeFileSync(resultPath, resultUrl)
        console.log("WROTE: ", resultPath)
      } catch (e) {
        console.error("UPLOAD ERROR:", photo, e)
      }
    }
  }
})()

// console.log(program.resultsDir)
// console.log(program.photosDir)
