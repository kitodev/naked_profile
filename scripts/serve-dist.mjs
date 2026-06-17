import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath, pathToFileURL } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const clientDir = resolve(rootDir, "dist/client");
const serverEntryPath = resolve(rootDir, "dist/server/server.js");
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

if (!existsSync(serverEntryPath)) {
  console.error(
    `Missing production server bundle at ${serverEntryPath}. Run npm run build before npm start.`,
  );
  process.exit(1);
}

const { default: app } = await import(pathToFileURL(serverEntryPath));

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

function resolveStaticPath(pathname) {
  const decodedPathname = decodeURIComponent(pathname);
  const normalizedPathname = normalize(decodedPathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = resolve(join(clientDir, normalizedPathname));

  if (filePath !== clientDir && !filePath.startsWith(`${clientDir}${sep}`)) {
    return undefined;
  }

  return filePath;
}

async function tryServeStatic(req, res, pathname) {
  if (req.method !== "GET" && req.method !== "HEAD") return false;

  const filePath = resolveStaticPath(pathname);
  if (!filePath) return false;

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) return false;

    res.statusCode = 200;
    res.setHeader(
      "content-type",
      contentTypes[extname(filePath).toLowerCase()] ?? "application/octet-stream",
    );
    res.setHeader("content-length", fileStat.size);

    if (pathname.startsWith("/assets/")) {
      res.setHeader("cache-control", "public, max-age=31536000, immutable");
    }

    if (req.method === "HEAD") {
      res.end();
      return true;
    }

    createReadStream(filePath).pipe(res);
    return true;
  } catch {
    return false;
  }
}

function toWebRequest(req) {
  const protocol =
    req.headers["x-forwarded-proto"]?.toString().split(",")[0] ?? "http";
  const hostHeader = req.headers.host ?? `localhost:${port}`;
  const url = new URL(req.url ?? "/", `${protocol}://${hostHeader}`);
  const headers = new Headers();

  for (const [name, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) headers.append(name, item);
    } else if (value !== undefined) {
      headers.set(name, value);
    }
  }

  return new Request(url, {
    method: req.method,
    headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : req,
    duplex: "half",
  });
}

async function sendWebResponse(res, webResponse) {
  res.statusCode = webResponse.status;
  res.statusMessage = webResponse.statusText;

  if (typeof webResponse.headers.getSetCookie === "function") {
    const setCookie = webResponse.headers.getSetCookie();
    if (setCookie.length > 0) res.setHeader("set-cookie", setCookie);
  }

  for (const [name, value] of webResponse.headers) {
    if (name.toLowerCase() !== "set-cookie") {
      res.setHeader(name, value);
    }
  }

  if (!webResponse.body) {
    res.end();
    return;
  }

  Readable.fromWeb(webResponse.body).pipe(res);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    if (await tryServeStatic(req, res, url.pathname)) return;

    const request = toWebRequest(req);
    const response = await app.fetch(request, process.env, {});
    await sendWebResponse(res, response);
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end("Internal Server Error");
  }
});

server.listen(port, host, () => {
  console.log(`Fanly web server listening on http://${host}:${port}`);
});
