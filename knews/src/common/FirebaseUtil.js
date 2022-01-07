import { initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { doc, updateDoc, collection, setDoc, getDoc, getFirestore, deleteDoc, writeBatch } from "firebase/firestore";

export const COLLECTION_CHANNEL = "channel";
export const COLLECTION_COMMENT = "comment";
export const COLLECTION_CONTENT = "content";
export const COLLECTION_ACCOUNT = "account";
export const COLLECTION_CATEGORY = "category";
export const initFirebaseApp = () => {
  const firebaseConfig = {
    apiKey: "AIzaSyAZdGUMtLzqNUlrWb5Np9KHMLhbMgfAVaY",
    authDomain: "knews-34d06.firebaseapp.com",
    projectId: "knews-34d06",
    storageBucket: "knews-34d06.appspot.com",
    messagingSenderId: "30092974859",
    appId: "1:30092974859:web:8bd34d07ae9b6834df200e",
    measurementId: "G-51R1XZYRH2",
  };
  // Initialize Firebase
  initializeApp(firebaseConfig);
};

export const addNews = async (channel, data) => {
  const db = getFirestore();
  const ref = collection(db, COLLECTION_CHANNEL, channel, COLLECTION_CONTENT);
  await setDoc(doc(ref, data.id), data);
};

export const updateNews = async (channel, data) => {
  const db = getFirestore();
  const ref = collection(db, COLLECTION_CHANNEL, channel, COLLECTION_CONTENT);
  await updateDoc(doc(ref, data.id), data);
};

const updateNewsImageUrl = async (channel, id, index, url) => {
  const db = getFirestore();
  const ref = collection(db, COLLECTION_CHANNEL, channel, COLLECTION_CONTENT);
  const updateData = {};
  updateData[`image_${index}`] = url;
  await updateDoc(doc(ref, id), updateData);
};

export const uploadFile = async (channel, id, file, index, callback) => {
  if (!file.file) {
    callback();
    return;
  }
  const path = `${channel}/content/${id}_${file.name}`;
  const storage = getStorage();
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file.file, {
    contentType: file.type,
  });
  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const progress = snapshot.bytesTransferred / snapshot.totalBytes;
      console.log(`upload is ${progress * 100}% done`);
    },
    (error) => {
      console.log(error);
    },
    async () => {
      console.log(`getDownloadUrl index ${index}`);
      const url = await getDownloadURL(uploadTask.snapshot.ref);
      await updateNewsImageUrl(channel, id, index, url);
    }
  );
};

export const uploadLogoFile = async (channel, file) => {
  if (!file.file) {
    return;
  }
  const path = `common/${channel}/logo/${channel.id}_${file.name}`;
  console.log(`path ${path}`);
  const storage = getStorage();
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file.file, {
    contentType: file.type,
  });
  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const progress = snapshot.bytesTransferred / snapshot.totalBytes;
      console.log(`upload is ${progress * 100}% done`);
    },
    (error) => {
      console.log(error);
    },
    async () => {
      const url = await getDownloadURL(uploadTask.snapshot.ref);
      await updateLogoImageUrl(channel.id, url);
    }
  );
};

const updateLogoImageUrl = async (id, url) => {
  const db = getFirestore();
  const ref = collection(db, COLLECTION_CHANNEL);
  const updateData = {};
  updateData[`logo`] = url;
  await updateDoc(doc(ref, id), updateData);
};

export const getChannel = async (channel) => {
  const db = getFirestore();
  const ref = doc(db, COLLECTION_CHANNEL, channel);
  const docSnap = await getDoc(ref);
  const data = docSnap.data();
  return data;
};

export const getNews = async (channel, id) => {
  const db = getFirestore();
  const ref = doc(db, COLLECTION_CHANNEL, channel, COLLECTION_CONTENT, id);
  const docSnap = await getDoc(ref);
  const data = docSnap.data();
  return data;
};

export const deleteNews = async (channel, id) => {
  const db = getFirestore();
  const ref = doc(db, COLLECTION_CHANNEL, channel, COLLECTION_CONTENT, id);
  await deleteDoc(ref);
};

export const addComment = async (channel, data) => {
  const db = getFirestore();
  const ref = collection(db, COLLECTION_CHANNEL, channel, COLLECTION_COMMENT);
  await setDoc(doc(ref, data.id), data);
};

export const deleteComment = async (channel, id) => {
  const db = getFirestore();
  const ref = doc(db, COLLECTION_CHANNEL, channel, COLLECTION_COMMENT, id);
  await deleteDoc(ref);
};

export const getAccount = async (email) => {
  const db = getFirestore();

  const ref = doc(db, COLLECTION_ACCOUNT, email);
  const docSnap = await getDoc(ref);
  const data = docSnap.data();
  return data;
};

export const addAccount = async (data) => {
  const db = getFirestore();
  const ref = collection(db, COLLECTION_ACCOUNT);
  await setDoc(doc(ref, data.id), data);
};

export const updateAccount = async (data) => {
  const db = getFirestore();
  const ref = collection(db, COLLECTION_ACCOUNT);
  await updateDoc(doc(ref, data.id), data);
};

export const updateAccountList = async (list, data) => {
  const db = getFirestore();
  const batch = writeBatch(db);
  let channel = data.channel;
  if (data.type === "normal") {
    channel = "";
  }
  list.forEach((mail) => {
    const ref = doc(db, COLLECTION_ACCOUNT, mail);
    batch.update(ref, {
      type: data.type,
      channel: channel,
    });
  });
  await batch.commit();
};

export const addCategory = async (channel, data) => {
  const db = getFirestore();
  const ref = collection(db, COLLECTION_CHANNEL, channel, COLLECTION_CATEGORY);
  await setDoc(doc(ref, data.id), data);
};

export const updateCategoryList = async (channel, list, data) => {
  data.open = data.open === "true";
  const db = getFirestore();
  const batch = writeBatch(db);
  list.forEach((category) => {
    let updateData = {};
    if (list.length === 1) {
      updateData = data;
    } else {
      updateData = {
        open: data.open,
      };
    }
    const ref = doc(db, COLLECTION_CHANNEL, channel, COLLECTION_CATEGORY, category);
    batch.update(ref, updateData);
  });
  await batch.commit();
};

export const deleteCategoryList = async (channel, list) => {
  const db = getFirestore();
  const batch = writeBatch(db);
  list.forEach((category) => {
    const ref = doc(db, COLLECTION_CHANNEL, channel, COLLECTION_CATEGORY, category);
    batch.delete(ref);
  });
  await batch.commit();
};

export const addChannel = async (data) => {
  const db = getFirestore();
  const ref = collection(db, COLLECTION_CHANNEL);
  await setDoc(doc(ref, data.id), data);
};

export const updateChannelList = async (list, data) => {
  console.log(`updateChannelList list ${list.length}`);
  const db = getFirestore();
  const batch = writeBatch(db);
  list.forEach((channel) => {
    let updateData = {};
    if (list.length === 1) {
      updateData = data;
    } else {
      updateData = {
        open: data.open === "true",
      };
    }
    console.log(`channel ${channel} updateDate ${JSON.stringify(updateData)}`);
    const ref = doc(db, COLLECTION_CHANNEL, channel);
    batch.update(ref, updateData);
  });
  await batch.commit();
};
export const deleteChannelList = async (list) => {
  const db = getFirestore();
  const batch = writeBatch(db);
  list.forEach((channel) => {
    const ref = doc(db, COLLECTION_CHANNEL, channel);
    batch.delete(ref);
  });
  await batch.commit();
};
