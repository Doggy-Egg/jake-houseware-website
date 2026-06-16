"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type UploadedItemNoRow = {
  itemNo: string;
  key: string;
  hasImage: boolean;
  status: string;
};

type UploadedItemNoResponse = {
  total: number;
  withImage: number;
  withoutImage: number;
  itemNos: UploadedItemNoRow[];
};

const DEFAULT_SOURCE = "~/Desktop/chinajake_images/images";
const DEFAULT_OUTPUT = "~/Desktop/chinajake_images/images_pending_upload";

export function LocalLibrarySyncPanel() {
  const [data, setData] = useState<UploadedItemNoResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/admin/products/uploaded-item-nos")
      .then(async (response) => {
        if (!response.ok) {
          const body = (await response.json()) as { message?: string };
          throw new Error(body.message ?? "读取失败");
        }
        return response.json() as Promise<UploadedItemNoResponse>;
      })
      .then((payload) => {
        setData(payload);
        setError("");
      })
      .catch((fetchError: unknown) => {
        setError(
          fetchError instanceof Error ? fetchError.message : "读取已上传货号失败",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const command = useMemo(
    () =>
      [
        "npm run images:prune-uploaded -- --force",
        "# 自定义路径示例：",
        `npm run images:prune-uploaded -- --force --source ${DEFAULT_SOURCE} --output ${DEFAULT_OUTPUT}`,
      ].join("\n"),
    [],
  );

  const downloadCsv = () => {
    if (!data) return;

    const lines = [
      "item_no,has_image,status",
      ...data.itemNos.map(
        (row) =>
          `${row.itemNo},${row.hasImage ? "yes" : "no"},${row.status}`,
      ),
    ];
    const blob = new Blob([`${lines.join("\n")}\n`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "uploaded-item-nos.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">本地图库对比</h1>
          <p className="mt-1 text-sm text-muted">
            统计网站已上传货号，并在本地复制一份图库后剔除已上传图片，方便查看还剩哪些没传。
          </p>
        </div>
        <Button href="/admin/products" variant="outline">
          返回产品列表
        </Button>
      </div>

      <section className="rounded-sm border border-border bg-surface p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
          网站已上传货号
        </h2>
        {loading ? (
          <p className="text-sm text-muted">加载中...</p>
        ) : error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : data ? (
          <>
            <dl className="grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-sm text-muted">产品总数</dt>
                <dd className="mt-1 text-2xl font-semibold">{data.total}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">已有图片</dt>
                <dd className="mt-1 text-2xl font-semibold">{data.withImage}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">尚无图片</dt>
                <dd className="mt-1 text-2xl font-semibold">
                  {data.withoutImage}
                </dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" onClick={downloadCsv}>
                下载货号清单 CSV
              </Button>
            </div>
          </>
        ) : null}
      </section>

      <section className="rounded-sm border border-border bg-surface p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
          生成本地「待上传」文件夹
        </h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-foreground">
          <li>
            在项目根目录运行下方命令（会先<strong>完整复制</strong>本地图库，不会改动原始
            <code>images</code> 文件夹）。
          </li>
          <li>
            默认输出到{" "}
            <code>~/Desktop/chinajake_images/images_pending_upload</code>
            ，并自动跳过 <code>电子目录更新 catalog-update</code> 备份目录。
          </li>
          <li>
            复制完成后，从输出文件夹里删除文件名能匹配到已上传货号的图片。
          </li>
          <li>
            输出目录里剩下的，就是还需要上传或改名的图片；详细报告见{" "}
            <code>prune-uploaded-report.json</code>。
          </li>
        </ol>

        <pre className="overflow-x-auto rounded-sm bg-muted-bg p-4 text-xs text-foreground">
          {command}
        </pre>

        <p className="text-xs text-muted">
          可选参数：<code>--require-image</code> 只把「网站上已有图片」的货号视为已上传；{" "}
          <code>--include-catalog</code> 包含电子目录备份文件夹；{" "}
          <code>--source</code> / <code>--output</code> 自定义路径。
        </p>
      </section>

      {data ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted">
            已上传货号 ({data.total})
          </h2>
          <div className="overflow-hidden rounded-sm border border-border bg-surface">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-muted-bg text-xs uppercase tracking-widest text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Item No.</th>
                  <th className="px-5 py-3 font-medium">图片</th>
                  <th className="px-5 py-3 font-medium">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.itemNos.map((row) => (
                  <tr key={row.key}>
                    <td className="px-5 py-3 font-medium">{row.itemNo}</td>
                    <td className="px-5 py-3">
                      {row.hasImage ? "有" : "无"}
                    </td>
                    <td className="px-5 py-3">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="text-xs text-muted">
        文件名匹配规则与批量上传一致：支持 JK/JH/BA/WA/SH/M 货号；带后缀的文件名（如{" "}
        <code>JKCC01 P-Painted.jpg</code>）也会尝试匹配 <code>JKCC01</code>。
      </p>
    </div>
  );
}
