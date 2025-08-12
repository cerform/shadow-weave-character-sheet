import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Trash2, Copy, RefreshCcw } from "lucide-react";

interface StoredFile {
  name: string;
  id?: string;
  created_at?: string;
  updated_at?: string;
  last_accessed_at?: string;
  metadata?: Record<string, any> | null;
}

const BUCKET = "models";

export const ModelUploader: React.FC = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState("");

  const filteredFiles = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return files;
    return files.filter(f => f.name.toLowerCase().includes(q));
  }, [files, filter]);

  const listFiles = async () => {
    setLoading(true);
    const { data, error } = await supabase.storage.from(BUCKET).list("", {
      limit: 1000,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    } else {
      setFiles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    listFiles();
  }, []);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    setUploading(true);

    for (const file of Array.from(fileList)) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ext || !["glb", "gltf"].includes(ext)) {
        toast({ title: "Неверный формат", description: `Поддерживаются только .glb/.gltf (файл: ${file.name})`, variant: "destructive" });
        continue;
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${Date.now()}-${safeName}`;

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          upsert: true,
          contentType: file.type || (ext === "glb" ? "model/gltf-binary" : "model/gltf+json"),
        });

      if (error) {
        toast({ title: "Ошибка загрузки", description: `${file.name}: ${error.message}`, variant: "destructive" });
      } else {
        toast({ title: "Загружено", description: file.name });
      }
    }

    setUploading(false);
    await listFiles();
    // reset input value so same file can be uploaded again
    e.target.value = "";
  };

  const copyPublicUrl = (name: string) => {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(name);
    const url = data.publicUrl;
    navigator.clipboard.writeText(url);
    toast({ title: "Ссылка скопирована", description: url });
  };

  const removeFile = async (name: string) => {
    const { error } = await supabase.storage.from(BUCKET).remove([name]);
    if (error) {
      toast({ title: "Ошибка удаления", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Удалено", description: name });
      setFiles(prev => prev.filter(f => f.name !== name));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>3D модели (.glb/.gltf)</span>
          <Badge variant="destructive">Admin Only</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-2">
              <Input type="file" accept=".glb,.gltf" multiple onChange={onUpload} className="hidden" id="glb-input" />
              <Button asChild disabled={uploading}>
                <label htmlFor="glb-input" className="cursor-pointer">
                  {uploading ? (
                    <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Загрузка...</span>
                  ) : (
                    <span className="inline-flex items-center gap-2"><Upload className="h-4 w-4" /> Загрузить</span>
                  )}
                </label>
              </Button>
            </label>
            <Button variant="outline" onClick={listFiles} disabled={loading}>
              <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Обновить
            </Button>
          </div>
          <div className="md:ml-auto w-full md:w-64">
            <Input placeholder="Фильтр по имени..." value={filter} onChange={(e) => setFilter(e.target.value)} />
          </div>
        </div>

        <div className="border rounded-md divide-y max-h-[360px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Загрузка списка...
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">Файлов пока нет</div>
          ) : (
            filteredFiles.map((f) => {
              const { data } = supabase.storage.from(BUCKET).getPublicUrl(f.name);
              const url = data.publicUrl;
              return (
                <div key={f.name} className="p-3 flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{f.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{url}</div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => copyPublicUrl(f.name)}>
                    <Copy className="h-4 w-4 mr-1" /> Копировать
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => removeFile(f.name)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Удалить
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
