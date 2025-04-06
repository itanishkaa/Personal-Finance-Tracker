import PropTypes from "prop-types";
import "./ExpenseList.css";

function ExpenseList({ expenses, onExpenseUpdated, onExpenseDeleted }) {
    const handleUpdate = (expense) => {
        const updatedDescription = prompt(
            "Enter new description:",
            expense.description
        );
        const updatedAmount = parseFloat(
            prompt("Enter new amount:", expense.amount)
        );
        const updatedDate = prompt("Enter new date (YYYY-MM-DD):", expense.date);
        
        if (updatedDescription && updatedAmount && updatedDate) {
            onExpenseUpdated(expense.id, {
                ...expense,
                description: updatedDescription,
                amount: updatedAmount,
                date: updatedDate,
            });
        }
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this expense?")) {
            onExpenseDeleted(id);
        }
    };

    return (
        <div className="expense-list">
            {expenses.length === 0 ? (
                <p>No expenses available.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.map((expense) => (
                            <tr key={expense.id}>
                                <td>{new Date(expense.date).toLocaleDateString()}</td>
                                <td>₹ {expense.amount.toFixed(2)}</td>
                                <td>{expense.description}</td>
                                <td>
                                    <button onClick={() => handleUpdate(expense)}>Update</button>
                                    <button onClick={() => handleDelete(expense.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

ExpenseList.propTypes = {
    expenses: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            date: PropTypes.string.isRequired,
            amount: PropTypes.number.isRequired,
            description: PropTypes.string.isRequired,
        })
    ).isRequired,
    onExpenseUpdated: PropTypes.func.isRequired,
    onExpenseDeleted: PropTypes.func.isRequired,
};

export default ExpenseList;