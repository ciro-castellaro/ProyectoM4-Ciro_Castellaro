import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { SendSummaryResponse } from "../src/types/email.js";
import { validateSendSummaryRequest } from "../server/validateSendSummaryRequest.js";
import { verifyIdToken } from "../server/verifyIdToken.js";
import { buildEmailContent } from "../server/buildEmailContent.js";
import { sendEmailViaSes } from "../server/sendEmailViaSes.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res
      .status(405)
      .json({ ok: false, error: "Método no permitido." } satisfies SendSummaryResponse);
  }

  const validation = validateSendSummaryRequest(req.body);
  if (!validation.ok) {
    return res
      .status(400)
      .json({ ok: false, error: validation.error } satisfies SendSummaryResponse);
  }

  const { idToken, summary } = validation.value;

  const verified = await verifyIdToken(idToken);
  if (!verified.ok) {
    return res
      .status(401)
      .json({ ok: false, error: verified.error } satisfies SendSummaryResponse);
  }

  const emailContent = buildEmailContent(verified.value.email, summary);
  const sendResult = await sendEmailViaSes(verified.value.email, emailContent);

  if (!sendResult.ok) {
    return res
      .status(500)
      .json({ ok: false, error: sendResult.error } satisfies SendSummaryResponse);
  }

  return res
    .status(200)
    .json({ ok: true, value: sendResult.value } satisfies SendSummaryResponse);
}
