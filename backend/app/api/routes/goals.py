from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db_session
from app.models.user import User
from app.schemas.goal import GoalContribution, GoalCreate, GoalOut, GoalUpdate
from app.services import goal_service

router = APIRouter(prefix="/api/v1/goals", tags=["goals"])


@router.get("", response_model=list[GoalOut])
def get_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    return goal_service.get_goals(db, current_user.id)


@router.post("", response_model=GoalOut, status_code=201)
def create_goal(
    goal_in: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    return goal_service.create_goal(db, current_user.id, goal_in)


@router.put("/{goal_id}", response_model=GoalOut)
def update_goal(
    goal_id: int,
    goal_in: GoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    return goal_service.update_goal(db, current_user.id, goal_id, goal_in)


@router.delete("/{goal_id}")
def delete_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    deleted = goal_service.delete_goal(db, current_user.id, goal_id)
    return {"deleted": deleted}


@router.post("/{goal_id}/contribute", response_model=GoalOut)
def contribute_to_goal(
    goal_id: int,
    contribution: GoalContribution,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    return goal_service.contribute_to_goal(db, current_user.id, goal_id, contribution)
