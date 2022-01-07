import { useState, useEffect, useCallback } from "react";
import { collection, query, onSnapshot, getFirestore, orderBy } from "firebase/firestore";
import { COLLECTION_CHANNEL, COLLECTION_CATEGORY } from "../common/FirebaseUtil";

const CategoryDataHook = (channel) => {
  const [categoryList, setCategoryList] = useState([]);
  const fetchingData = useCallback(() => {
    if (channel) {
      const db = getFirestore();
      const contentRef = collection(db, COLLECTION_CHANNEL, String(channel), COLLECTION_CATEGORY);
      const contentQuery = query(contentRef, orderBy("id"));
      onSnapshot(contentQuery, (querySnapshot) => {
        const list = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          list.push(data);
        });
        setCategoryList(list);
      });
    }
  }, [channel]);

  useEffect(() => {
    fetchingData();
  }, [fetchingData]);

  return { categoryList };
};

export default CategoryDataHook;
