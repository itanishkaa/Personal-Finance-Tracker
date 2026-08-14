from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

CategoryType = Literal["income", "expense"]


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    type: CategoryType
    icon: str | None = Field(default=None, max_length=10)


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(CategoryBase):
    pass


class CategoryOut(CategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
