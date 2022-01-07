import { TextField } from "@material-ui/core";
import { Box, Button, Modal } from "@mui/material";
import { COMMON_MODAL_STYLE } from "common/Styles";
import React, { useEffect, useState } from "react";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { requestPasswordReset } from "common/Api";
const LoginModal = ({ show, closeModal }) => {
  const auth = getAuth();
  const [currentAuth, setCurrentAuth] = useState({
    id: "",
    password: "",
  });
  const [loginClicked, setLoginClicked] = useState(false);
  const [resetClicked, setResetClicked] = useState(false);
  const onAccountChange = (e) => {
    const value = e.target.value;
    const name = e.target.name;
    if (name === "id") {
      currentAuth.id = value;
    } else {
      currentAuth.password = value;
    }

    setCurrentAuth({ ...currentAuth });
  };

  const login = () => {
    setLoginClicked(true);
    if (currentAuth.id && currentAuth.password) {
      signInWithEmailAndPassword(auth, currentAuth.id, currentAuth.password)
        .then((userCredential) => {
          if (userCredential) {
            console.log(`login successed`);
            alert("로그인 성공");
            setLoginClicked(false);
            closeModal();
          }
        })
        .catch((error) => {
          console.log(error);
          alert("로그인 실패");
          setLoginClicked(false);
        });
    } else {
      alert("아이디와 비밀번호를 입력하세요");
      setLoginClicked(false);
    }
  };
  const updatePasswordToServer = async (data) => {
    closeModal();
    return await requestPasswordReset(data);
  };

  const resetPassword = async () => {
    setResetClicked(true);
    const mail = window.prompt("초기화할 메일을 입력하세요.");
    const password = Math.floor(Math.random() * 99999999) + 10000000;
    const data = {
      data: {
        email: mail,
        password_new: String(password),
        subject: "Knews 비밀번호 초기화 메일입니다.",
        text: `임시 비밀번호는 ${password} 입니다`,
      },
    };
    await updatePasswordToServer(data);
    setResetClicked(false);
    alert("입력한 메일에서 임시 비밀번호를 확인하세요.");
  };

  return (
    <Modal open={show}>
      <Box component="form" sx={COMMON_MODAL_STYLE} noValidate autoComplete="off">
        <div style={{ display: "flex", flexDirection: "column" }}>
          <TextField
            required
            name="id"
            id="filled-basic"
            label="아이디"
            variant="filled"
            type="email"
            onChange={onAccountChange}
          />
          <TextField
            required
            name="password"
            id="filled-basic"
            label="비밀번호"
            variant="filled"
            type="password"
            onChange={onAccountChange}
          />
        </div>
        <Button disabled={loginClicked} onClick={login}>
          LOGIN
        </Button>
        <Button disabled={resetClicked} onClick={resetPassword}>
          RESET
        </Button>
        <Button onClick={closeModal}>CANCEL</Button>
      </Box>
    </Modal>
  );
};
export default LoginModal;
