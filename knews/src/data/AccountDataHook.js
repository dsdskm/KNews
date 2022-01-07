import { useState, useEffect, useCallback } from "react";
import { collection, query, onSnapshot, getFirestore, orderBy } from "firebase/firestore";
import { COLLECTION_ACCOUNT } from "../common/FirebaseUtil";

const AccountDataHook = () => {
  const [accountList, setAccountList] = useState([]);
  const fetchingData = useCallback(() => {
    const db = getFirestore();
    const contentRef = collection(db, COLLECTION_ACCOUNT);
    const contentQuery = query(contentRef, orderBy("type"));
    onSnapshot(contentQuery, (querySnapshot) => {
      const list = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.type !== "master") {
          list.push(data);
        }
      });
      setAccountList(list);
    });
  }, []);

  useEffect(() => {
    fetchingData();
  }, [fetchingData]);

  return { accountList };
};

export default AccountDataHook;
