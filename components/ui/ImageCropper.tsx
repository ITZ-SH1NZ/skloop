
import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface Area {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface ImageCropperProps {
    imageSrc: string;
    aspectRatio?: number;
    onCropComplete: (croppedImage: string) => void;
    onCancel: () => void;
    isOpen: boolean;
}

export function ImageCropper({ imageSrc, aspectRatio = 1, onCropComplete, onCancel, isOpen }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onCropCompleteHandler = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener("load", () => resolve(image));
            image.addEventListener("error", (error) => reject(error));
            image.setAttribute("crossOrigin", "anonymous"); // needed to avoid cross-origin issues on CodeSandbox
            image.src = url;
        });

    const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<string> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            return "";
        }

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    console.error("Canvas is empty");
                    return;
                }
                const fileUrl = window.URL.createObjectURL(blob);
                resolve(fileUrl);
            }, "image/jpeg");
        });
    };

    const handleSave = async () => {
        if (!croppedAreaPixels) return;
        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels!);
            onCropComplete(croppedImage);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onCancel} title="Crop Image">
            <div className="flex flex-col h-[400px]">
                <div className="relative flex-1 bg-black rounded-xl overflow-hidden mb-4">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspectRatio}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteHandler}
                        onZoomChange={onZoomChange}
                    />
                </div>

                <div className="space-y-4 px-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Zoom</label>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                        <Button onClick={handleSave}>Apply Crop</Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
