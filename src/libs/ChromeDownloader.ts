import { launch, LaunchOptions, Browser } from "puppeteer-core"
import * as path from "path"
import * as fs from "fs"
import * as mkdirp from "mkdirp"
import { sleep } from "./sleep"
import { downloadFilename } from "./downloadFilename"

type ChromeDownloadeOptions = {
  userDataDir: string
  chromePath: string
  profile: string
  downloadPath: string
  timeout: number
}

function getDownloadUrl(url: string): string {
  return url.replace(/\/s\d+\//, "/d/")
}

export class ChromeDownloader {
  browser: Browser | null

  constructor(public options: ChromeDownloadeOptions) {
    mkdirp.sync(options.downloadPath)
  }

  existPhotoByUrl(url: string) {
    const file = path.join(this.options.downloadPath, downloadFilename(url))
    return fs.existsSync(file)
  }

  async downloadImages(urls: string[]) {
    const results: { [key: string]: string } = {}
    try {
      for (const url of urls) {
        console.log("DOWNLOAD START: ", getDownloadUrl(url))
        if (await this.downloadImage(url)) {
          results[url] = downloadFilename(url)
        } else {
          console.error("DOWNLOAD ERROR: ", url, "\t", downloadFilename(url))
        }
      }
    } finally {
      if (this.browser) {
        await this.browser.close()
        this.browser = null
      }
    }
    return results
  }

  private async downloadImage(_url: string) {
    const url = getDownloadUrl(_url)
    try {
      if (this.existPhotoByUrl(url)) {
        return true
      }
      const browser = await this.factoryBrowser()
      const page = await browser.newPage()
      await (page as any)._client.send("Page.setDownloadBehavior", {
        behavior: "allow",
        downloadPath: this.options.downloadPath,
      })

      try {
        await page.goto(url)
      } catch (e) {
        //
      }

      const now = Date.now()
      while (!this.existPhotoByUrl(url)) {
        if (now + this.options.timeout < Date.now()) {
          page.close()
          throw "timeout"
        }
        await sleep(50)
      }
      await page.close()

      return true
    } catch (e) {
      // console.log(e)
      return false
    }
  }

  async factoryBrowser() {
    if (!this.browser) {
      const args = [
        "--disable-background-networking",
        "--enable-features=NetworkService,NetworkServiceInProcess",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-breakpad",
        "--disable-client-side-phishing-detection",
        "--disable-component-extensions-with-background-pages",
        "--disable-default-apps",
        "--disable-dev-shm-usage",
        "--disable-extensions",
        "--disable-features=TranslateUI",
        "--disable-hang-monitor",
        "--disable-ipc-flooding-protection",
        "--disable-popup-blocking",
        "--disable-prompt-on-repost",
        "--disable-renderer-backgrounding",
        "--disable-sync",
        "--force-color-profile=srgb",
        "--metrics-recording-only",
        "--no-first-run",
        "--enable-automation",
        "--password-store=basic",
        // '--use-mock-keychain',
        // '--headless',
        "--hide-scrollbars",
        "--mute-audio",
        "--no-sandbox",
        `--profile-directory=${this.options.profile}`,
        `--user-data-dir=${this.options.userDataDir}`,
        "about:blank",
      ]
      const launchOptions: LaunchOptions = {
        executablePath: this.options.chromePath,
        args,
        ignoreDefaultArgs: true,
        slowMo: 100,
      }

      this.browser = await launch(launchOptions)
    }
    return this.browser
  }
}
