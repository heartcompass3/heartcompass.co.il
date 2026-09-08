import fs from "fs";
import path from "path";
import { getCliClient } from "sanity/cli";

const API_VERSION = "2026-08-07";
const DOCUMENT_ID = "83b161f4-11a6-4d25-843a-2a6aeacefaee";

const pdfPath = process.env.GUIDE_PDF_PATH;
const imagePath = process.env.GUIDE_IMAGE_PATH;

if (!pdfPath || !fs.existsSync(pdfPath)) {
  console.error(`PDF not found: ${pdfPath || "(missing GUIDE_PDF_PATH)"}`);
  process.exit(1);
}

if (!imagePath || !fs.existsSync(imagePath)) {
  console.error(`Image not found: ${imagePath || "(missing GUIDE_IMAGE_PATH)"}`);
  process.exit(1);
}

const client = getCliClient({ apiVersion: API_VERSION }).withConfig({ useCdn: false });

const content = [
  {
    _type: "block",
    _key: "intro",
    style: "normal",
    markDefs: [],
    children: [
      {
        _type: "span",
        _key: "intro1",
        text:
          "המדריך הזה לא חוזר על עוד שיחה שנגמרת ב'בסדר'. הוא עוזר לכם לעצור רגע לפני השאלה הבאה, לזהות מאיפה אתם שואלים, וליצור בבית שיחה שיש בה פחות לחץ ויותר אוויר.",
      },
    ],
  },
  {
    _type: "block",
    _key: "pattern-heading",
    style: "h2",
    markDefs: [],
    children: [{ _type: "span", _key: "pattern-heading-span", text: "מה תראו אחרת אחרי הקריאה" }],
  },
  {
    _type: "block",
    _key: "pattern-body",
    style: "normal",
    markDefs: [],
    children: [
      {
        _type: "span",
        _key: "pattern-body-span",
        text:
          "תראו איך אותה שאלה יכולה להישמע כמו התעניינות או כמו לחץ, למה מתבגר עונה בקצרה גם כשהוא צריך אתכם, ומה אתם יכולים לשנות בקצב, בטון ובנוכחות לפני שאתם משנים את המילים.",
      },
    ],
  },
  {
    _type: "block",
    _key: "practice-heading",
    style: "h2",
    markDefs: [],
    children: [{ _type: "span", _key: "practice-heading-span", text: "מה תקבלו בפנים" }],
  },
  {
    _type: "block",
    _key: "practice-body",
    style: "normal",
    markDefs: [],
    children: [
      {
        _type: "span",
        _key: "practice-body-span",
        text:
          "שלוש החלפות פשוטות לשיחה יומיומית, משפט שאפשר לומר כשאתם כבר בתוך חקירה, ותרגיל של שבעה ימים שמחזיר לבית קצת פחות מתח סביב שיחות.",
      },
    ],
  },
];

async function main() {
  const [pdfAsset, imageAsset] = await Promise.all([
    client.assets.upload("file", fs.createReadStream(pdfPath), {
      filename: "teen-conversation-guide.pdf",
      contentType: "application/pdf",
    }),
    client.assets.upload("image", fs.createReadStream(imagePath), {
      filename: "teen-conversation-guide-hero.png",
      contentType: "image/png",
    }),
  ]);

  const updated = await client
    .patch(DOCUMENT_ID)
    .set({
      subtitle:
        "מדריך קצר להורים למתבגרים שרוצים לשאול פחות מתוך לחץ, ולהגיע לשיחה ממקום רגוע יותר.",
      bullets: [
        "איך לזהות אם השאלה שלכם מגיעה מסקרנות או מבהלה",
        "למה מתבגר עונה בקצרה גם כשהוא כן צריך אתכם",
        "שלוש החלפות פשוטות במקום עוד שאלה שמלחיצה",
        "תרגיל של שבעה ימים להורדת המתח סביב שיחות בבית",
      ],
      content,
      seoDescription:
        "מדריך להורים למתבגרים: איך לשאול פחות מתוך לחץ, להוריד תחושת חקירה, ולפתוח שיחה שיש בה יותר אוויר.",
      toolTagline: "מדריך קצר להורים שרוצים להוריד לחץ מהשיחה עם המתבגר",
      mainImage: {
        _type: "image",
        asset: { _type: "reference", _ref: imageAsset._id },
      },
      leadMagnet: {
        _type: "file",
        asset: { _type: "reference", _ref: pdfAsset._id },
      },
    })
    .commit();

  console.log(
    JSON.stringify(
      {
        documentId: updated._id,
        pdfAssetId: pdfAsset._id,
        pdfUrl: pdfAsset.url,
        imageAssetId: imageAsset._id,
        imageUrl: imageAsset.url,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
