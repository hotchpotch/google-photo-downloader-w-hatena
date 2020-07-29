import fotolife, { Fotolife } from "hatena-fotolife-api"
import { basename } from "path"

// force change https
;(Fotolife as any).BASE_URL = "https://f.hatena.ne.jp"

export class HatenaFotolifeUploader {
  private client: Fotolife
  public folder: string

  constructor({
    username,
    apikey,
    folder,
  }: {
    username: string
    apikey: string
    folder?: string
  }) {
    this.client = fotolife({ type: "wsse", username, apikey })
    this.folder = folder || "Google Photos"
  }

  async upload(filepath: string) {
    const title = basename(filepath)
    const result = await this.client.create({
      title,
      file: filepath,
      folder: this.folder,
    })
    return result?.entry?.["hatena:imageurl"]?.["_"]
  }
}
