import { useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Download,
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Loader2,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

type ToastTone = "success" | "warning" | "error";

type FileLibraryProps = {
  showToast: (message: string, tone?: ToastTone) => void;
};

const MAX_FILE_SIZE = 12 * 1024 * 1024;
const categories = [
  "All files",
  "Receiving",
  "Inventory",
  "Orders",
  "Reports",
] as const;
type UploadCategory = "Receiving" | "Inventory" | "Orders" | "Reports";
type CategoryFilter = (typeof categories)[number];

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function iconForMime(mimeType: string) {
  if (mimeType.startsWith("image/")) return FileImage;
  if (
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel") ||
    mimeType.includes("csv")
  )
    return FileSpreadsheet;
  if (mimeType.includes("pdf") || mimeType.startsWith("text/")) return FileText;
  return File;
}

export default function FileLibrary({ showToast }: FileLibraryProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<CategoryFilter>("All files");
  const [search, setSearch] = useState("");
  const [uploadCategory, setUploadCategory] =
    useState<UploadCategory>("Receiving");
  const [dragActive, setDragActive] = useState(false);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const filesQuery = trpc.files.list.useQuery();
  const utils = trpc.useUtils();
  const uploadMutation = trpc.files.upload.useMutation({
    onSuccess: () => {
      void utils.files.list.invalidate();
      showToast("File uploaded to the warehouse workspace.", "success");
    },
    onError: error =>
      showToast(error.message || "Upload failed. Try again.", "error"),
  });
  const removeMutation = trpc.files.remove.useMutation({
    onSuccess: () => {
      void utils.files.list.invalidate();
      setConfirmingId(null);
      showToast("File removed from the workspace index.", "success");
    },
    onError: error =>
      showToast(error.message || "Could not remove that file.", "error"),
  });

  const files = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return (filesQuery.data ?? []).filter(file => {
      const matchesCategory =
        category === "All files" || file.category === category;
      const matchesSearch =
        !normalizedSearch ||
        `${file.name} ${file.category} ${file.mimeType}`
          .toLowerCase()
          .includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });
  }, [category, filesQuery.data, search]);

  const uploadFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      showToast("Files must be smaller than 12 MB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      const data = dataUrl.includes(",") ? dataUrl.split(",", 2)[1] : dataUrl;
      if (!data) {
        showToast("This file could not be read.", "error");
        return;
      }
      uploadMutation.mutate({
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        category: uploadCategory,
        data,
      });
    };
    reader.onerror = () => showToast("This file could not be read.", "error");
    reader.readAsDataURL(file);
  };

  const handleSelectedFiles = (filesToUpload: FileList | File[]) => {
    const file = filesToUpload[0];
    if (file) uploadFile(file);
  };

  return (
    <div className="fade-up">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8a96a7]">
            Workspace files · S3-backed
          </div>
          <h1 className="font-display text-[30px] font-bold tracking-[-0.05em] text-[#253246] sm:text-[36px]">
            File storage
          </h1>
          <p className="mt-2 max-w-[650px] text-[13px] leading-6 text-[#7d8999]">
            Keep receiving paperwork, inventory exports, order documents, and
            reports in one traceable workspace library.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-[#2fa36b]">
          <span className="h-2 w-2 rounded-full bg-[#2fa36b]" />
          Secure object storage connected
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
        <section className="soft-card rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col gap-3 border-b border-[#eef1f4] pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#8a96a7]">
                Document library
              </div>
              <div className="mt-1 text-[12px] font-semibold text-[#526176]">
                {files.length} {files.length === 1 ? "file" : "files"} visible
              </div>
            </div>
            <div className="input-shell flex h-10 w-full items-center gap-2 rounded-xl px-3 md:max-w-[260px]">
              <Search size={14} className="text-[#9aa6b6]" />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search files"
                className="w-full bg-transparent text-[12px] text-[#334155] outline-none"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-1 overflow-x-auto pb-1">
            {categories.map(item => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={cx(
                  "whitespace-nowrap rounded-xl px-3 py-2 text-[11px] font-bold transition",
                  category === item
                    ? "bg-[#202a38] text-white"
                    : "text-[#7a8798] hover:bg-[#f2f5f8]"
                )}
              >
                {item}
              </button>
            ))}
          </div>
          {filesQuery.isLoading ? (
            <div className="flex min-h-[280px] items-center justify-center text-[#8a96a7]">
              <Loader2 size={18} className="animate-spin" />
            </div>
          ) : files.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#dfe6ee] bg-[#fbfcfd] px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0ec] text-[#f2684b]">
                <FolderOpen size={22} />
              </div>
              <h2 className="mt-4 font-display text-[18px] font-bold text-[#334155]">
                No files here yet
              </h2>
              <p className="mt-2 max-w-[380px] text-[12px] leading-5 text-[#8a96a7]">
                Upload a receiving slip, product sheet, or operational report to
                make it available to the whole warehouse team.
              </p>
              <button
                onClick={() => inputRef.current?.click()}
                className="btn-press mt-5 flex h-10 items-center gap-2 rounded-xl bg-[#f2684b] px-4 text-[11px] font-bold text-white shadow-[0_8px_18px_rgba(242,104,75,0.18)]"
              >
                <UploadCloud size={15} />
                Upload first file
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {files.map(file => {
                const Icon = iconForMime(file.mimeType);
                const isConfirming = confirmingId === file.id;
                return (
                  <div
                    key={file.id}
                    className="flex flex-col gap-3 rounded-2xl border border-[#e8edf2] bg-white p-3 transition hover:border-[#cbd7e4] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef3ff] text-[#5c8dff]">
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[12px] font-bold text-[#334155]">
                          {file.name}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] font-medium text-[#9aa6b6]">
                          <span>{file.category}</span>
                          <span>·</span>
                          <span>{formatBytes(file.sizeBytes)}</span>
                          <span>·</span>
                          <span>{formatDate(file.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:shrink-0">
                      {isConfirming ? (
                        <>
                          <span className="text-[10px] font-bold text-[#a6444a]">
                            Remove file?
                          </span>
                          <button
                            disabled={removeMutation.isPending}
                            onClick={() =>
                              removeMutation.mutate({ id: file.id })
                            }
                            className="rounded-lg bg-[#fde9e9] px-2.5 py-2 text-[10px] font-bold text-[#a6444a]"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmingId(null)}
                            className="rounded-lg border border-[#e2e7ee] px-2.5 py-2 text-[10px] font-bold text-[#7d8999]"
                          >
                            No
                          </button>
                        </>
                      ) : (
                        <>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 rounded-lg border border-[#dce3eb] px-2.5 py-2 text-[10px] font-bold text-[#526176] hover:bg-[#f6f8fa]"
                          >
                            <Download size={13} />
                            Open
                          </a>
                          <button
                            onClick={() => setConfirmingId(file.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a0abba] hover:bg-[#fde9e9] hover:text-[#a6444a]"
                            aria-label={`Remove ${file.name}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div
            className={cx(
              "rounded-2xl border-2 border-dashed p-5 transition",
              dragActive
                ? "border-[#f2684b] bg-[#fff8f6]"
                : "border-[#dce4ed] bg-[#fbfcfd]"
            )}
            onDragEnter={event => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragOver={event => event.preventDefault()}
            onDragLeave={() => setDragActive(false)}
            onDrop={event => {
              event.preventDefault();
              setDragActive(false);
              handleSelectedFiles(event.dataTransfer.files);
            }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff0ec] text-[#f2684b]">
              <UploadCloud size={19} />
            </div>
            <h2 className="mt-4 font-display text-[18px] font-bold text-[#334155]">
              Upload a file
            </h2>
            <p className="mt-1 text-[11px] leading-5 text-[#8a96a7]">
              PDF, CSV, XLSX, JPG, PNG, or any document under 12 MB.
            </p>
            <label className="mt-4 block text-[10px] font-bold uppercase tracking-[0.1em] text-[#8a96a7]">
              Workspace category
              <select
                value={uploadCategory}
                onChange={event =>
                  setUploadCategory(event.target.value as UploadCategory)
                }
                className="input-shell mt-2 h-10 w-full rounded-xl bg-white px-3 text-[11px] font-semibold text-[#334155] outline-none"
              >
                <option>Receiving</option>
                <option>Inventory</option>
                <option>Orders</option>
                <option>Reports</option>
              </select>
            </label>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={event => {
                if (event.target.files) handleSelectedFiles(event.target.files);
                event.currentTarget.value = "";
              }}
            />
            <button
              disabled={uploadMutation.isPending}
              onClick={() => inputRef.current?.click()}
              className="btn-press mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#202a38] text-[11px] font-bold text-white hover:bg-[#2d3a4c] disabled:opacity-60"
            >
              {uploadMutation.isPending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <UploadCloud size={15} />
              )}
              {uploadMutation.isPending ? "Uploading…" : "Choose file"}
            </button>
            <div className="mt-3 flex items-center gap-2 text-[10px] leading-4 text-[#9aa6b6]">
              <CheckCircle2 size={13} className="shrink-0 text-[#2fa36b]" />
              Bytes go to storage; only metadata is saved in the database.
            </div>
          </div>
          <div className="rounded-2xl bg-[#202a38] p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#aeb9c7]">
                Storage guidance
              </div>
              <button
                onClick={() => setSearch("")}
                className="text-[#95a2b4] hover:text-white"
                aria-label="Clear file search"
              >
                <X size={14} />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-[11px] leading-5 text-[#c4ccd7]">
              <p>
                Use categories to keep receiving slips, catalog exports, orders,
                and reports easy to find.
              </p>
              <p>
                Removing a file clears its database reference. Storage objects
                remain unlinked and inaccessible through the workspace.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
