import { useState } from "react";
import { Input } from "./input";
import { Label } from "./label";
import { Button } from "./button";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Link as LinkIcon, X } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket: "warehouse-images" | "tool-images";
  label?: string;
}

export function ImageUpload({ value, onChange, bucket, label = "Image" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [useUrl, setUseUrl] = useState(!!value && value.startsWith("http"));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    onChange(url);
  };

  const clearImage = () => {
    onChange("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant={!useUrl ? "default" : "outline"}
          size="sm"
          onClick={() => setUseUrl(false)}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload File
        </Button>
        <Button
          type="button"
          variant={useUrl ? "default" : "outline"}
          size="sm"
          onClick={() => setUseUrl(true)}
        >
          <LinkIcon className="w-4 h-4 mr-2" />
          Use URL
        </Button>
      </div>

      {useUrl ? (
        <div className="space-y-2">
          <Label htmlFor="image-url">{label} URL</Label>
          <Input
            id="image-url"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={value}
            onChange={(e) => handleUrlChange(e.target.value)}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="image-file">{label} File</Label>
          <Input
            id="image-file"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
        </div>
      )}

      {value && (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={clearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
