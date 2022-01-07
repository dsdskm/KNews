import { useState, useEffect, useCallback } from "react";
import { collection, query, where, onSnapshot, getFirestore, orderBy } from "firebase/firestore";
import { COLLECTION_CHANNEL, COLLECTION_CONTENT } from "../common/FirebaseUtil";

const ContentDataHook = (channel, category) => {
  const [contentList, setContentList] = useState([]);
  const fetchingData = useCallback(() => {
    const db = getFirestore();
    const contentRef = collection(db, COLLECTION_CHANNEL, channel, COLLECTION_CONTENT);
    const contentQuery = query(
      contentRef,
      where("channel", "==", channel),
      where("category", "==", category),
      orderBy("time", "desc")
    );
    onSnapshot(contentQuery, (querySnapshot) => {
      const list = [];
      if (category.open) {
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          list.push(data);
        });
      }
      setContentList(list);
    });
  }, [channel, category]);

  useEffect(() => {
    fetchingData();
  }, [fetchingData]);

  return { contentList };
};

export default ContentDataHook;
