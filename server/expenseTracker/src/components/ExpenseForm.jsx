import { useState } from "react";
import PropTypes from "prop-types";

function ExpenseForm({ onAddExpense }) {
    const [description, setDescription ] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (description && amount && date) {
            const newExpense = { description, amount: parseFloat(amount), date };
            await onAddExpense(newExpense);
            setDescription("");
            setAmount("");
            setDate("");
        } else {
            alert("Please fill out all fields");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Add Expense</h2>
            <label>Description:
                <input 
                    type="text" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </label>
            <label>
                Amount:
                <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    step="0.1"
                />
            </label>
            <label>
                Date:
                <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />
            </label>
            <button type="submit">Add Expense</button>
        </form>
    );
}

ExpenseForm.propTypes = {
    onAddExpense: PropTypes.func.isRequired,
};

export default ExpenseForm;