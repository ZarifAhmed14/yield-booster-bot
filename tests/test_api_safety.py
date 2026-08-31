import asyncio
import io
import unittest

from fastapi import HTTPException, Request, UploadFile
from PIL import Image
from starlette.datastructures import Headers

from ml.server import health, predict


class ApiSafetyTest(unittest.TestCase):
    @staticmethod
    def upload(content: bytes, content_type: str, filename: str = "leaf.jpg") -> UploadFile:
        return UploadFile(file=io.BytesIO(content), filename=filename, headers=Headers({"content-type": content_type}))

    @staticmethod
    def request() -> Request:
        return Request({"type": "http", "client": ("unit-test", 1234)})

    def test_health_reports_research_only_model(self):
        payload = health()
        self.assertEqual(payload["status"], "ready")
        self.assertFalse(payload["field_validated"])
        self.assertAlmostEqual(payload["regional_test_accuracy"], 0.5118840579710144)

    def test_valid_image_fails_closed_until_field_validation(self):
        image = Image.effect_noise((256, 256), 50).convert("RGB")
        content = io.BytesIO()
        image.save(content, format="JPEG")
        payload = asyncio.run(predict(self.request(), self.upload(content.getvalue(), "image/jpeg")))
        self.assertEqual(payload["label"], "unknown")
        self.assertIn("field_validation_pending", payload["rejection_reasons"])
        self.assertIn("১৬১২৩", payload["next_steps"]["bn"][2])
        self.assertIn("ওষুধ", payload["next_steps"]["bn"][2])

    def test_rejects_spoofed_image_upload(self):
        with self.assertRaises(HTTPException) as caught:
            asyncio.run(predict(self.request(), self.upload(b"not an image", "image/jpeg", "fake.jpg")))
        self.assertEqual(caught.exception.status_code, 400)

    def test_rejects_disallowed_mime_type(self):
        with self.assertRaises(HTTPException) as caught:
            asyncio.run(predict(self.request(), self.upload(b"<svg/>", "image/svg+xml", "leaf.svg")))
        self.assertEqual(caught.exception.status_code, 415)


if __name__ == "__main__":
    unittest.main()
