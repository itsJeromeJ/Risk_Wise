// import { Resend } from 'resend';
// import EmailTemplate from '@/emails/template';

// const resend = new Resend(process.env.RESEND_API_KEY);

// export async function sendEmail({ to, template, data }) {
//   try {
//     console.log('Attempting to send email:', {
//       to,
//       template,
//       percentageUsed: data.percentageUsed
//     });

//     const subject = `Budget Alert - ${data.percentageUsed.toFixed(1)}% of Budget Used`;
    
//     const result = await resend.emails.send({
//       from: 'Risk Wise <notifications@riskwise.com>', // Update this with your verified domain
//       to: [to],
//       subject: subject,
//       react: EmailTemplate({
//         userName: data.userName,
//         type: template,
//         data: data
//       }),
//     });

//     console.log('Email sent successfully:', result);
//     return { success: true, messageId: result.id };
//   } catch (error) {
//     console.error('Failed to send email:', {
//       error: error.message,
//       stack: error.stack,
//       data: { to, template, percentageUsed: data.percentageUsed }
//     });
//     throw error;
//   }
// } 