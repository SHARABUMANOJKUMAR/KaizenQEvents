export interface CertificateData {
  fullName: string;
  certificateId: string;
  completionDate: string;
  course: string;
  organization: string;
  verificationUrl: string;
  pdfUrl: string;
}

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxlZtIKCjqnijS0-Iw7GJnm70f0l4ak2OCrQrPX5AXyKYjTbJbefkUm0pGS8zXYvFhY/exec";

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
      const url = `${APPS_SCRIPT_URL}?action=verify&cert=${encodeURIComponent(certificateId)}`;
      const response = await fetchJSONP(url);
      
      console.log("Certificate ID:", certificateId);
      console.log("Certificate data:", response);

      if (response && response.success && response.certificate) {
        return response.certificate as CertificateData;
      }
      return null;
    } catch (err) {
      console.error("Error fetching certificate:", err);
      return null;
    }
  }
};
