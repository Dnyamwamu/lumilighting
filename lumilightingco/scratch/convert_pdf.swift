import Foundation
import PDFKit
import AppKit

let pdfUrl = URL(fileURLWithPath: "/Users/dnyamwamu/Downloads/Lumi Logo.pdf")
guard let doc = PDFDocument(url: pdfUrl) else {
    print("Failed to open PDF")
    exit(1)
}

let names = ["lumi-logo-yellow-shadow.png", "lumi-logo-yellow.png", "lumi-logo-black.png"]
let outDir = "/Users/dnyamwamu/projects/Clients/lumilightingco/lumilightingco/public/"

for i in 0..<doc.pageCount {
    guard let page = doc.page(at: i) else { continue }
    let bounds = page.bounds(for: .mediaBox)
    
    // Scale 4x for high resolution
    let scale: CGFloat = 4.0
    let width = Int(bounds.width * scale)
    let height = Int(bounds.height * scale)
    
    let colorSpace = CGColorSpaceCreateDeviceRGB()
    guard let context = CGContext(data: nil, width: width, height: height, bitsPerComponent: 8, bytesPerRow: width * 4, space: colorSpace, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else { continue }
    
    context.scaleBy(x: scale, y: scale)
    page.draw(with: .mediaBox, to: context)
    
    guard let cgImage = context.makeImage() else { continue }
    let bitmapRep = NSBitmapImageRep(cgImage: cgImage)
    guard let pngData = bitmapRep.representation(using: .png, properties: [:]) else { continue }
    
    let destination = URL(fileURLWithPath: outDir + names[i])
    try? pngData.write(to: destination)
    print("Saved \(names[i]) (\(width)x\(height))")
}
