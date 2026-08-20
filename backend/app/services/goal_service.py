from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.goal import Goal
from app.schemas.goal import GoalContribution, GoalCreate, GoalOut, GoalStatus, GoalUpdate


def _status_for(current_amount: float, target_amount: float) -> GoalStatus:
    return "completed" if current_amount >= target_amount else "active"


def _to_goal_out(goal: Goal) -> GoalOut:
    remaining = goal.target_amount - goal.current_amount
    progress_percent = (
        (goal.current_amount / goal.target_amount * 100) if goal.target_amount > 0 else 0.0
    )
    return GoalOut(
        id=goal.id,
        name=goal.name,
        target_amount=goal.target_amount,
        current_amount=goal.current_amount,
        remaining_amount=remaining,
        progress_percent=progress_percent,
        target_date=goal.target_date,
        status=goal.status,
        created_at=goal.created_at,
        updated_at=goal.updated_at,
    )


def get_goals(db: Session, user_id: int) -> list[GoalOut]:
    stmt = (
        select(Goal)
        .where(Goal.user_id == user_id)
        .order_by(Goal.target_date.asc())
    )
    goals = db.execute(stmt).scalars().all()
    return [_to_goal_out(g) for g in goals]


def _get_goal_or_404(db: Session, user_id: int, goal_id: int) -> Goal:
    stmt = select(Goal).where(Goal.id == goal_id, Goal.user_id == user_id)
    goal = db.execute(stmt).scalar_one_or_none()
    if goal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Goal not found for this id :: {goal_id}",
        )
    return goal


def create_goal(db: Session, user_id: int, goal_in: GoalCreate) -> GoalOut:
    goal = Goal(
        user_id=user_id,
        name=goal_in.name,
        target_amount=goal_in.target_amount,
        current_amount=goal_in.current_amount,
        target_date=goal_in.target_date,
        status=_status_for(goal_in.current_amount, goal_in.target_amount),
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return _to_goal_out(goal)


def update_goal(db: Session, user_id: int, goal_id: int, goal_in: GoalUpdate) -> GoalOut:
    goal = _get_goal_or_404(db, user_id, goal_id)

    goal.name = goal_in.name
    goal.target_amount = goal_in.target_amount
    goal.target_date = goal_in.target_date
    # current_amount is untouched by edits - only contribute_to_goal moves
    # it - but the target may have changed, so status needs re-deriving.
    goal.status = _status_for(goal.current_amount, goal.target_amount)

    db.commit()
    db.refresh(goal)
    return _to_goal_out(goal)


def contribute_to_goal(
    db: Session, user_id: int, goal_id: int, contribution: GoalContribution
) -> GoalOut:
    goal = _get_goal_or_404(db, user_id, goal_id)

    goal.current_amount += contribution.amount
    goal.status = _status_for(goal.current_amount, goal.target_amount)

    db.commit()
    db.refresh(goal)
    return _to_goal_out(goal)


def delete_goal(db: Session, user_id: int, goal_id: int) -> bool:
    goal = _get_goal_or_404(db, user_id, goal_id)
    db.delete(goal)
    db.commit()
    return True
