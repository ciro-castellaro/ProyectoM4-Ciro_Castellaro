import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import type { EmailContent } from "./buildEmailContent.js";
import type { Result } from "../src/types/result.js";
import { getSesErrorMessage } from "./sesErrors.js";

let cachedClient: SESClient | undefined;

// Igual que con firebase-admin: reutilizar el cliente entre invocaciones de
// una misma función "caliente" en vez de reconstruirlo en cada request.
//
// Ojo: NO usamos los nombres estándar AWS_REGION/AWS_ACCESS_KEY_ID/
// AWS_SECRET_ACCESS_KEY para nuestras propias credenciales. Las Vercel
// Functions corren sobre AWS Lambda, que ya define esas variables con las
// credenciales del rol de ejecución de la plataforma (no las nuestras) —
// si dependiéramos del chain por defecto del SDK, terminaría usando esas
// credenciales ajenas en vez de las de nuestro usuario IAM de SES. Por eso
// usamos nombres propios (SES_REGION/SES_ACCESS_KEY_ID/SES_SECRET_ACCESS_KEY)
// y se los pasamos al cliente de forma explícita.
function getSesClient(): SESClient {
  if (!cachedClient) {
    cachedClient = new SESClient({
      region: process.env.SES_REGION,
      credentials: {
        accessKeyId: process.env.SES_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.SES_SECRET_ACCESS_KEY ?? "",
      },
    });
  }

  return cachedClient;
}

export async function sendEmailViaSes(
  to: string,
  content: EmailContent,
): Promise<Result<{ message: string }>> {
  const senderEmail = process.env.SES_SENDER_EMAIL;

  if (
    !senderEmail ||
    !process.env.SES_REGION ||
    !process.env.SES_ACCESS_KEY_ID ||
    !process.env.SES_SECRET_ACCESS_KEY
  ) {
    console.error(
      "[sendEmailViaSes] Faltan variables de entorno de SES " +
        "(SES_REGION / SES_ACCESS_KEY_ID / SES_SECRET_ACCESS_KEY / SES_SENDER_EMAIL).",
    );
    return {
      ok: false,
      error: "El servicio de email no está configurado correctamente.",
    };
  }

  try {
    await getSesClient().send(
      new SendEmailCommand({
        Source: senderEmail,
        Destination: { ToAddresses: [to] },
        Message: {
          Subject: { Data: content.subject, Charset: "UTF-8" },
          Body: { Text: { Data: content.text, Charset: "UTF-8" } },
        },
      }),
    );

    return { ok: true, value: { message: `Resumen enviado a ${to}.` } };
  } catch (error) {
    // Se loguea server-side (nunca al cliente) el detalle real de AWS, para
    // poder diagnosticar sin exponer información interna del servicio.
    console.error("[sendEmailViaSes] Falló el envío:", error);
    return { ok: false, error: getSesErrorMessage(error) };
  }
}
