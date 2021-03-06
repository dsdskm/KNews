import { Box, Button, Modal } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CategoryTabs from "./CategoryTabs";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import TextField from "@mui/material/TextField";
import { getAccount, getChannel } from "../common/FirebaseUtil";
import { isEditMode } from "../common/Utils";
import { requestPasswordReset } from "common/Api";
import CategoryListModal from "./modal/CategoryListModal";
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const Layout = ({ children, setAccount, setEditMode }) => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState();
  const [loginModal, setLoginModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const params = useParams();
  const [currentAuth, setCurrentAuth] = useState({
    id: "",
    password: "",
  });
  const [currentAccount, setCurrentAccount] = useState();
  const [loginClicked, setLoginClicked] = useState(false);
  const [resetClicked, setResetClicked] = useState(false);
  const [passwordUpdateClicked, setPasswordUpdateClicked] = useState(false);
  const [newPassword, setNewPassword] = useState({
    password: "",
    password_re: "",
  });
  const [categoryListModal, setCategoryListModal] = useState(false);
  const [currentChannel, setCurrentChannel] = useState({
    title: "",
  });

  const onHomeClick = () => {
    navigate("/");
  };

  useEffect(() => {
    const loadData = async () => {
      const data = await getChannel(params.channel);
      setCurrentChannel(data);
    };
    loadData();
  }, [params]);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user.email);
        const tempAccount = await getAccount(user.email);
        if (setAccount) {
          setAccount(tempAccount);
        }
        setCurrentAccount(tempAccount);
        if (setEditMode) {
          setEditMode(isEditMode(params.channel, tempAccount));
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => {};
  }, [auth, params.channel, setAccount, setEditMode]);

  const closeModal = () => {
    setLoginModal(false);
    setPasswordModal(false);
    setCategoryListModal(false);
  };
  const onLoginClick = () => {
    if (currentUser) {
      logout();
    } else {
      setLoginModal(true);
    }
  };

  const onJoinClick = () => {
    navigate("/join");
  };

  const logout = () => {
    signOut(auth).then(() => {
      console.log(`logout successed`);
      closeModal();
    });
  };

  const updatePasswordToServer = async (data) => {
    closeModal();
    return await requestPasswordReset(data);
  };

  const resetPassword = async () => {
    setResetClicked(true);
    const mail = window.prompt("???????????? ????????? ???????????????.");
    const password = Math.floor(Math.random() * 99999999) + 10000000;
    const data = {
      data: {
        email: mail,
        password_new: String(password),
        subject: "Knews ???????????? ????????? ???????????????.",
        text: `?????? ??????????????? ${password} ?????????`,
      },
    };
    await updatePasswordToServer(data);
    setResetClicked(false);
    alert("????????? ???????????? ?????? ??????????????? ???????????????.");
  };
  const login = () => {
    setLoginClicked(true);
    if (currentAuth.id && currentAuth.password) {
      signInWithEmailAndPassword(auth, currentAuth.id, currentAuth.password)
        .then((userCredential) => {
          if (userCredential) {
            console.log(`login successed`);
            alert("????????? ??????");
            setLoginClicked(false);
            closeModal();
          }
        })
        .catch((error) => {
          console.log(error);
          alert("????????? ??????");
          setLoginClicked(false);
        });
    } else {
      alert("???????????? ??????????????? ???????????????");
      setLoginClicked(false);
    }
  };

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

  const onPasswordUpdateChange = (e) => {
    const value = e.target.value;
    const name = e.target.name;
    if (name === "password_new") {
      newPassword.password = value;
    } else {
      newPassword.password_re = value;
    }
    setNewPassword(newPassword);
  };

  const updatePassword = async (e) => {
    console.log(`updatePassword`);
    if (!newPassword.password) {
      alert("??? ??????????????? ???????????????.");
      return;
    } else if (newPassword.password.length < 8) {
      alert("??????????????? 8??? ???????????? ??????????????????.");
      return;
    } else if (newPassword.password !== newPassword.password_re) {
      alert("?????? ??????????????? ????????????.");
      return;
    }
    setPasswordUpdateClicked(true);
    const data = {
      data: {
        email: currentUser,
        password_new: String(newPassword.password),
        subject: "",
        text: "",
      },
    };
    await updatePasswordToServer(data);
    setPasswordUpdateClicked(false);
    alert("???????????? ????????? ?????????????????????.");
  };

  let user;
  if (currentUser) {
    user = currentUser;
  }
  if (currentAccount && currentAccount.type !== "normal" && currentAccount.channel === params.channel) {
    user = `[${currentAccount.type}]`.concat(user);
  }
  return (
    <>
      <div style={{ padding: "1%" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button onClick={onHomeClick}>Home</Button>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div>{currentChannel.title}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {currentUser && (
              <>
                <div style={{ marginRight: "5px" }}>{user}</div>
                <Button onClick={() => setPasswordModal(true)}>???????????? ??????</Button>
              </>
            )}
            {currentAccount && currentAccount.type === "manager" && currentAccount.channel === params.channel && (
              <Button onClick={() => setCategoryListModal(true)}>???????????? ??????</Button>
            )}
            <Button onClick={onLoginClick}>{currentUser ? "Logout" : "Login"}</Button>
            {!currentUser && <Button onClick={onJoinClick}>JOIN</Button>}
          </div>
        </div>

        <div style={{ margin: 10 }}>
          <CategoryTabs currentAccount={currentAccount} />
        </div>
        <div style={{ marginLeft: "10%", marginRight: "10%", marginTop: "5%", marginBottom: "5%" }}>{children}</div>
        <Modal open={loginModal}>
          <Box component="form" sx={modalStyle} noValidate autoComplete="off">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <TextField
                required
                name="id"
                id="filled-basic"
                label="?????????"
                variant="filled"
                type="email"
                onChange={onAccountChange}
              />
              <TextField
                required
                name="password"
                id="filled-basic"
                label="????????????"
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
        <Modal open={passwordModal}>
          <Box component="form" sx={modalStyle} noValidate autoComplete="off">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <TextField
                name="password_new"
                id="filled-basic"
                label="??? ????????????"
                variant="filled"
                type="password"
                onChange={onPasswordUpdateChange}
              />
              <TextField
                name="password_new_re"
                id="filled-basic"
                label="??? ???????????? ??????"
                variant="filled"
                type="password"
                onChange={onPasswordUpdateChange}
              />
            </div>
            <Button disabled={passwordUpdateClicked} onClick={updatePassword}>
              ???????????? ??????
            </Button>
            <Button onClick={closeModal}>??????</Button>
          </Box>
        </Modal>
        <CategoryListModal show={categoryListModal} channel={params.channel} closeModal={closeModal} />
      </div>
    </>
  );
};

export default Layout;
