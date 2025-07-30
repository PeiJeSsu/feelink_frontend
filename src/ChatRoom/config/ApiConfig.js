import axios from 'axios';

export const apiConfig = axios.create({
	baseURL: `https://feelink-backend.onrender.com`
});