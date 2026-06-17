# Fanly CI/CD, Docker, and Kubernetes Plan

## Current baseline

- Runtime: Bun with a Vite/TanStack Start app.
- Package manager lockfile: `bun.lock`.
- Production image target: SSR server listening on `0.0.0.0:3000`.
- Registry default: GitHub Container Registry (`ghcr.io`).
- Kubernetes namespace: `fanly`.

The current workspace is not a Git repository, and several app files are at the project root while `tsconfig.json` and some imports expect a `src/` layout. The new pipeline will surface that during `bun run lint` or `bun run build`; resolving the source layout should be the first hardening task before enabling protected deployments.

## CI/CD pipeline

The base GitHub Actions workflow lives at `.github/workflows/ci-cd.yml`.

It does three things:

1. Runs CI on pull requests and pushes: `bun install --frozen-lockfile`, `bun run lint`, and `bun run build`.
2. Builds and publishes a Docker image to `ghcr.io/<owner>/<repo>` on pushes to `main` and version tags.
3. Optionally deploys to Kubernetes from `main` when the repository variable `K8S_DEPLOY_ENABLED` is set to `true`.

Required deploy configuration:

- `K8S_DEPLOY_ENABLED=true` as a GitHub Actions repository variable.
- `KUBE_CONFIG` as a GitHub Actions secret, base64 encoded from the kubeconfig file.
- Package permissions enabled for GitHub Container Registry.

Recommended branch protections:

- Require the `Lint and build` job before merging to `main`.
- Require pull request review before merging.
- Restrict direct pushes to `main`.

## Dockerization

The base `Dockerfile` uses a multi-stage Bun build:

- `deps`: installs dependencies from `package.json`, `bun.lock`, and `bunfig.toml`.
- `build`: copies source and runs `bun run build`.
- `runtime`: copies `.output` and runs `.output/server/index.mjs`.

Local commands once Bun and Docker are available:

```sh
docker build -t fanly:local .
docker run --rm -p 3000:3000 fanly:local
```

If the TanStack build output differs from `.output/server/index.mjs`, update the Dockerfile `CMD` after confirming the actual production entrypoint.

## Kubernetes plan

The base manifests live in `k8s/` and can be applied with:

```sh
kubectl apply -k k8s
```

Included resources:

- `Namespace`: `fanly`
- `Deployment`: two replicas of the web container
- `Service`: internal ClusterIP service on port 80
- `Ingress`: nginx ingress with cert-manager TLS placeholder

Before production use:

- Replace `ghcr.io/your-org/fanly:latest` with the real image repository, or let the deploy workflow set the image after applying manifests.
- Replace `fanly.example.com` with the real host.
- Confirm the ingress class and certificate issuer match the cluster.
- Add any required application secrets as Kubernetes `Secret` objects or through an external secret manager.
- Add a dedicated health endpoint and point readiness/liveness probes at it.

## Next hardening steps

1. Normalize the source tree so `src/` imports, `tsconfig.json`, and actual files match.
2. Add automated tests and include them in CI before deployment.
3. Add a staging environment and promote immutable image tags from staging to production.
4. Add image vulnerability scanning and dependency review.
5. Add Kubernetes overlays for `staging` and `production`.
6. Add rollback documentation using `kubectl rollout undo deployment/fanly -n fanly`.
