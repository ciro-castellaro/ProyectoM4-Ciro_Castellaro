export function getSesErrorMessage(error: unknown): string {
  const name = error instanceof Error ? error.name : undefined;

  switch (name) {
    case "MessageRejected":
      return "El servicio de email rechazó el envío. Verificá que el destinatario sea válido.";
    case "MailFromDomainNotVerifiedException":
    case "ConfigurationSetDoesNotExistException":
      return "El servicio de email no está configurado correctamente.";
    case "AccountSendingPausedException":
    case "ConfigurationSetSendingPausedException":
      return "El envío de emails está pausado temporalmente. Probá de nuevo más tarde.";
    case "ThrottlingException":
    case "TooManyRequestsException":
      return "Se alcanzó el límite de envíos por ahora. Probá de nuevo en unos minutos.";
    default:
      return "No se pudo enviar el email. Intentá de nuevo más tarde.";
  }
}
