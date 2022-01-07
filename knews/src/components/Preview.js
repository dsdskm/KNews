import { CardContent, Typography } from "@mui/material";
import React from "react";
import { getDateText, isImageLink } from "../common/Utils";

const Preview = ({ data, imageFile }) => {
  if (!data) {
    return <></>;
  }

  const time = getDateText(data.time);
  return (
    <>
      <CardContent>
        <Typography sx={{ fontSize: 24, fontWeight: "bold" }} color="text.primary" gutterBottom>
          {data.title}
        </Typography>

        {data.contents.map((content, index) => {
          if (isImageLink(content)) {
            const path = imageFile[index].result;
            return (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <img src={path} style={{ marginRight: "10px" }} alt="news" />;
              </div>
            );
          } else {
            return (
              <Typography sx={{ fontSize: 18, marginBottom: 5 }} color="text.primary" gutterBottom>
                {content}
              </Typography>
            );
          }
        })}

        <Typography sx={{ fontSize: 18 }} color="text.primary" gutterBottom align="right">
          {data.writer} 기자
        </Typography>
        <Typography sx={{ fontSize: 14 }} color="text.primary" gutterBottom align="right">
          {time}
        </Typography>
        {/* <div style={{ marginTop: 20, display: "flex", justifyContent: "end" }}>
          <Typography sx={{ fontSize: 14 }} color="text.primary" gutterBottom>
            <Button onClick={onCancelClick}>목록</Button>
            {currentUser && <Button onClick={onModifyClick}>수정</Button>}
            {currentUser && <Button onClick={onDeleteClick}>삭제</Button>}
          </Typography>
        </div> */}
      </CardContent>
    </>
  );
};

export default Preview;
