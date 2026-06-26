import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST'),
      port: this.config.get<number>('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
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
    const from = this.config.get<string>('SMTP_FROM') || 'noreply@example.com';
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
      await this.transporter.sendMail({ from, to: opts.to, subject, html });
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
    const from = this.config.get<string>('SMTP_FROM') || 'noreply@example.com';

    await this.transporter.sendMail({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo,
    });

    this.logger.log(`Contact email sent to ${opts.to} with replyTo=${opts.replyTo}`);
  }
}
