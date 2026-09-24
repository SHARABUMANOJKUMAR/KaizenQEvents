export interface CertificateData {
  fullName: string;
  certificateId: string;
  completionDate: string;
  course: string;
  verificationUrl: string;
  pdfUrl: string;
}

export const certificateService = {
  getCertificateById: async (certificateId: string): Promise<CertificateData | null> => {
    // TODO: Connect this to the actual backend API using VITE_CERTIFICATE_API_URL
    // Example: const response = await fetch(`${import.meta.env.VITE_CERTIFICATE_API_URL}/certificates/${certificateId}`);

    // Temporary development data as requested
    if (certificateId === 'KQE-GH-2026-0001') {
      return {
        fullName: "S MANOJ KUMAR",
        certificateId: "KQE-GH-2026-0001",
        completionDate: "23-09-2026",
        course: "Git & GitHub Bootcamp",
        verificationUrl: "https://kaizenqevents.click/verify?cert=KQE-GH-2026-0001",
        pdfUrl: "" // Will test UI empty state for this or replace with a real test URL if needed
      };
    }

    // Return null if certificate not found
    return null;
  }
};
