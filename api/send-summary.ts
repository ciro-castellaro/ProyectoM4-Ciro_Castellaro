import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { SendSummaryResponse } from "../src/types/email";
import { validateSendSummaryRequest } from "../server/validateSendSummaryRequest";
import { verifyIdToken } from "../server/verifyIdToken";
import { buildEmailContent } from "../server/buildEmailContent";

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

  // El contenido ya queda armado y listo para enviarse. La futura
  // integración con AWS SES reemplaza este console.log por el envío real
  // usando este mismo subject/text.
  const emailContent = buildEmailContent(verified.value.email, summary);
  console.log(
    `[send-summary] Prepared email for ${verified.value.email}: "${emailContent.subject}"`,
  );

  return res.status(200).json({
    ok: true,
    value: {
      message: `Resumen preparado para ${verified.value.email} (todavía no se envía: falta integrar AWS SES).`,
    },
  } satisfies SendSummaryResponse);
}
