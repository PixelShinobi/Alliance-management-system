from sqlalchemy import Column, Integer, String, Float
from .database import Base


class AllianceMember(Base):
    """Alliance Member database model"""
    __tablename__ = "alliance_members"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, index=True, nullable=False)
    member_id = Column(Integer, unique=True, nullable=False, index=True)
    power = Column(Integer, nullable=False, default=0)
    merits = Column(Integer, nullable=False, default=0)
    units_killed = Column(Integer, nullable=False, default=0)
    units_dead = Column(Integer, nullable=False, default=0)
