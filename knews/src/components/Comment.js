import { Box, Card, ListItem, ListItemText, Modal, TextField } from "@material-ui/core";
import { Button, CardContent, Typography } from "@mui/material";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import List from "@mui/material/List";
import { addComment, deleteComment } from "../common/FirebaseUtil";
import { getDateText, getMarkedWriter } from "../common/Utils";
import CommentDataHook from "../data/CommentDataHook";
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
const DEFAULT_DATA = {
  id: "",
  time: 0,
  text: "",
  writer: "",
  news: "",
};
const Comment = ({ editMode, account }) => {
  const params = useParams();
  const channel = params.channel;
  const category = params.category;
  const id = params.id;
  const [data, setData] = useState(DEFAULT_DATA);
  const [updating, setUpdating] = useState(false);
  const { commentList } = CommentDataHook(channel, category, id);
  const [modal, setModal] = useState({
    show: false,
    commentId: "",
  });
  const onChange = (e) => {
    const value = e.target.value;
    data.text = value;
    setData({ ...data });
  };
  const onAddClick = async (e) => {
    if (data.text.length < 5) {
      alert("5자 이상으로 입력하세요.");
      return;
    } else if (data.text.length > 100) {
      alert("100자 이하로 입력하세요.");
      return;
    }
    const time = new Date().getTime();
    data.id = String(time);
    data.time = time;
    data.writer = account.id;
    data.channel = channel;
    data.category = category;
    data.news_id = id;
    setUpdating(true);
    await addComment(channel, data);
    setUpdating(false);
    setData(DEFAULT_DATA);
    setTimeout(() => {
      setData(DEFAULT_DATA);
    }, 500);
  };

  const onDeleteClick = (commentId) => {
    modal.commentId = commentId;
    showModal();
  };
  const showModal = () => {
    modal.show = true;
    setModal({ ...modal });
  };
  const closeModal = () => {
    modal.show = false;
    setModal({ ...modal });
  };
  const deleteItem = async () => {
    if (modal.commentId) {
      await deleteComment(channel, modal.commentId);
      closeModal();
    }
  };
  return (
    <>
      <Card style={{ marginTop: "10px" }}>
        <CardContent>
          <Typography sx={{ fontSize: 24, fontWeight: "bold" }} color="text.primary" gutterBottom>
            댓글
          </Typography>
          <TextField multiline name="comment" fullWidth type="text" onChange={onChange} value={data.text} />
          <div style={{ display: "flex", justifyContent: "end" }}>
            <Button disabled={updating} onClick={onAddClick}>
              등록
            </Button>
          </div>
          <List sx={{ width: "100%" }}>
            {commentList.map((comment, index) => {
              const accountId = account ? account.id : "";
              return (
                <ListItem alignItems="flex-start">
                  <ListItemText
                    multiline
                    primary={
                      <>
                        <div>{getMarkedWriter(comment.writer)}</div>
                        <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", width: "500px" }}>
                          {comment.text}
                        </div>
                      </>
                    }
                    secondary={
                      <>
                        <div style={{ display: "flex", justifyContent: "end" }}>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <div>{getDateText(comment.time)}</div>
                            {(editMode || comment.writer === accountId) && (
                              <div style={{ display: "flex", justifyContent: "end" }}>
                                <Button onClick={() => onDeleteClick(comment.id)} color="error">
                                  삭제
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        </CardContent>
      </Card>
      <Modal open={modal.show}>
        <Box component="form" sx={modalStyle} noValidate autoComplete="off">
          <div>기사를 삭제하시겠습니까?</div>
          <Button onClick={deleteItem}>예</Button>
          <Button onClick={closeModal}>아니오</Button>
        </Box>
      </Modal>
    </>
  );
};

export default Comment;
