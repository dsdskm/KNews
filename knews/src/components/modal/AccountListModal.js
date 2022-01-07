import { Box, Button, Modal, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import AccountDataHook from "data/AccountDataHook";
import { DataGrid } from "@mui/x-data-grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { updateAccountList } from "common/FirebaseUtil";
import ChannelDataHook from "data/ChannelDataHook";
import { COMMON_MODAL_STYLE } from "common/Styles";
const subModalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "50%",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};
const AccountListModal = ({ show, closeModal }) => {
  const { accountList } = AccountDataHook();
  const { channelList } = ChannelDataHook();
  const [rows, setRows] = useState([]);
  const columns = [
    { field: "no", headerName: "NO", width: 70 },
    { field: "id", headerName: "ID", width: 200 },
    { field: "type", headerName: "TYPE", width: 100 },
    { field: "channel", headerName: "CHANNEL", width: 130 },
  ];
  const [selectedList, setSelectedList] = useState([]);

  const [updateModal, showUpdateModal] = useState(false);
  const [account, setAccount] = useState({
    id: "",
    type: "",
    channel: "",
  });
  useEffect(() => {
    const list = [];
    accountList.forEach((account, index) => {
      const channel = channelList.filter((c) => c.id === account.channel);
      const channelTitle = channel && channel[0] ? channel[0].title : "-";
      list.push({
        no: index + 1,
        id: account.id,
        type: account.type,
        channel: channelTitle,
      });
    });
    setRows(list);
  }, [accountList]);

  const onSelectionModelChange = (v) => {
    setSelectedList(v);
  };
  const closeSubModal = () => {
    showUpdateModal(false);
  };

  const onUpdateClick = () => {
    if (selectedList && selectedList.length > 0) {
      const first = selectedList[0];
      const result = accountList.filter((a) => a.id === first);
      setAccount(result[0]);
      showUpdateModal(true);
    } else {
      alert("ID를 선택하세요.");
    }
  };

  const update = async () => {
    await updateAccountList(selectedList, account);
    closeSubModal();
  };

  const onUpdateChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    console.log(`onUpdateChange name ${name} value ${value}`);
    if (name === "type") {
      account.type = value;
    } else if (name === "channel") {
      account.channel = value;
    }
    setAccount({ ...account });
  };

  return (
    <>
      <Modal open={show}>
        <Box component="form" sx={COMMON_MODAL_STYLE} noValidate autoComplete="off">
          <div style={{ height: "100%", width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={10}
              checkboxSelection
              onSelectionModelChange={onSelectionModelChange}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
            <Button onClick={onUpdateClick}>수정</Button>
            <Button onClick={closeModal}>확인</Button>
          </div>
        </Box>
      </Modal>
      <Modal open={updateModal}>
        <Box sx={subModalStyle} noValidate autoComplete="off">
          <Typography style={{ marginBottom: 10 }}>{account.id}</Typography>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">권한을 선택하세요</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              value={account.type}
              label="권한"
              name="type"
              onChange={onUpdateChange}
            >
              <MenuItem value="normal" style={{ width: "100%", height: "50px" }}>
                일반
              </MenuItem>
              <MenuItem value="manager" style={{ width: "100%", height: "50px" }}>
                관리자
              </MenuItem>
            </Select>
          </FormControl>
          <div style={{ margin: 10 }}></div>
          {account.type === "manager" && (
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">채널을 선택하세요</InputLabel>
              <Select
                name="channel"
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={account.channel}
                label="채널"
                onChange={onUpdateChange}
              >
                {channelList.map((channel) => {
                  return (
                    <MenuItem value={channel.id} style={{ width: "100%", height: "50px" }}>
                      {channel.title}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          )}

          <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
            <Button onClick={closeSubModal}>취소</Button>
            <Button onClick={update}>수정</Button>
          </div>
        </Box>
      </Modal>
    </>
  );
};

export default AccountListModal;
