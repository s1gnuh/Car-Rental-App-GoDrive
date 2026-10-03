# Tạo gói godrive-deploy.zip để upload lên hosting (InfinityFree...).
# - Gắn số phiên bản mới vào version.json và các đường dẫn ?v= trong HTML để trình duyệt tải bản mới.
# - KHÔNG chứa thư mục data/ để không ghi đè dữ liệu thật trên server.
#
# Cách chạy (PowerShell, trong thư mục dự án):
#   powershell -ExecutionPolicy Bypass -File .\build-deploy.ps1
# File zip được tạo ở thư mục cha: ..\godrive-deploy.zip

param(
    [string]$Out = (Join-Path (Split-Path $PSScriptRoot -Parent) "godrive-deploy.zip")
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = $PSScriptRoot
$utf8 = New-Object System.Text.UTF8Encoding($false)
$version = Get-Date -Format "yyyy.MM.dd-HHmm"

# 1. Cập nhật số phiên bản
[System.IO.File]::WriteAllText((Join-Path $root "version.json"), "{`"version`": `"$version`"}`n", $utf8)
foreach ($page in @("index.html", "admin.html")) {
    $path = Join-Path $root $page
    $html = [System.IO.File]::ReadAllText($path, $utf8)
    $html = [regex]::Replace($html, '\?v=[0-9A-Za-z.\-]+', "?v=$version")
    $html = [regex]::Replace($html, '(name="app-version" content=")[^"]*', "`${1}$version")
    [System.IO.File]::WriteAllText($path, $html, $utf8)
}

# 2. Nén các file cần upload (đường dẫn dùng dấu / cho server Linux)
$items = @("index.html", "admin.html", ".htaccess", "version.json", "api", "css", "js")
if ([System.IO.File]::Exists($Out)) { [System.IO.File]::Delete($Out) }
$zip = [System.IO.Compression.ZipFile]::Open($Out, "Create")
try {
    foreach ($item in $items) {
        $full = Join-Path $root $item
        if ((Get-Item -LiteralPath $full -Force).PSIsContainer) {
            Get-ChildItem -LiteralPath $full -Recurse -File -Force | ForEach-Object {
                $rel = $_.FullName.Substring($root.Length + 1).Replace([string][char]92, "/")
                [void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $rel, "Optimal")
            }
        } else {
            [void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $full, $item, "Optimal")
        }
    }
} finally {
    $zip.Dispose()
}

$reader = [System.IO.Compression.ZipFile]::OpenRead($Out)
$count = $reader.Entries.Count
$reader.Dispose()
Write-Host "Da tao $Out ($count file) - phien ban $version"
Write-Host "Upload vao htdocs, Extract (Overwrite), roi bam 'Tai lai ban moi nhat' tren trang admin."
