import { Button } from "@mui/material";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "./Layout";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { getDateText, isImageLink } from "../common/Utils";
import ContentDataHook from "../data/ContentDataHook";

const Category = () => {
  const navigate = useNavigate();
  const params = useParams();
  const channel = params.channel;
  const category = params.category;
  const { contentList } = ContentDataHook(channel, category);
  const [editMode, setEditMode] = useState(false);
  const onRegisterClick = () => {
    navigate(`/${channel}/content/${category}/edit/-1`);
  };

  const onItemClick = (id) => {
    navigate(`/${channel}/content/${category}/detail/${id}`);
  };

  return (
    <Layout setEditMode={setEditMode}>
      <div
        style={{
          marginLeft: "20%",
          marginRight: "20%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <List sx={{ bgcolor: "background.paper" }}>
          {contentList.map((item, index) => {
            if (editMode || item.open) {
              const time = getDateText(item.time);
              let headerText;
              let headerImage;
              item.contents.forEach((c) => {
                if (isImageLink(c)) {
                  if (!headerImage) {
                    headerImage = item[c];
                  }
                } else {
                  if (!headerText) {
                    headerText = c;
                  }
                }
              });

              if (!headerText) {
                headerText = "본문 내용 없음";
              }
              return (
                <>
                  <ListItem divider id={index} key={index} onClick={() => onItemClick(item.id)} disabled={!item.open}>
                    {headerImage && (
                      <img width="40%" height="40%" src={headerImage} style={{ marginRight: "10px" }} alt="news" />
                    )}
                    <ListItemText
                      style={{ width: "500px", height: "150px" }}
                      id={index}
                      key={index}
                      primary={item.title}
                      secondary={
                        <>
                          <div
                            style={{
                              display: "block",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {headerText}
                          </div>
                          <div style={{ display: "flex", justifyContent: "end" }}>{item.writer} 기자</div>
                          <div style={{ display: "flex", justifyContent: "end" }}>{time}</div>
                        </>
                      }
                      secondaryTypographyProps={{ variant: "overline" }}
                    />
                  </ListItem>
                </>
              );
            } else {
              return <></>;
            }
          })}
        </List>
        {editMode && (
          <Button sx={{ fontSize: 20 }} onClick={onRegisterClick}>
            기사 등록
          </Button>
        )}
      </div>
    </Layout>
  );
};

export default Category;
