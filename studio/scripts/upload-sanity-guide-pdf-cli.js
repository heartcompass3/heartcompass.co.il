import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getCliClient } from "sanity/cli";

const API_VERSION = "2026-08-07";
const DRAFT_ID = "drafts.83b161f4-11a6-4d25-843a-2a6aeacefaee";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pdfPath = process.env.GUIDE_PDF_PATH
  ? path.resolve(process.env.GUIDE_PDF_PATH)
  : path.resolve(__dirname, "..", "..", "pdf", "teen-conversation-guide.pdf");

if (!fs.existsSync(pdfPath)) {
  console.error(`PDF not found: ${pdfPath}`);
  process.exit(1);
}

const client = getCliClient({ apiVersion: API_VERSION }).withConfig({ useCdn: false });

async function main() {
  const asset = await client.assets.upload("file", fs.createReadStream(pdfPath), {
    filename: "teen-conversation-guide.pdf",
    contentType: "application/pdf",
  });

  await client
    .patch(DRAFT_ID)
    .set({
      leadMagnet: {
        _type: "file",
        asset: {
          _type: "reference",
          _ref: asset._id,
        },
      },
    })
    .commit();

  console.log(JSON.stringify({ assetId: asset._id, draftId: DRAFT_ID, url: asset.url }, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
