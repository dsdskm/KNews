import { Card } from "@material-ui/core";
import { Button, CardContent, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "./Layout";
import { addNews, getNews, updateNews, uploadFile } from "../common/FirebaseUtil";
import Preview from "./Preview";
import { isImageLink } from "../common/Utils";
import CategoryDataHook from "../data/CategoryDataHook";

const TITLE = "title";
const CONTENT = "content";
const OPEN_VALUE = ["0", "1"];
const WRITER = "writer";

const Edit = () => {
  const navigate = useNavigate();
  const params = useParams();
  const channel = params.channel;
  const category = params.category;
  const { categoryList } = CategoryDataHook(channel);
  const id = params.id;
  const isEditMode = id !== "-1";
  const fileRef = useRef();
  const [data, setData] = useState({
    channel: channel,
    category: category,
    title: "",
    time: new Date(),
    writer: "",
    open: true,
    contents: [],
  });
  const [imageFile, setImageFile] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [contentArr, setContentArr] = useState([]);
  const [previewShow, setPreviewShow] = useState(false);
  const [categoryName, setCategoryName] = useState(0);
  useEffect(() => {
    const loadData = async () => {
      if (isEditMode) {
        const news = await getNews(channel, id);
        if (news) {
          setData(news);
          const arr = [];
          if (news.contents) {
            news.contents.forEach((item) => {
              if (isImageLink(item)) {
                arr.push("image");
              } else {
                arr.push("text");
              }
            });
            setContentArr(arr);
          }
        }
      }
      if (categoryList) {
        const categoryNameResult = categoryList.filter((c) => c.id === String(category));
        if (categoryNameResult.length > 0) {
          setCategoryName(categoryNameResult[0].name);
        }
      }
    };
    loadData();
  }, [channel, id, isEditMode, categoryList, category]);
  const onChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    const id = e.target.id;
    switch (name) {
      case TITLE:
        data.title = value;
        break;
      case CONTENT:
        data.contents[id] = value;
        break;
      case WRITER:
        data.writer = value;
        break;
      default:
        break;
    }
    setData({ ...data });
  };

  const onToggleChange = (e) => {
    const value = e.target.value;
    data.open = value === "1";
    setData({ ...data });
  };

  const goCategory = () => {
    navigate(`/${channel}/content/${category}`);
  };

  const onCancelClick = (e) => {
    goCategory();
  };

  const onPrevieClick = (e) => {
    setPreviewShow(!previewShow);
  };

  const onRegisterClick = async (e) => {
    if (!data.title) {
      alert("기사 제목을 입력하세요");
      return;
    } else if (!data.contents) {
      alert("기사 내용을 입력하세요");
      return;
    }
    setUpdating(true);

    data.id = isEditMode ? id : String(new Date().getTime());
    data.time = new Date().getTime();
    if (isEditMode) {
      await updateNews(channel, data);
    } else {
      await addNews(channel, data);
    }
    imageFile.forEach(async (file, index) => {
      await uploadFile(channel, data.id, file, index, () => {});
    });
    setUpdating(false);
    goCategory();
  };

  const onFileChange = (event) => {
    const id = event.target.id;
    const index = Number(id);
    let reader = new FileReader();
    let file = event.target.files[0];
    let name = event.target.files[0].name;
    reader.onloadend = (e) => {
      const imageArr = imageFile.slice();

      imageArr[index] = {
        file: file,
        name: name,
        result: reader.result,
      };
      setImageFile(imageArr);
      data.contents[index] = `image_${index}`;
      setData({ ...data });
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };
  if (!data) {
    return <></>;
  }
  const open = data && data.open ? "1" : "0";

  const onDeleteClick = (e) => {
    const id = e.target.id;
    const index = Number(id);
    const arr = contentArr.filter((v, i) => i !== index);
    data.contents = data.contents.filter((v, i) => i !== index);
    const imageArr = imageFile.filter((v, i) => i !== index);
    setImageFile(imageArr);
    setContentArr(arr);
    setData({ ...data });
  };

  const getContentText = (num) => {
    const index = num;
    num = String(num);
    return (
      <>
        <div style={{ marginTop: 10 }}>
          <TextField fullWidth multiline id={num} name={CONTENT} value={data.contents[index]} onChange={onChange} />
          <div style={{ display: "flex", justifyContent: "end" }}>
            <Button onClick={onDeleteClick} name={CONTENT} id={num} variant="contained" color="error">
              삭제
            </Button>
          </div>
        </div>
      </>
    );
  };

  const getContentImage = (num) => {
    const index = num;
    num = String(num);
    const imageIndex = data.contents[index];
    const imagePath = data[imageIndex];
    let imageContent;
    if (imageFile && imageFile[num]) {
      imageContent = <img alt="newsImage" width="50%" height="50%" src={imageFile[num].result} />;
    } else {
      if (imagePath) {
        imageContent = <img width="50%" height="50%" src={imagePath} alt="news" />;
      }
    }
    return (
      <>
        <div style={{ marginTop: 10 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {imageContent}
            <input name={CONTENT} id={num} type="file" onChange={onFileChange} ref={fileRef} />
            {/* <Button name={content_id} size="small" color="error" style={{ width: "100px" }} onClick={onFileResetClick}>
            Reset
          </Button> */}
            <div style={{ display: "flex", justifyContent: "end" }}>
              <Button onClick={onDeleteClick} name={CONTENT} id={num} variant="contained" color="error">
                삭제
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  };
  const onContentAddClick = (e) => {
    const name = e.target.name;
    const arr = contentArr.slice();
    arr.push(name);
    const imageArr = imageFile.slice();
    imageArr.push({});
    setContentArr(arr);
    setImageFile(imageArr);
  };
  return (
    <Layout>
      <Card>
        <CardContent>
          {!previewShow && (
            <>
              <Typography sx={{ fontSize: 14 }} color="text.primary" gutterBottom>
                채널
              </Typography>
              <TextField disabled value={channel} />
              <Typography sx={{ fontSize: 14, marginTop: 3 }} color="text.primary" gutterBottom>
                카테고리
              </Typography>
              <TextField disabled value={categoryName} />

              <Typography sx={{ fontSize: 14, marginTop: 3 }} color="text.primary" gutterBottom>
                기사 제목
              </Typography>
              <TextField fullWidth name={TITLE} value={data.title} onChange={onChange} />
              <Typography sx={{ fontSize: 14, marginTop: 3 }} color="text.primary" gutterBottom>
                기사 내용
              </Typography>
              {contentArr &&
                contentArr.map((c, index) => {
                  if (c === "text") {
                    return getContentText(index);
                  } else {
                    return getContentImage(index);
                  }
                })}
              <Typography sx={{ fontSize: 14, marginTop: 3 }} color="text.primary" gutterBottom align="center">
                <Button name="text" onClick={onContentAddClick}>
                  글 추가
                </Button>
                <Button name="image" onClick={onContentAddClick}>
                  이미지 추가
                </Button>
              </Typography>

              {/* <Typography sx={{ fontSize: 14 }} color="text.primary" gutterBottom>
            공개 시간
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              renderInput={(props) => <TextField {...props} />}
              value={data.time}
              onChange={(newValue) => {
                data.time = newValue;
                setData({ ...data });
              }}
            />
          </LocalizationProvider> */}
              <Typography sx={{ fontSize: 14, marginTop: 3 }} color="text.primary" gutterBottom>
                공개 여부
              </Typography>
              <ToggleButtonGroup color="primary" value={open} exclusive onChange={onToggleChange}>
                <ToggleButton style={{ width: 100, height: 50 }} value={OPEN_VALUE[1]}>
                  예
                </ToggleButton>
                <ToggleButton style={{ width: 100, height: 50 }} value={OPEN_VALUE[0]}>
                  아니오
                </ToggleButton>
              </ToggleButtonGroup>
              <Typography sx={{ fontSize: 14, marginTop: 3 }} color="text.primary" gutterBottom>
                기자 이름
              </Typography>
              <TextField name={WRITER} value={data.writer} onChange={onChange} />
            </>
          )}
          {previewShow && <Preview data={data} imageFile={imageFile} />}

          <div style={{ marginTop: 20, display: "flex", justifyContent: "end" }}>
            <Typography sx={{ fontSize: 14 }} color="text.primary" gutterBottom>
              {!previewShow && <Button onClick={onCancelClick}>취소</Button>}
              <Button onClick={onPrevieClick}>{previewShow ? "확인" : "미리보기"}</Button>
              {!previewShow && (
                <Button disabled={updating} onClick={onRegisterClick}>
                  {isEditMode ? "수정" : "등록"}
                </Button>
              )}
            </Typography>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Edit;
