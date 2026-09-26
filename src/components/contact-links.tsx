import { consultationLinks } from "@/data/consultation";

export function ContactLinks() {
  return (
    <div className="contact-links">
      <a
        className="button primary"
        href={consultationLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
      >
        WhatsApp <span aria-hidden="true">↗</span>
      </a>
      <a
        className="button"
        href={consultationLinks.telegram}
        target="_blank"
        rel="noopener noreferrer"
      >
        Telegram <span aria-hidden="true">↗</span>
      </a>
      <a className="contact-phone" href="tel:+77777644655">
        +7 777 764-46-55
      </a>
    </div>
  );
}
