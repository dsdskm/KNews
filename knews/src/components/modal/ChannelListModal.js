import { Box, Button, Input, Modal } from "@mui/material";
import React, { useEffect, useState, useRef } from "react";
import { DataGrid } from "@mui/x-data-grid";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import ChannelDataHook from "../../data/ChannelDataHook";
import { addChannel, deleteChannelList, updateChannelList, uploadLogoFile } from "../../common/FirebaseUtil";
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
const ChannelListModal = ({ show, closeModal }) => {
  const [rows, setRows] = useState([]);
  const columns = [
    { field: "no", headerName: "NO", width: 70 },
    {
      field: "title",
      headerName: "채널명",
      width: 150,
      renderCell: (params) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          <Typography>{params.value}</Typography>
        </div>
      ),
    },
    {
      field: "description",
      headerName: "설명",
      width: 500,
      renderCell: (params) => (
        <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
          <Typography>{params.value}</Typography>
        </div>
      ),
    },
    {
      field: "logo",
      headerName: "로고",
      width: 150,
      renderCell: (params) => <img style={{ margin: 5, width: 100, height: 100 }} src={params.value} alt="logo"></img>,
    },
    { field: "open", headerName: "표시", width: 100 },
  ];
  const [selectedList, setSelectedList] = useState([]);
  const [updateModal, showUpdateModal] = useState(false);
  const [addModal, showAddnModal] = useState(false);
  const [deleteModal, showDeleteModal] = useState(false);
  const [channelData, setChannelData] = useState({
    id: "",
    description: "",
    logo: "",
    open: false,
    title: "",
  });
  const [addClick, setAddClick] = useState(false);
  const [imageFile, setImageFile] = useState({
    file: null,
    name: "",
    result: null,
  });
  const fileRef = useRef();
  const { channelList } = ChannelDataHook();
  useEffect(() => {
    const list = [];
    channelList.forEach((channel, index) => {
      const open = channel.open ? "예" : "아니오";
      list.push({
        no: index + 1,
        id: channel.id,
        title: channel.title,
        description: channel.description,
        open: open,
        logo: channel.logo,
      });
    });
    setRows(list);
  }, [channelList]);

  const onSelectionModelChange = (v) => {
    setSelectedList(v);
  };
  const closeSubModal = () => {
    showUpdateModal(false);
    showAddnModal(false);
    showDeleteModal(false);
    onResetClick();
  };

  const onUpdateChangeClick = () => {
    if (selectedList && selectedList.length > 0) {
      console.log(`selectedList ${JSON.stringify(selectedList)}`);
      const result = channelList.filter((value) => value.id === selectedList[0]);
      setChannelData(result[0]);
      showUpdateModal(true);
    } else {
      alert("ID를 선택하세요.");
    }
  };

  const onUpdateClick = async () => {
    console.log(`onUpdateClick channelData ${JSON.stringify(channelData)} selectedList ${selectedList.length}`);
    setAddClick(true);
    if (selectedList && selectedList.length > 1) {
      await updateChannelList(selectedList, channelData);
    } else {
      channelData.open = channelData.open === "true";
      const result = channelList.filter((value) => value.title === channelData.title && value.id !== channelData.id);
      if (result.length > 0) {
        alert("이미 존재하는 채널입니다.");
        return;
      } else if (!imageFile.result && !channelData.logo) {
        alert("로고 이미지를 추가해주세요.");
        return;
      } else {
        await addChannel(channelData);
        await uploadLogoFile(channelData, imageFile);
      }
    }
    setAddClick(false);
    onResetClick();
    closeSubModal();
  };

  const onAddClick = async () => {
    channelData.id = String(new Date().getTime());
    channelData.open = channelData.open === "true";
    const result = channelList.filter((value) => value.title === channelData.title);
    if (result.length > 0) {
      alert("이미 존재하는 채널입니다.");
      return;
    } else if (!imageFile.result) {
      alert("로고 이미지를 추가해주세요.");
      return;
    } else {
      setAddClick(true);
      await addChannel(channelData);
      await uploadLogoFile(channelData, imageFile);
      onResetClick();
      setAddClick(false);
      closeSubModal();
    }
  };

  const onAddChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    if (name === "title") {
      channelData.title = value;
    } else if (name === "description") {
      channelData.description = value;
    } else if (name === "open") {
      channelData.open = value;
    }
    console.log(`channelData ${JSON.stringify(channelData)}`);
    setChannelData({ ...channelData });
  };

  const onDeleteClick = async () => {
    if (selectedList && selectedList.length > 0) {
      await deleteChannelList(selectedList);
      closeSubModal();
    } else {
      alert("ID를 선택하세요.");
    }
  };

  const onFileChange = (event) => {
    const id = event.target.id;
    const index = Number(id);
    let reader = new FileReader();
    let file = event.target.files[0];
    let name = event.target.files[0].name;
    reader.onloadend = (e) => {
      console.log(`onloadend name ${name}`);
      setImageFile({
        file: file,
        name: name,
        result: reader.result,
      });
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const onResetClick = () => {
    setImageFile({
      file: null,
      name: "",
      result: null,
    });
    if (fileRef && fileRef.current && fileRef.current.value) {
      fileRef.current.value = null;
    }
  };

  return (
    <>
      <Modal open={show}>
        <Box component="form" sx={COMMON_MODAL_STYLE} noValidate autoComplete="off">
          <div style={{ height: "100%", width: "100%" }}>
            <DataGrid
              rowHeight={150}
              rows={rows}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[5]}
              checkboxSelection
              onSelectionModelChange={onSelectionModelChange}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
            <Button onClick={() => showAddnModal(true)}>추가</Button>
            <Button onClick={onUpdateChangeClick}>수정</Button>
            <Button onClick={() => showDeleteModal(true)}>삭제</Button>
            <Button onClick={closeModal}>확인</Button>
          </div>
        </Box>
      </Modal>
      <Modal open={updateModal}>
        <Box sx={subModalStyle} noValidate autoComplete="off">
          {selectedList.length === 1 && (
            <>
              <div>채널명을 입력하세요.</div>
              <Input
                name="title"
                onChange={onAddChange}
                style={{ width: "100%", marginBottom: 10 }}
                value={channelData.title}
              />
              <div>채널 설명을 입력하세요.</div>
              <Input
                name="description"
                onChange={onAddChange}
                style={{ width: "100%" }}
                value={channelData.description}
              />
              <div>
                <input name="logo" id="logo" type="file" onChange={onFileChange} ref={fileRef} />
                <Button onClick={onResetClick}>reset</Button>
              </div>
              <div style={{ display: "flex" }}>
                {channelData.logo && (
                  <div>
                    <img alt="logo" style={{ width: 100, height: 100 }} src={channelData.logo} />
                  </div>
                )}
                {imageFile.result && (
                  <div>
                    <img alt="logo" style={{ width: 100, height: 100 }} src={imageFile.result} />
                  </div>
                )}
              </div>
            </>
          )}

          <div style={{ marginTop: 10 }}>표시 여부를 선택하세요.</div>
          <Select
            labelId="demo-simple-select-label"
            value={channelData.open}
            label="표시"
            name="open"
            onChange={onAddChange}
          >
            <MenuItem value="true" style={{ width: "100%", height: "50px" }}>
              예
            </MenuItem>
            <MenuItem value="false" style={{ width: "100%", height: "50px" }}>
              아니오
            </MenuItem>
          </Select>
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
            <Button disalbe={addClick} onClick={closeSubModal}>
              취소
            </Button>
            <Button disalbe={addClick} onClick={onUpdateClick}>
              수정
            </Button>
          </div>
        </Box>
      </Modal>
      <Modal open={addModal}>
        <Box sx={subModalStyle} noValidate autoComplete="off">
          <div>채널 이름을 입력하세요.</div>
          <Input name="title" onChange={onAddChange} style={{ width: "100%", marginBottom: 10 }} />
          <div>설명을 입력하세요.</div>
          <Input name="description" onChange={onAddChange} style={{ width: "100%" }} />
          <div>
            <input name="logo" id="logo" type="file" onChange={onFileChange} ref={fileRef} />
            <Button onClick={onResetClick}>reset</Button>
          </div>
          {imageFile.result && (
            <div>
              <img alt="logo" style={{ width: 100, height: 100 }} src={imageFile.result} />
            </div>
          )}

          <div style={{ marginTop: 10 }}>표시 여부를 선택하세요.</div>
          <Select
            labelId="demo-simple-select-label"
            name="open"
            value={channelData.open}
            label="표시"
            name="open"
            onChange={onAddChange}
          >
            <MenuItem value="true" style={{ width: "100%", height: "50px" }}>
              예
            </MenuItem>
            <MenuItem value="false" style={{ width: "100%", height: "50px" }}>
              아니오
            </MenuItem>
          </Select>

          <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
            <Button disabled={addClick} onClick={closeSubModal}>
              취소
            </Button>
            <Button disabled={addClick} onClick={onAddClick}>
              추가
            </Button>
          </div>
        </Box>
      </Modal>
      <Modal open={deleteModal}>
        <Box sx={subModalStyle} noValidate autoComplete="off">
          <div>선택한 채널들을 삭제하시겠습니까?</div>
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
            <Button onClick={closeSubModal}>취소</Button>
            <Button onClick={onDeleteClick}>삭제</Button>
          </div>
        </Box>
      </Modal>
    </>
  );
};

export default ChannelListModal;
