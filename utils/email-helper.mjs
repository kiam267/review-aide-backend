import PQueue from 'p-queue';
const queue = new PQueue({ concurrency: 15 });
const { emailSnder } = require('./utils');

export const sysEmailSender = () => {
   [email].forEach(recipient => {
     const emailData = queue.add(
       async () => await emailSnder(recipient, linkPort)
     );
     console.log(emailData.messageId);
   });
  console.log();
}