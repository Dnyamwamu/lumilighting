import { AbstractFileProviderService } from "@medusajs/framework/utils"
import { ProviderUploadFileDTO, ProviderFileResultDTO, ProviderDeleteFileDTO, ProviderUploadStreamDTO, ProviderGetFileDTO } from "@medusajs/framework/types"
import { v2 as cloudinary } from "cloudinary"
import * as path from "path"
import { PassThrough, Writable, Readable } from "stream"
import * as https from "https"

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

  async getUploadStream(fileData: ProviderUploadStreamDTO): Promise<{
    writeStream: Writable
    promise: Promise<ProviderFileResultDTO>
    url: string
    fileKey: string
  }> {
    if (!fileData.filename) {
      throw new Error("No filename provided")
    }

    const folder = this.config_.folderName || "medusa"
    const parsedFilename = path.parse(fileData.filename)
    const uniqueId = `${parsedFilename.name}-${Date.now()}`
    const fileKey = `${folder}/${uniqueId}${parsedFilename.ext}`

    // Predict URL for raw upload (CSV)
    const url = `https://res.cloudinary.com/${this.config_.cloudName}/raw/upload/${fileKey}`

    const pass = new PassThrough()

    const promise = new Promise<ProviderFileResultDTO>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: `${uniqueId}${parsedFilename.ext}`,
          resource_type: "raw",
        },
        (error, result) => {
          if (error) {
            return reject(new Error(`Cloudinary streaming upload failed: ${error.message}`))
          }
          resolve({
            url: result!.secure_url,
            key: result!.public_id,
          })
        }
      )

      pass.pipe(uploadStream)

      pass.on("error", (err) => {
        reject(err)
      })
    })

    return {
      writeStream: pass,
      promise,
      url,
      fileKey,
    }
  }

  async delete(files: ProviderDeleteFileDTO | ProviderDeleteFileDTO[]): Promise<void> {
    const filesArray = Array.isArray(files) ? files : [files]

    await Promise.all(
      filesArray.map(async (file) => {
        const key = file.fileKey
        if (!key) return

        const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(key)
        const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(key)
        const resourceType = isImage ? "image" : isVideo ? "video" : "raw"

        return new Promise<void>((resolve, reject) => {
          cloudinary.uploader.destroy(
            key,
            {
              invalidate: true,
              resource_type: resourceType,
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

  async getPresignedDownloadUrl(fileData: ProviderGetFileDTO): Promise<string> {
    if (!fileData.fileKey) {
      throw new Error("No fileKey provided")
    }
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileData.fileKey)
    const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(fileData.fileKey)
    const resourceType = isImage ? "image" : isVideo ? "video" : "raw"
    return `https://res.cloudinary.com/${this.config_.cloudName}/${resourceType}/upload/${fileData.fileKey}`
  }

  async getDownloadStream(fileData: ProviderGetFileDTO): Promise<Readable> {
    const url = await this.getPresignedDownloadUrl(fileData)
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to download file from Cloudinary: status code ${res.statusCode}`))
        } else {
          resolve(res)
        }
      }).on("error", reject)
    })
  }

  async getAsBuffer(fileData: ProviderGetFileDTO): Promise<Buffer> {
    const url = await this.getPresignedDownloadUrl(fileData)
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to download file: status code ${res.statusCode}`))
          return
        }
        const chunks: any[] = []
        res.on("data", (chunk) => chunks.push(chunk))
        res.on("end", () => resolve(Buffer.concat(chunks)))
        res.on("error", reject)
      }).on("error", reject)
    })
  }

  async getPresignedUploadUrl(fileData: any): Promise<any> {
    return {
      url: "/admin/uploads",
      key: fileData.filename,
    }
  }
}
