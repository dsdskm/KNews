import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import ChannelDataHook from "../data/ChannelDataHook";
import { Button } from "@mui/material";
import LoginModal from "./modal/LoginModal";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getAccount } from "common/FirebaseUtil";
import AccountListModal from "./modal/AccountListModal";
import ChannelListModal from "./modal/ChannelListModal";
const Main = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const { channelList } = ChannelDataHook();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAccountListModal, setShowAccountListModal] = useState(false);
  const [showChannelListModal, setShowChannelListModal] = useState(false);
  const [currentAccount, setCurrentAccount] = useState();
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const account = await getAccount(user.email);
        setCurrentAccount(account);
      } else {
        setCurrentAccount(null);
      }
    });
  }, [auth]);
  const onClick = (channel) => {
    navigate(`/${channel}/content/-1`);
  };

  const onLoginClick = () => {
    if (currentAccount) {
      signOut(auth).then(() => {
        console.log(`logout successed`);
        setShowLoginModal(false);
      });
    } else {
      setShowLoginModal(true);
    }
  };

  const onJoinClick = () => {
    navigate("/join");
  };

  const closeModal = () => {
    setShowLoginModal(false);
    setShowAccountListModal(false);
    setShowChannelListModal(false);
  };
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
      }}
    >
      <Typography sx={{ fontSize: 25, marginBottom: "10%" }} color="text.primary" gutterBottom>
        K - N E W S
      </Typography>
      <List sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
        {channelList.map((channel) => {
          return (
            <ListItem onClick={() => onClick(channel.id)} key={channel.id}>
              <ListItemAvatar>
                <Avatar alt="Remy Sharp" src={channel.logo} />
              </ListItemAvatar>
              <ListItemText
                primary={channel.title}
                secondary={<React.Fragment>{channel.description}</React.Fragment>}
              />
            </ListItem>
          );
        })}
      </List>
      <div style={{ display: "flex", marginTop: "10%" }}>
        <Button color={currentAccount ? "error" : "primary"} onClick={onLoginClick} sx={{ fontSize: 18 }}>
          {currentAccount ? "로그아웃" : "로그인"}
        </Button>
        {!currentAccount && (
          <Button color={"primary"} onClick={onJoinClick} sx={{ fontSize: 18 }}>
            회원가입
          </Button>
        )}
      </div>
      {currentAccount && currentAccount.type === "master" && (
        <div style={{ display: "flex" }}>
          <Button sx={{ fontSize: 18 }} onClick={() => setShowAccountListModal(true)}>
            계정 관리
          </Button>
          <Button sx={{ fontSize: 18 }} onClick={() => setShowChannelListModal(true)}>
            채널 관리
          </Button>
        </div>
      )}

      <Typography sx={{ fontSize: 18 }} color="text.primary" gutterBottom>
        제휴 문의
      </Typography>
      <Typography sx={{ fontSize: 14 }} color="text.primary" gutterBottom>
        tothetg@naver.com
      </Typography>

      <LoginModal show={showLoginModal} closeModal={closeModal} />
      <ChannelListModal show={showChannelListModal} closeModal={closeModal} />
      <AccountListModal show={showAccountListModal} closeModal={closeModal} />
    </div>
  );
};

export default Main;
