import { AbstractFileProviderService } from "@medusajs/framework/utils"
import { ProviderUploadFileDTO, ProviderFileResultDTO, ProviderDeleteFileDTO } from "@medusajs/framework/types"
import { v2 as cloudinary } from "cloudinary"
import * as path from "path"

type CloudinaryOptions = {
  apiKey: string
  apiSecret: string
  cloudName: string
  folderName?: string
  secure?: boolean
}

export class CloudinaryFileProviderService extends AbstractFileProviderService {
  static identifier = "cloudinary-custom"

  protected config_: CloudinaryOptions

  constructor(container: any, options: CloudinaryOptions) {
    super()
    this.config_ = options

    cloudinary.config({
      cloud_name: options.cloudName,
      api_key: options.apiKey,
      api_secret: options.apiSecret,
      secure: options.secure ?? true,
    })
  }

  async upload(file: ProviderUploadFileDTO): Promise<ProviderFileResultDTO> {
    if (!file) {
      throw new Error("No file provided")
    }

    const folder = this.config_.folderName || "medusa"
    const publicId = path.parse(file.filename).name

    // Convert the base64 content to a Data URI, so Cloudinary decodes and processes it as binary data.
    const dataUri = `data:${file.mimeType};base64,${file.content}`

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataUri,
        {
          folder,
          public_id: publicId,
          resource_type: "auto", // Automatically detects image, video, or raw binary types
        },
        (error, result) => {
          if (error) {
            return reject(new Error(`Cloudinary upload failed: ${error.message}`))
          }
          resolve({
            url: result!.secure_url,
            key: result!.public_id,
          })
        }
      )
    })
  }

  async delete(files: ProviderDeleteFileDTO | ProviderDeleteFileDTO[]): Promise<void> {
    const filesArray = Array.isArray(files) ? files : [files]

    await Promise.all(
      filesArray.map(async (file) => {
        const key = file.fileKey
        if (!key) return

        return new Promise<void>((resolve, reject) => {
          cloudinary.uploader.destroy(
            key,
            {
              invalidate: true,
            },
            (error, result) => {
              if (error) {
                return reject(new Error(`Cloudinary delete failed: ${error.message}`))
              }
              resolve()
            }
          )
        })
      })
    )
  }
}
