export const contactSubmissions = [];

export const addContactSubmission = (submission) => {
  const newSubmission = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    ...submission,
    status: 'nuevo' // nuevo, leído, respondido
  };
  contactSubmissions.push(newSubmission);
  return newSubmission;
};

export const getContactSubmissions = () => {
  return contactSubmissions;
};