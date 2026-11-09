from collections.abc import Callable
from types import TracebackType
from sqlmodel import Session
from app.core.database import session_factory


class UnitOfWork:
    def __init__(
        self, session_creator: Callable[[], Session] = session_factory
    ) -> None:
        self._session_creator = session_creator
        self.session: Session | None = None

    def __enter__(self) -> "UnitOfWork":
        self.session = self._session_creator()
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: TracebackType | None,
    ) -> None:
        if self.session is None:
            return
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
            self.session = None