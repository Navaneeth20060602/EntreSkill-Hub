import api from "./api";

export async function fetchMyCertificates() {
  const { data } = await api.get("/certificates/mine");
  return data.data.certificates;
}

export async function fetchAllCertificates() {
  const { data } = await api.get("/certificates");
  return data.data.certificates;
}

export async function issueCertificate(formData) {
  const { data } = await api.post("/certificates", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data.certificate;
}
