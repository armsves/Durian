"use client";

import { useState, useRef } from "react";
import type { PutBlobResult } from "@vercel/blob";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  currentImage?: string;
  className?: string;
}

export function ImageUpload({ onUploadComplete, currentImage, className }: ImageUploadProps) {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      // Store the file in state
      setSelectedFile(file);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/upload?filename=${encodeURIComponent(selectedFile.name)}`,
        {
          method: "POST",
          body: selectedFile,
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const newBlob = (await response.json()) as PutBlobResult;
      setBlob(newBlob);
      onUploadComplete(newBlob.url);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    setPreview(null);
    setBlob(null);
    setSelectedFile(null);
    setError(null);
    if (inputFileRef.current) {
      inputFileRef.current.value = "";
    }
  };

  return (
    <div className={className}>
      <div 
        className="relative border-2 border-dashed rounded-xl p-6 text-center transition-all"
        style={{ 
          borderColor: preview ? "#C5A35E" : "#A8C2B9",
          backgroundColor: preview ? "rgba(197, 163, 94, 0.05)" : "rgba(168, 194, 185, 0.1)"
        }}
      >
        {preview ? (
          <div className="relative">
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#ef4444", color: "white" }}
            >
              <X className="w-4 h-4" />
            </button>
            {!blob && (
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="mt-4 w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                style={{ 
                  backgroundColor: isUploading ? "#A8C2B9" : "#C5A35E", 
                  color: "white" 
                }}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </>
                )}
              </button>
            )}
            {blob && (
              <div 
                className="mt-4 py-2 px-4 rounded-lg text-sm"
                style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#16a34a" }}
              >
                ✓ Image uploaded successfully
              </div>
            )}
          </div>
        ) : (
          <label className="cursor-pointer block">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: "rgba(168, 194, 185, 0.3)" }}
            >
              <ImageIcon className="w-8 h-8" style={{ color: "#5C6B5C" }} />
            </div>
            <p className="font-medium mb-1" style={{ color: "#000" }}>
              Click to select an image
            </p>
            <p className="text-sm" style={{ color: "#666" }}>
              PNG, JPG or WebP (max 5MB)
            </p>
            <input
              ref={inputFileRef}
              type="file"
              accept="image/jpeg, image/png, image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm" style={{ color: "#ef4444" }}>
          {error}
        </p>
      )}
    </div>
  );
}
