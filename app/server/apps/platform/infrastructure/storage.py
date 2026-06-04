from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

import boto3
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured


@dataclass(frozen=True)
class EvidenceStorageObject:
    key: str
    url: str | None = None


class EvidenceFileStorage(Protocol):
    def save(self, key: str, content: bytes, *, content_type: str | None = None) -> EvidenceStorageObject:
        ...

    def delete(self, key: str) -> None:
        ...


class LocalEvidenceStorage:
    def __init__(self, root: Path | str):
        self.root = Path(root)

    def save(self, key: str, content: bytes, *, content_type: str | None = None) -> EvidenceStorageObject:
        safe_key = _normalize_key(key)
        target = self.root / safe_key
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(content)
        return EvidenceStorageObject(key=safe_key, url=str(target))

    def delete(self, key: str) -> None:
        safe_key = _normalize_key(key)
        target = self.root / safe_key
        if target.exists():
            target.unlink()


class CloudflareR2EvidenceStorage:
    def __init__(
        self,
        *,
        endpoint_url: str,
        access_key_id: str,
        secret_access_key: str,
        bucket: str,
    ):
        missing = [
            name
            for name, value in {
                "CLOUDFLARE_R2_ENDPOINT_URL": endpoint_url,
                "CLOUDFLARE_R2_ACCESS_KEY_ID": access_key_id,
                "CLOUDFLARE_R2_SECRET_ACCESS_KEY": secret_access_key,
                "CLOUDFLARE_R2_BUCKET": bucket,
            }.items()
            if not value
        ]
        if missing:
            raise ImproperlyConfigured(
                "R2 evidence storage is missing settings: " + ", ".join(missing)
            )

        self.bucket = bucket
        self.client = boto3.client(
            "s3",
            endpoint_url=endpoint_url,
            aws_access_key_id=access_key_id,
            aws_secret_access_key=secret_access_key,
        )

    def save(self, key: str, content: bytes, *, content_type: str | None = None) -> EvidenceStorageObject:
        safe_key = _normalize_key(key)
        extra_args = {}
        if content_type:
            extra_args["ContentType"] = content_type

        self.client.put_object(
            Bucket=self.bucket,
            Key=safe_key,
            Body=content,
            **extra_args,
        )
        return EvidenceStorageObject(key=safe_key)

    def delete(self, key: str) -> None:
        safe_key = _normalize_key(key)
        self.client.delete_object(Bucket=self.bucket, Key=safe_key)


def get_evidence_storage() -> EvidenceFileStorage:
    backend = settings.EVIDENCE_STORAGE_BACKEND
    if backend == "local":
        return LocalEvidenceStorage(settings.EVIDENCE_STORAGE_LOCAL_ROOT)
    if backend == "r2":
        return CloudflareR2EvidenceStorage(
            endpoint_url=settings.CLOUDFLARE_R2_ENDPOINT_URL,
            access_key_id=settings.CLOUDFLARE_R2_ACCESS_KEY_ID,
            secret_access_key=settings.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
            bucket=settings.CLOUDFLARE_R2_BUCKET,
        )
    raise ImproperlyConfigured(f"Unsupported EVIDENCE_STORAGE_BACKEND: {backend}")


def _normalize_key(key: str) -> str:
    normalized = key.strip().replace("\\", "/")
    if not normalized or normalized.startswith("/") or ".." in normalized.split("/"):
        raise ValueError("Evidence storage key must be a relative path without traversal.")
    return normalized
