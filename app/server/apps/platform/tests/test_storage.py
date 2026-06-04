from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import Mock, patch

from django.core.exceptions import ImproperlyConfigured
from django.test import SimpleTestCase, override_settings

from apps.platform.infrastructure.storage import (
    CloudflareR2EvidenceStorage,
    LocalEvidenceStorage,
    get_evidence_storage,
)


class LocalEvidenceStorageTests(SimpleTestCase):
    def test_save_writes_relative_key_under_root(self):
        with TemporaryDirectory() as temp_dir:
            storage = LocalEvidenceStorage(temp_dir)

            saved = storage.save("accounts/1/evidence.txt", b"proof")

            self.assertEqual(saved.key, "accounts/1/evidence.txt")
            self.assertEqual(Path(saved.url).read_bytes(), b"proof")
            self.assertTrue(str(saved.url).startswith(temp_dir))

    def test_rejects_path_traversal_keys(self):
        with TemporaryDirectory() as temp_dir:
            storage = LocalEvidenceStorage(temp_dir)

            with self.assertRaises(ValueError):
                storage.save("../secret.txt", b"proof")


class EvidenceStorageFactoryTests(SimpleTestCase):
    @override_settings(EVIDENCE_STORAGE_BACKEND="local", EVIDENCE_STORAGE_LOCAL_ROOT="/tmp/evidence")
    def test_factory_returns_local_storage_by_default(self):
        storage = get_evidence_storage()

        self.assertIsInstance(storage, LocalEvidenceStorage)

    @override_settings(EVIDENCE_STORAGE_BACKEND="unknown")
    def test_factory_rejects_unknown_backend(self):
        with self.assertRaisesMessage(ImproperlyConfigured, "Unsupported EVIDENCE_STORAGE_BACKEND"):
            get_evidence_storage()


class CloudflareR2EvidenceStorageTests(SimpleTestCase):
    def test_requires_credentials(self):
        with self.assertRaisesMessage(ImproperlyConfigured, "R2 evidence storage is missing settings"):
            CloudflareR2EvidenceStorage(
                endpoint_url="",
                access_key_id="",
                secret_access_key="",
                bucket="achievno-evidence-dev",
            )

    @patch("apps.platform.infrastructure.storage.boto3.client")
    def test_save_puts_object_in_configured_bucket(self, boto3_client):
        client = Mock()
        boto3_client.return_value = client
        storage = CloudflareR2EvidenceStorage(
            endpoint_url="https://example.r2.cloudflarestorage.com",
            access_key_id="key",
            secret_access_key="secret",
            bucket="achievno-evidence-dev",
        )

        saved = storage.save("evidence/item.txt", b"proof", content_type="text/plain")

        self.assertEqual(saved.key, "evidence/item.txt")
        client.put_object.assert_called_once_with(
            Bucket="achievno-evidence-dev",
            Key="evidence/item.txt",
            Body=b"proof",
            ContentType="text/plain",
        )
