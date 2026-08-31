import unittest

from PIL import Image

from ml.inference_policy import image_quality, should_reject


class InferencePolicyTest(unittest.TestCase):
    def test_accepts_clear_confident_result(self):
        self.assertFalse(should_reject(0.90, 0.60, []))

    def test_rejects_low_confidence_small_margin_or_bad_image(self):
        self.assertTrue(should_reject(0.60, 0.40, []))
        self.assertTrue(should_reject(0.90, 0.10, []))
        self.assertTrue(should_reject(0.90, 0.60, ["too_dark"]))

    def test_explains_dark_and_bright_photos(self):
        self.assertIn("too_dark", image_quality(Image.new("RGB", (256, 256), "black"))["issues"])
        self.assertIn("too_bright", image_quality(Image.new("RGB", (256, 256), "white"))["issues"])


if __name__ == "__main__":
    unittest.main()
