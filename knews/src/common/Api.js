import { getFunctions, httpsCallable } from "firebase/functions";

const requestSendEmail = (data) => {
  console.log(`requestSendEmail data ${JSON.stringify(data)}`);
  const functions = getFunctions();
  const sendEmail = httpsCallable(functions, "sendEmail");
  sendEmail(data)
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
};

const requestPasswordReset = (data) => {
  console.log(`requestPasswordReset data ${JSON.stringify(data)}`);
  const functions = getFunctions();
  // connectFunctionsEmulator(functions, "localhost", 5001);
  const resetPassword = httpsCallable(functions, "resetPassword");
  return new Promise((resolve, reject) => {
    resetPassword(data)
      .then((response) => {
        console.log(response);
        resolve();
      })
      .catch((error) => {
        console.log(error);
        reject();
      });
  });
};
export { requestSendEmail, requestPasswordReset };
