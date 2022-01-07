import { useState, useEffect, useCallback } from "react";
import { collection, query, where, onSnapshot, getFirestore, orderBy } from "firebase/firestore";
import { COLLECTION_CHANNEL, COLLECTION_COMMENT } from "../common/FirebaseUtil";

const CommentDataHook = (channel, category, newsId) => {
  const [commentList, setCommentList] = useState([]);
  const fetchingData = useCallback(() => {
    const db = getFirestore();
    const commentRef = collection(db, COLLECTION_CHANNEL, channel, COLLECTION_COMMENT);
    const commentQuery = query(
      commentRef,
      where("channel", "==", channel),
      where("category", "==", category),
      where("news_id", "==", String(newsId)),
      orderBy("time", "desc")
    );
    onSnapshot(commentQuery, (querySnapshot) => {
      const list = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        list.push(data);
      });
      setCommentList(list);
    });
  }, [channel, category, newsId]);

  useEffect(() => {
    fetchingData();
  }, [fetchingData]);

  return { commentList };
};

export default CommentDataHook;
