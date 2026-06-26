import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { InfisicalService } from '../infisical/infisical.service';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly infisicalService: InfisicalService) {}

  private getTransporter() {
    const creds = this.infisicalService.getSmtpCredentials();
    return nodemailer.createTransport({
      host: creds.host,
      port: creds.port,
      secure: false,
      auth: {
        user: creds.user,
        pass: creds.pass,
      },
    });
  }

  /**
   * Send a confirmation email to the lead letting them know we received their info
   */
  async sendLeadConfirmation(opts: {
    to: string;
    name: string;
  }): Promise<void> {
    const creds = this.infisicalService.getSmtpCredentials();
    const from = creds.from || 'noreply@example.com';
    const subject = 'Hemos recibido tu información';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #333;">
        <h2 style="color: #1a1a1a;">¡Gracias, ${opts.name}!</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #555;">
          Hemos recibido tu información correctamente. Nuestro equipo se pondrá en contacto contigo a la brevedad posible.
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #555;">
          Si tienes alguna pregunta urgente, no dudes en contactarnos directamente.
        </p>
        <br/>
        <p style="color: #888; font-size: 13px;">
          Este correo fue enviado automáticamente. Por favor no respondas a este mensaje.
        </p>
      </div>
    `;

    try {
      const transporter = this.getTransporter();
      await transporter.sendMail({ from, to: opts.to, subject, html });
      this.logger.log(`Confirmation email sent to ${opts.to}`);
    } catch (err) {
      this.logger.error(`Failed to send confirmation email to ${opts.to}`, err?.stack);
      // Non-blocking: we log but don't throw, so lead is still saved
    }
  }

  /**
   * Send a manual contact email to a lead with replyTo set to the admin's email
   */
  async sendContactEmail(opts: {
    to: string;
    toName: string;
    subject: string;
    html: string;
    replyTo: string;
  }): Promise<void> {
    const creds = this.infisicalService.getSmtpCredentials();
    const from = creds.from || 'noreply@example.com';

    const transporter = this.getTransporter();
    await transporter.sendMail({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo,
    });

    this.logger.log(`Contact email sent to ${opts.to} with replyTo=${opts.replyTo}`);
  }
}
