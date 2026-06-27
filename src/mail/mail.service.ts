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

  async sendInviteEmail(to: string, token: string): Promise<void> {
    const creds = this.infisicalService.getSmtpCredentials();
    const from = creds.from || 'noreply@example.com';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const inviteLink = `${frontendUrl}/admin/create-account?token=${token}`;
    const subject = 'Invitation to admin panel';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #333;">
        <h2 style="color: #1a1a1a;">You've been invited!</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #555;">
          You have been invited to join the admin panel. Click the link below to set up your account.
        </p>
        <a href="${inviteLink}" style="display: inline-block; padding: 12px 24px; margin: 16px 0; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 4px; font-size: 16px;">
          Create Account
        </a>
        <p style="font-size: 14px; line-height: 1.6; color: #888;">
          This link will expire in 48 hours. If you did not expect this invitation, please ignore this email.
        </p>
      </div>
    `;

    try {
      const transporter = this.getTransporter();
      await transporter.sendMail({ from, to, subject, html });
      this.logger.log(`Invite email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send invite email to ${to}`, err?.stack);
    }
  }

  async sendPasswordResetEmail(to: string, otp: string): Promise<void> {
    const creds = this.infisicalService.getSmtpCredentials();
    const from = creds.from || 'noreply@example.com';
    const subject = 'Password Reset OTP';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #333;">
        <h2 style="color: #1a1a1a;">Password Reset Code</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #555;">
          Use the following code to reset your password. This code will expire in 15 minutes.
        </p>
        <div style="text-align: center; padding: 16px; margin: 16px 0; background-color: #f5f5f5; border-radius: 4px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a1a1a;">
          ${otp}
        </div>
        <p style="font-size: 14px; line-height: 1.6; color: #888;">
          If you did not request a password reset, please ignore this email.
        </p>
      </div>
    `;

    try {
      const transporter = this.getTransporter();
      await transporter.sendMail({ from, to, subject, html });
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send password reset email to ${to}`, err?.stack);
    }
  }
}
