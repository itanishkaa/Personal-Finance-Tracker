import axios from 'axios';

const API_URL = "http://localhost:8000/api/expenses";

export const getExpenses = async (startDate, endDate) => {
    try {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate; 
        const response = await axios.get(API_URL, {
            params
        });
        return response.data;
    } catch (error) {
        console.error(
            "Error fetching expenses:",
            error.response ? error.response.data : error.message
        );
        throw error;
    }
};

export const addExpense = async (expense) => {
    try {
        const response = await axios.post(API_URL, expense);
        return response.data;
    } catch (error) {
        console.error(
            "Error adding expense:",
            error.response ? error.response.data : error.message
        );
        throw error;
    }
};

export const updateExpense = async (id, updatedExpense) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, updatedExpense);
        return response.data;
    } catch (error) {
        console.error(
            "Error updating expenses:",
            error.response ? error.response.data : error.message
        );
        throw error;
    }
};

export const deleteExpense = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(
            "Error deleting expenses:",
            error.response ? error.response.data : error.message
        );
        throw error;
    }
};