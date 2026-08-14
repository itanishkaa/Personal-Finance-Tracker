"""
Default categories created for every new user on registration, per PRD
section 12. (icon, name) pairs, split by type.
"""

DEFAULT_EXPENSE_CATEGORIES: list[tuple[str, str]] = [
    ("🍔", "Food"),
    ("🛍️", "Shopping"),
    ("🚌", "Transport"),
    ("🧾", "Bills"),
    ("🎬", "Entertainment"),
    ("🏥", "Healthcare"),
    ("🎓", "Education"),
    ("✈️", "Travel"),
    ("🛒", "Groceries"),
    ("📦", "Other"),
]

DEFAULT_INCOME_CATEGORIES: list[tuple[str, str]] = [
    ("💼", "Salary"),
    ("💻", "Freelance"),
    ("🏢", "Business"),
    ("📈", "Investment"),
    ("📦", "Other"),
]
