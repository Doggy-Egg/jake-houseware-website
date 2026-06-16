type UploadApiPayload = {
  action?: "created" | "updated" | "skipped";
  itemNo?: string;
  message?: string;
};

export async function readAdminUploadResponse(response: Response): Promise<{
  ok: boolean;
  status: number;
  data: UploadApiPayload;
  message: string;
}> {
  const status = response.status;
  const contentType = response.headers.get("content-type") ?? "";
  let data: UploadApiPayload = {};
  let message = "";

  try {
    if (contentType.includes("application/json")) {
      data = (await response.json()) as UploadApiPayload;
      message = data.message ?? "";
    } else {
      const text = (await response.text()).trim();
      message =
        text.length > 0
          ? text.slice(0, 200)
          : `HTTP ${status}${response.statusText ? ` ${response.statusText}` : ""}`;
    }
  } catch {
    message = `HTTP ${status}（响应无法解析）`;
  }

  if (!message) {
    if (status === 401) message = "未登录或登录已过期，请重新登录";
    else if (status === 413) message = "请求体过大（Vercel 上限约 4.5MB）";
    else if (status === 502 || status === 503 || status === 504) {
      message = `服务端异常 (${status})，请查看 Vercel 日志`;
    } else if (!response.ok) {
      message = `请求失败 (HTTP ${status})`;
    }
  }

  return { ok: response.ok, status, data, message };
}

export function formatAdminUploadFetchError(error: unknown): string {
  if (error instanceof TypeError) {
    return "无法连接服务器（请确认 dev 是否在运行，或检查网络）";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "网络错误";
}
