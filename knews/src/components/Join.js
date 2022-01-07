import { Button, Card, CardContent, CardHeader, TextField } from "@material-ui/core";
import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { addAccount, getAccount } from "../common/FirebaseUtil";
import { useNavigate } from "react-router-dom";
import { requestSendEmail } from "common/Api";
import { getEmailBody } from "common/Utils";
const Join = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState({
    email: "",
    password: "",
    password_re: "",
  });
  const [emailIsOk, setEmailIsOk] = useState(false);
  const [authOk, setAuthOk] = useState(false);
  const [authClicked, setAuthClicked] = useState(false);
  const [inputAuthNum, setInputAuthNum] = useState();
  const [joinClicked, setJoinClicked] = useState(false);

  const onDuplicateCheck = async (e) => {
    if (account.email) {
      if (account.email.includes("@")) {
        const tempAccount = await getAccount(account.email);
        if (tempAccount) {
          alert("이미 사용중인 ID입니다.");
          setEmailIsOk(false);
        } else {
          alert("사용가능한 ID입니다.");
          setEmailIsOk(true);
        }
      } else {
        alert("이메일 형식으로 입력해주세요.");
        setEmailIsOk(false);
      }
    } else {
      alert("ID를 입력하세요.");
      setEmailIsOk(false);
    }
  };
  const onChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    switch (name) {
      case "email":
        account.email = value;
        setEmailIsOk(false);
        break;
      case "password":
        account.password = value;
        break;
      case "password_re":
        account.password_re = value;
        break;
      case "authNum":
        setInputAuthNum(value);
        break;
      default:
        break;
    }
    setAccount({ ...account });
  };

  const onAuthCheckClick = async (e) => {
    if (!inputAuthNum || !account.auth_number) {
      alert("인증번호가 일치하지 않습니다.");
      return;
    } else if (String(inputAuthNum) !== String(account.auth_number)) {
      alert("인증번호가 일치하지 않습니다.");
      return;
    } else {
      alert("인증에 성공하였습니다.");
      setAuthOk(true);
      return;
    }
  };

  const onAuthClick = async (e) => {
    account.auth_number = Math.floor(Math.random() * 8999) + 1000;
    setAuthClicked(true);
    requestSendEmail(
      getEmailBody(account.email, "Knews 인증번호 안내 메일입니다.", `인증번호는 ${account.auth_number} 입니다`)
    );
  };

  const onJoinClick = async (e) => {
    if (!emailIsOk) {
      alert("ID 중복 체크를 해주세요.");
      return;
    }

    if (account.password.length < 8 || !account.password || !account.password_re) {
      alert("패스워드는 8자 이상으로 입력해주세요.");
      return;
    }

    if (account.password !== account.password_re) {
      alert("최종 패스워드가 다릅니다.");
      return;
    }
    setJoinClicked(true);
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, account.email, account.password)
      .then(async (userCredentail) => {
        if (userCredentail) {
          await addAccount({
            id: account.email,
            type: "normal",
          });
          setJoinClicked(false);
          alert("회원 가입이 완료되었습니다.");
          navigate("/");
        }
      })
      .catch((error) => {
        console.log(error);
        setJoinClicked(false);
        alert("회원 가입에 실패하였습니다. 관리자에게 문의해주세요.");
        navigate("/");
      });
  };
  const onCancelClick = (e) => {
    navigate("/");
  };
  return (
    <>
      <Card>
        <CardHeader title="회원 가입">회원 가입</CardHeader>
        <CardContent>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", flexDirection: "row", margin: 10 }}>
              <TextField
                style={{ flex: 1 }}
                required
                id="outlined-required"
                label="ID"
                onChange={onChange}
                name="email"
                autoComplete="off"
                disabled={emailIsOk}
              />
              <Button disabled={emailIsOk} variant="outlined" style={{ flex: 1 }} onClick={onDuplicateCheck}>
                중복 체크
              </Button>
            </div>
            <div style={{ display: "flex", flexDirection: "row", margin: 10 }}>
              <TextField
                style={{ flex: 1 }}
                required
                id="outlined-required"
                label="인증번호"
                onChange={onChange}
                name="authNum"
                disabled={authOk}
                autoComplete="off"
              />
              <Button
                disabled={!authClicked || authOk}
                variant="outlined"
                style={{ flex: 1 }}
                onClick={onAuthCheckClick}
              >
                인증번호 확인
              </Button>
              <Button disabled={!emailIsOk || authClicked} variant="outlined" style={{ flex: 1 }} onClick={onAuthClick}>
                인증번호 요청
              </Button>
            </div>
            <TextField
              style={{ margin: 10 }}
              required
              id="outlined-required"
              label="PASSWORD(8자 이상)"
              name="password"
              type="password"
              autoComplete="off"
              onChange={onChange}
            />
            <TextField
              style={{ margin: 10 }}
              required
              id="outlined-required"
              label="PASSWORD RE(8자 이상)"
              name="password_re"
              type="password"
              autoComplete="off"
              onChange={onChange}
            />

            <div style={{ display: "flex", flexDirection: "row", justifyContent: "end", marginTop: 10 }}>
              <Button variant="outlined" disabled={joinClicked} onClick={onJoinClick} style={{ margin: 5 }}>
                가입
              </Button>
              <Button variant="outlined" onClick={onCancelClick} style={{ margin: 5 }}>
                취소
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
export default Join;
