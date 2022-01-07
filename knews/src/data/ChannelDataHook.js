import { useState, useEffect, useCallback } from "react";
import { collection, query, onSnapshot, getFirestore, orderBy } from "firebase/firestore";
import { COLLECTION_CHANNEL } from "../common/FirebaseUtil";

const ChannelDataHook = () => {
  const [channelList, setChannelList] = useState([]);
  const fetchingData = useCallback(() => {
    const db = getFirestore();
    const contentRef = collection(db, COLLECTION_CHANNEL);
    const contentQuery = query(contentRef, orderBy("id"));
    onSnapshot(contentQuery, (querySnapshot) => {
      const list = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        list.push(data);
      });
      setChannelList(list);
    });
  }, []);

  useEffect(() => {
    fetchingData();
  }, [fetchingData]);

  return { channelList };
};

export default ChannelDataHook;
