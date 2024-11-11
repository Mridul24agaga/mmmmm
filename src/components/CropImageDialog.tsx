'use client'

import "cropperjs/dist/cropper.css"
import { useRef } from "react"
import { Cropper, ReactCropperElement } from "react-cropper"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CropImageDialogProps {
  src: string
  cropAspectRatio: number
  onCropped: (blob: Blob | null) => void
  onClose: () => void
}

export default function CropImageDialog({
  src,
  cropAspectRatio,
  onCropped,
  onClose,
}: CropImageDialogProps) {
  const cropperRef = useRef<ReactCropperElement>(null)

  function crop() {
    const cropper = cropperRef.current?.cropper
    if (!cropper) return
    cropper.getCroppedCanvas().toBlob((blob) => onCropped(blob), "image/webp")
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle>Crop image</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <Cropper
            src={src}
            aspectRatio={cropAspectRatio}
            guides={false}
            zoomable={false}
            ref={cropperRef}
            className="max-h-[60vh] object-contain"
          />
        </div>
        <DialogFooter className="pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={crop}>Crop</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}