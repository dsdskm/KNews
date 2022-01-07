export const goLink = (path) => {
  window.location.href = path;
};

export const isImageLink = (value) => {
  return value.startsWith("image_");
};

export const isTextLink = (value) => {
  return value.startsWith("http");
};

export const getDateText = (mil) => {
  const date = new Date(Number(mil));
  return date.toLocaleString();
};

export const getMarkedWriter = (writer) => {
  const pre = writer.substring(0, 3);
  return writer.replace(pre, "xxx");
};

export const isEditMode = (channel, account) => {
  if (account.type === "master") {
    return true;
  } else if (account.type === "manager" && account.channel === channel) {
    return true;
  }
  return false;
};

export const getEmailBody = (receiver, subject,text) => {
  const data = {
    data: {
      email: receiver,
      subject: subject,
      text: text,
    },
  };
  return data;
};
