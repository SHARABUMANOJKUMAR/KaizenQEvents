export interface CertificateData {
  fullName: string;
  certificateId: string;
  completionDate: string;
  course: string;
  organization: string;
  verificationUrl: string;
  pdfUrl: string;
}

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbxlZtIKCjqnijS0-Iw7GJnm70f0l4ak2OCrQrPX5AXyKYjTbJbefkUm0pGS8zXYvFhY/exec";
const PYTHON_CERT_API = "https://script.google.com/macros/s/AKfycbyH1IP4W8EcYLTbHgb7Zr9LCkScGjZsy8zkMN-kieJG8HzogK-YqSlzLsi-Llz524qqng/exec";
const JAVA_AI_CERT_API = import.meta.env.VITE_CERTIFICATE_API_URL || "https://script.google.com/macros/s/AKfycbxTKcxuXQeLAV29FmKHvsWL76hdKweJZfnkye8EVdmG4clbMuaL2umKYlaOOFk0-UFU/exec";

const fetchJSONP = (url: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    const script = document.createElement('script');
    
    // Setup callback
    (window as any)[callbackName] = (data: any) => {
      delete (window as any)[callbackName];
      document.body.removeChild(script);
      resolve(data);
    };

    // Handle errors
    script.onerror = () => {
      delete (window as any)[callbackName];
      document.body.removeChild(script);
      reject(new Error('JSONP request failed'));
    };

    script.src = `${url}&callback=${callbackName}`;
    document.body.appendChild(script);
  });
};

export const certificateService = {
  getCertificateById: async (certificateId: string): Promise<CertificateData | null> => {
    try {
      console.log("Certificate ID:", certificateId);
      
      // Handle Python Certificates
      if (certificateId.toUpperCase().startsWith("KQE-PY-")) {
        const url = `${PYTHON_CERT_API}?action=verify&cert=${encodeURIComponent(certificateId)}`;
        try {
          const data = await fetchJSONP(url);
          console.log("Python Certificate data:", data);
          
          if (data && data.certificate) return data.certificate as CertificateData;
          if (data && (data.valid || data.success || data.CertificateID || data.certificateId)) {
            return {
              fullName: data.fullName || data["Full Name"] || data.name || "",
              certificateId: data.certificateId || data.CertificateID || data["Certificate ID"] || certificateId,
              completionDate: data.completionDate || data.Date || data["Completion Date"] || "",
              course: data.course || data.Program || data.courseName || "Python with AI Bootcamp",
              organization: data.organization || data.IssuedBy || "Kaizen Q Events",
              verificationUrl: data.verificationUrl || data["Verification URL"] || "",
              pdfUrl: data.pdfUrl || data["PDF URL"] || data.pdf_url || ""
            };
          }
        } catch (fetchError) {
          console.error("fetchJSONP failed for Python cert:", fetchError);
          throw fetchError;
        }
        return null;
      }
      
      // Handle Java AI Certificates
      if (certificateId.toUpperCase().startsWith("KQE-JAI-")) {
        const url = `${JAVA_AI_CERT_API}?action=verify&cert=${encodeURIComponent(certificateId)}`;
        try {
          const data = await fetchJSONP(url);
          console.log("Java AI Certificate data:", data);
          
          if (data && data.certificate) return data.certificate as CertificateData;
          if (data && (data.valid || data.success || data.CertificateID || data.certificateId)) {
            return {
              fullName: data.fullName || data["Full Name"] || data.name || "",
              certificateId: data.certificateId || data.CertificateID || data["Certificate ID"] || certificateId,
              completionDate: data.completionDate || data.Date || data["Completion Date"] || "",
              course: data.course || data.Program || data.courseName || "Java with AI Bootcamp",
              organization: data.organization || data.IssuedBy || "Kaizen Q Events",
              verificationUrl: data.verificationUrl || data["Verification URL"] || "",
              pdfUrl: data.pdfUrl || data["PDF URL"] || data.pdf_url || ""
            };
          }
        } catch (fetchError) {
          console.error("fetchJSONP failed for Java AI cert:", fetchError);
          throw fetchError;
        }
        return null;
      }
      
      // Default / Legacy Certificates (GitHub, etc.)
      const url = `${APPS_SCRIPT_URL}?action=verify&cert=${encodeURIComponent(certificateId)}`;
      const response = await fetchJSONP(url);
      
      console.log("Legacy Certificate data:", response);

      if (response && response.success && response.certificate) {
        return response.certificate as CertificateData;
      }
      return null;
    } catch (err) {
      console.error("Error fetching certificate:", err);
      throw err;
    }
  }
};
