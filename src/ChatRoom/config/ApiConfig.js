import axios from "axios";

export const apiConfig = axios.create({
	baseURL: process.env.REACT_APP_API_BASE_URL,
	//baseURL:"http://localhost:8080"
});
