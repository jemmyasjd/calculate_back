const generateFormId = (length = 10) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let formId = "";
  for (let i = 0; i < length; i++) {
    formId += chars[Math.floor(Math.random() * chars.length)];
  }
  return formId;
};

module.exports = {
  generateFormId
};