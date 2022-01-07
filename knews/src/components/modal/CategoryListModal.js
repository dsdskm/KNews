import { Box, Button, Input, Modal } from "@mui/material";
import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { addCategory, deleteCategoryList, updateCategoryList } from "common/FirebaseUtil";
import CategoryDataHook from "data/CategoryDataHook";
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
const CategoryListModal = ({ show, channel, closeModal }) => {
  const { categoryList } = CategoryDataHook(channel);
  const [rows, setRows] = useState([]);
  const columns = [
    { field: "no", headerName: "NO", width: 70 },
    { field: "name", headerName: "카테고리", width: 200 },
    { field: "open", headerName: "표시", width: 100 },
  ];
  const [selectedList, setSelectedList] = useState([]);
  const [updateModal, showUpdateModal] = useState(false);
  const [addModal, showAddnModal] = useState(false);
  const [deleteModal, showDeleteModal] = useState(false);
  const [category, setCategory] = useState({
    id: "",
    name: "",
    open: false,
  });

  useEffect(() => {
    const list = [];
    categoryList.forEach((category, index) => {
      const open = category.open ? "예" : "아니오";
      list.push({
        no: index + 1,
        id: category.id,
        name: category.name,
        open: open,
      });
    });
    setRows(list);
  }, [categoryList]);

  const onSelectionModelChange = (v) => {
    setSelectedList(v);
  };
  const closeSubModal = () => {
    showUpdateModal(false);
    showAddnModal(false);
    showDeleteModal(false);
  };

  const onUpdateChangeClick = () => {
    if (selectedList && selectedList.length > 0) {
      showUpdateModal(true);
      const first = selectedList[0];
      const result = categoryList.filter((a) => a.id === first);
      setCategory(result[0]);
    } else {
      alert("ID를 선택하세요.");
    }
  };

  const onUpdateClick = async () => {
    await updateCategoryList(channel, selectedList, category);
    closeSubModal();
  };

  const onUpdateChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    if (name === "name") {
      category.name = value;
    } else if (name === "open") {
      category.open = value;
    }
    setCategory({ ...category });
  };

  const onAddClick = async () => {
    const result = categoryList.filter((value) => value.name === category.name);
    if (result.length > 0) {
      alert("이미 존재하는 카테고리입니다.");
      return;
    } else {
      await addCategory(channel, category);
      closeSubModal();
    }
  };

  const onAddChange = (e) => {
    const value = e.target.value;
    const time = new Date().getTime();
    const id = String(time);
    setCategory({
      id: id,
      name: value,
      open: false,
    });
  };
  const onDeleteClick = async () => {
    if (selectedList && selectedList.length > 0) {
      deleteCategoryList(channel, selectedList);
      closeSubModal();
    } else {
      alert("ID를 선택하세요.");
    }
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
              <div>카테고리 이름을 입력하세요.</div>
              <Input name="name" onChange={onUpdateChange} style={{ width: "100%" }} value={category.name}></Input>
            </>
          )}

          <div style={{ marginTop: 20 }}>표시 여부를 선택하세요.</div>
          <Select
            labelId="demo-simple-select-label"
            value={category.open}
            label="표시"
            name="open"
            onChange={onUpdateChange}
          >
            <MenuItem value="true" style={{ width: "100%", height: "50px" }}>
              예
            </MenuItem>
            <MenuItem value="false" style={{ width: "100%", height: "50px" }}>
              아니오
            </MenuItem>
          </Select>
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
            <Button onClick={closeSubModal}>취소</Button>
            <Button onClick={onUpdateClick}>수정</Button>
          </div>
        </Box>
      </Modal>
      <Modal open={addModal}>
        <Box sx={subModalStyle} noValidate autoComplete="off">
          <div>카테고리 이름을 입력하세요.</div>
          <Input id="name" onChange={onAddChange} style={{ width: "100%" }}></Input>
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
            <Button onClick={closeSubModal}>취소</Button>
            <Button onClick={onAddClick}>추가</Button>
          </div>
        </Box>
      </Modal>
      <Modal open={deleteModal}>
        <Box sx={subModalStyle} noValidate autoComplete="off">
          <div>선택한 카테고리들을 삭제하시겠습니까?</div>
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
            <Button onClick={closeSubModal}>취소</Button>
            <Button onClick={onDeleteClick}>삭제</Button>
          </div>
        </Box>
      </Modal>
    </>
  );
};

export default CategoryListModal;
