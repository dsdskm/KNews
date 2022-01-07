const functions = require("firebase-functions");
const admin = require("firebase-admin");
var serviceAccount = require("./knews-firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const authen = admin.auth();

let nodemailer = require("nodemailer");
// firebase emulators:start
exports.sendEmail = functions.https.onCall((req, res) => {
  console.log(`sendEmail`)
  functions.logger.log(`sendEmail`);
  const user_email = req.data.email;
  const subject = req.data.subject;
  const text = req.data.text;
  if (!user_email || !subject || !text) {
    console.log(`sendEmail body is empty`);
    functions.logger.log(`sendEmail body is empty`);
    return;
  }
  return sendEmailFun(user_email, subject, text);
});
const sendEmailFun = (user_email, subject, text) => {
  console.log(`sendEmailFun user_email=${user_email} subject=${subject} text=${text}`);
  functions.logger.log(`sendEmailFun user_email=${user_email} subject=${subject} text=${text}`);
  if (!user_email || !subject || !text) {
    console.log(`sendEmailFun empty`);
    functions.logger.log(`sendEmailFun empty`);
    return;
  }

  let transporter = nodemailer.createTransport({
    service: "gmail", //사용하고자 하는 서비스
    prot: 587,
    host: "smtp.gmlail.com",
    secure: false,
    auth: {
      user: "dsdskm@gmail.com", //gmail주소입력
      pass: "pcvzyizictrobrkw", //gmail패스워드 입력
    },
  });

  try {
    transporter.sendMail({
      from: "dsdskm@gmail.com", //보내는 주소 입력
      to: user_email, //위에서 선언해준 받는사람 이메일
      subject: subject, //메일 제목
      text: text, //내용
    });
    return 200;
  } catch (error) {
    console.log(`sendEmail error`, error);
    functions.logger.log(`sendEmail error ${error}`);
    return 500;
  }
};
exports.resetPassword = functions.https.onCall((req, res) => {
  console.log(`resetPassword`);
  functions.logger.log(`resetPassword`);
  const user_email = req.data.email;
  const password_new = req.data.password_new;
  const subject = req.data.subject;
  const text = req.data.text;
  authen.getUserByEmail(user_email).then((user) => {
    const uid = user.uid;
    authen
      .updateUser(uid, {
        email: user_email,
        password: password_new,
      })
      .then(() => {
        console.log("reset password");
        functions.logger.log(`reset password'`);
        sendEmailFun(user_email, subject, text);

        return 200;
      })
      .catch((error) => {
        console.log(`error ${error}`);
        functions.logger.log(`error ${error}`);
        return 500;
      });
  });
});
