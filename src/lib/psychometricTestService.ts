import { PsychometricTest } from '@/lib/types';
import api from './api';

const API_BASE_URL = '/admin/psychometric-tests';

export const psychometricTestService = {
  async getTestByCandidateId(candidateId: number): Promise<PsychometricTest | null> {
    try {
      const response = await api.get(`${API_BASE_URL}/candidate/${candidateId}`);
      return response.data.data || null;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching psychometric test:', error);
      throw error;
    }
  },

  async getAllTestsByCandidateId(candidateId: number): Promise<PsychometricTest[]> {
    try {
      const response = await api.get(`${API_BASE_URL}/candidate/${candidateId}/all`);
      return response.data.data || [];
    } catch (error: any) {
      if (error.response?.status === 404) return [];
      console.error('Error fetching psychometric tests:', error);
      return [];
    }
  },

  async sendTest(data: {
    postulante_id: number;
    job_offer_id?: number;
    test_link: string;
  }): Promise<PsychometricTest> {
    try {
      const response = await api.post(`${API_BASE_URL}/send`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error sending psychometric test:', error);
      throw error;
    }
  },

  async deleteTest(testId: number): Promise<void> {
    try {
      await api.delete(`${API_BASE_URL}/${testId}`);
    } catch (error) {
      console.error('Error deleting psychometric test:', error);
      throw error;
    }
  },

  async updateTestStatus(
    testId: number,
    status: 'pending' | 'sent' | 'completed' | 'expired',
    resultsLink?: string
  ): Promise<PsychometricTest> {
    try {
      const response = await api.patch(`${API_BASE_URL}/${testId}/status`, {
        status,
        results_link: resultsLink,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating test status:', error);
      throw error;
    }
  },

  async getTestHistory(candidateId: number): Promise<PsychometricTest[]> {
    try {
      const response = await api.get(`${API_BASE_URL}/candidate/${candidateId}/history`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching test history:', error);
      return [];
    }
  }
};
