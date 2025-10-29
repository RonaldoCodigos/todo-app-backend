const sgMail = require('@sendgrid/mail');

// Configura o SendGrid com a sua API Key (lida das variáveis de ambiente)
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Função para enviar um e-mail.
 * @param {string} to - O endereço de e-mail do destinatário.
 * @param {string} subject - O assunto do e-mail.
 * @param {string} text - O conteúdo em texto plano do e-mail.
 * @param {string} html - O conteúdo em HTML do e-mail.
 */
const sendEmail = async ({ to, subject, text, html }) => {
  // Define o remetente (precisa ser um e-mail verificado no SendGrid,
  // mas para testes iniciais, pode usar o seu e-mail de cadastro)
  // !!! IMPORTANTE: Troque pelo seu e-mail cadastrado no SendGrid !!!
  const fromEmail = 'braziezinho@gmail.com'; 

  const msg = {
    to: to,         // Destinatário
    from: fromEmail, // Remetente (VERIFICADO no SendGrid)
    subject: subject, // Assunto
    text: text,       // Corpo em texto plano
    html: html,       // Corpo em HTML
  };

  try {
    console.log(`[sendEmail] Tentando enviar e-mail para ${to} com assunto "${subject}"`);
    await sgMail.send(msg);
    console.log(`[sendEmail] E-mail enviado com sucesso para ${to}`);
  } catch (error) {
    console.error('[sendEmail] Erro ao enviar e-mail:', error);
    // Log detalhado do erro do SendGrid, se disponível
    if (error.response) {
      console.error(error.response.body)
    }
    // Joga o erro para ser tratado na rota que chamou a função
    throw new Error('Erro ao enviar o e-mail de redefinição.'); 
  }
};

module.exports = sendEmail; // Exporta a função