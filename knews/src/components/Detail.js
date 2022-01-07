import { Box, Card, Modal } from "@material-ui/core";
import { Button, CardContent, Link, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "./Layout";
import { deleteNews, getNews } from "../common/FirebaseUtil";
import { isImageLink, isTextLink } from "../common/Utils";
import Comment from "./Comment";
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
const Detail = () => {
  const navigate = useNavigate();
  const params = useParams();
  const channel = params.channel;
  const category = params.category;
  const id = params.id;
  const [data, setData] = useState();
  const [modal, setModal] = useState({
    show: false,
  });
  const [deleteClicked, setDeleteClicked] = useState(false);
  const [account, setAccount] = useState();
  const [editMode, setEditMode] = useState(false);
  useEffect(() => {
    const loadData = async () => {
      const data = await getNews(channel, id);
      setData(data);
    };
    loadData();
  }, [channel, id]);

  const onModifyClick = (e) => {
    navigate(`/${channel}/content/${category}/edit/${id}`);
  };

  const onDeleteClick = (e) => {
    showDeleteModal();
  };

  const onCancelClick = (e) => {
    navigate(`/${channel}/content/${category}`);
  };
  const showDeleteModal = () => {
    modal.show = true;
    setModal({ ...modal });
  };
  const closeModal = () => {
    modal.show = false;
    setModal({ ...modal });
  };
  const deleteItem = async () => {
    setDeleteClicked(true);
    await deleteNews(channel, id);
    closeModal();
    onCancelClick();
  };
  if (!data) {
    return <></>;
  }

  const date = new Date(data.time);
  const time = date.toLocaleString();
  return (
    <>
      <Layout setAccount={setAccount} setEditMode={setEditMode}>
        <Card>
          <CardContent>
            <Typography sx={{ fontSize: 24, fontWeight: "bold" }} color="text.primary" gutterBottom>
              {data.title}
            </Typography>

            {data.contents.map((content) => {
              if (isImageLink(content)) {
                const path = data[content];
                return (
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 2, marginTop: 2 }}>
                    <img width={"50%"} src={path} style={{ marginRight: "10px" }} alt="news" />;
                  </div>
                );
              } else {
                if (isTextLink(content)) {
                  return (
                    <div style={{ marginBottom: 2, marginTop: 2 }}>
                      <Link href={content} target="_blank">
                        {content}
                      </Link>
                    </div>
                  );
                } else {
                  return (
                    <Typography sx={{ fontSize: 18, marginBottom: 2, marginTop: 2 }} color="text.primary" gutterBottom>
                      {content}
                    </Typography>
                  );
                }
              }
            })}

            {data.writer && (
              <Typography sx={{ fontSize: 18 }} color="text.primary" gutterBottom align="right">
                {data.writer} 기자
              </Typography>
            )}

            <Typography sx={{ fontSize: 14 }} color="text.primary" gutterBottom align="right">
              {time}
            </Typography>
            <div style={{ marginTop: 20, display: "flex", justifyContent: "end" }}>
              <Typography sx={{ fontSize: 14 }} color="text.primary" gutterBottom>
                <Button onClick={onCancelClick}>목록</Button>
                {editMode && <Button onClick={onModifyClick}>수정</Button>}
                {editMode && <Button onClick={onDeleteClick}>삭제</Button>}
              </Typography>
            </div>
          </CardContent>
        </Card>

        <Comment editMode={editMode} account={account} />
      </Layout>

      <Modal open={modal.show}>
        <Box component="form" sx={modalStyle} noValidate autoComplete="off">
          <div>기사를 삭제하시겠습니까?</div>
          <Button disabled={deleteClicked} onClick={deleteItem}>
            삭제
          </Button>
          <Button onClick={closeModal}>취소</Button>
        </Box>
      </Modal>
    </>
  );
};

export default Detail;
